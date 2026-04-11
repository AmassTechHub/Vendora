import { useEffect, useRef, useState, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Search, Trash2, Printer, UserCheck, X, ShoppingCart, UserPlus, CreditCard, Smartphone, Banknote } from 'lucide-react';
function loadSettings() {
  try {
    const s = localStorage.getItem('vendora-settings');
    return s ? JSON.parse(s) : {};
  } catch { return {}; }
}

function loadPaystack(key, opts) {
  return new Promise((resolve, reject) => {
    const handler = window.PaystackPop?.setup({
      key,
      email: opts.email,
      amount: Math.round(opts.amount * 100),
      currency: 'GHS',
      ref: `VND-${Date.now()}`,
      metadata: { custom_fields: [{ display_name: 'Store', variable_name: 'store', value: opts.storeName }] },
      callback: (res) => resolve(res),
      onClose: () => reject(new Error('Payment cancelled')),
    });
    if (!handler) { reject(new Error('Paystack not loaded')); return; }
    handler.openIframe();
  });
}

export default function Cashier() {
  const [query, setQuery]             = useState('');
  const [products, setProducts]       = useState([]);
  const [cart, setCart]               = useState([]);
  const [discount, setDiscount]       = useState(0);
  const [paymentMethod, setPayment]   = useState('CASH');
  const [amountPaid, setAmountPaid]   = useState('');
  const [receipt, setReceipt]         = useState(null);
  const [customer, setCustomer]       = useState(null);
  const [custQuery, setCustQuery]     = useState('');
  const [custResults, setCustResults] = useState([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickName, setQuickName]     = useState('');
  const [paystackEmail, setPaystackEmail] = useState('');
  const [processing, setProcessing]   = useState(false);
  const searchRef = useRef(null);

  // Load Paystack script once
  useEffect(() => {
    if (!document.getElementById('paystack-js')) {
      const s = document.createElement('script');
      s.id = 'paystack-js';
      s.src = 'https://js.paystack.co/v1/inline.js';
      document.head.appendChild(s);
    }
  }, []);

  const [searching, setSearching] = useState(false);

  const searchProducts = useCallback(async (q = query) => {
    if (!q.trim()) { setProducts([]); return; }
    setSearching(true);
    try {
      const { data } = await api.get(`/products/search?q=${encodeURIComponent(q)}`);
      setProducts(data);
      if (data.length === 0) toast('No products found for "' + q + '"', { icon: '🔍' });
    } catch (err) {
      toast.error('Search failed: ' + (err.response?.data?.error || err.message));
    } finally { setSearching(false); }
  }, [query]);

  // Auto-search as user types (debounced 300ms)
  useEffect(() => {
    if (!query.trim()) { setProducts([]); return; }
    const t = setTimeout(() => searchProducts(query), 300);
    return () => clearTimeout(t);
  }, [query]); // eslint-disable-line

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') {
      if (query.match(/^\d{4,}$/)) searchByBarcode(query);
      else searchProducts(query);
    }
  };

  const searchByBarcode = async (barcode) => {
    try {
      const { data } = await api.get(`/products/barcode/${barcode}`);
      addToCart(data);
    } catch { toast.error('Product not found for barcode: ' + barcode); }
  };

  const addToCart = (product) => {
    if (product.quantity <= 0) return toast.error('Out of stock');
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) { toast.error('Not enough stock'); return prev; }
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setProducts([]); setQuery('');
    searchRef.current?.focus();
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart(prev => prev.map(i => i.product.id === id ? { ...i, quantity: qty } : i));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.product.id !== id));

  const clearCart = () => {
    setCart([]); setDiscount(0); setAmountPaid('');
    setCustomer(null); setCustQuery(''); setCustResults([]);
    setReceipt(null); setPaystackEmail(''); setQuery(''); setProducts([]);
  };

  const searchCustomers = async () => {
    if (!custQuery.trim()) return;
    try {
      const { data } = await api.get(`/customers/search?q=${encodeURIComponent(custQuery)}`);
      setCustResults(data);
      if (data.length === 0) { setShowQuickAdd(true); setQuickName(''); }
    } catch { toast.error('Customer search failed'); }
  };

  const quickAddCustomer = async (e) => {
    e.preventDefault();
    if (!quickName.trim()) return toast.error('Enter customer name');
    try {
      const { data } = await api.post('/customers', { name: quickName.trim(), phone: custQuery.trim() });
      setCustomer(data);
      if (data.email) setPaystackEmail(data.email);
      setShowQuickAdd(false); setCustResults([]); setCustQuery('');
      toast.success('Customer added');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to add customer'); }
  };

  const subtotal = cart.reduce((s, i) => s + parseFloat(i.product.price) * i.quantity, 0);
  const settings = loadSettings();
  const taxRate  = parseFloat(settings.taxRate || 0);
  const taxAmt   = subtotal * taxRate / 100;
  const total    = Math.max(0, subtotal + taxAmt - discount);
  const change   = amountPaid ? parseFloat(amountPaid) - total : 0;

  useEffect(() => { if (customer?.email) setPaystackEmail(customer.email); }, [customer]);

  const checkout = async () => {
    if (cart.length === 0) return toast.error('Add products to cart first');
    if (paymentMethod === 'CASH') {
      if (!amountPaid || parseFloat(amountPaid) <= 0) return toast.error('Enter amount paid');
      if (parseFloat(amountPaid) < total) return toast.error(`Amount paid (GH₵${parseFloat(amountPaid).toFixed(2)}) is less than total (GH₵${total.toFixed(2)})`);
    }
    if ((paymentMethod === 'CARD' || paymentMethod === 'MOBILE_MONEY') && !paystackEmail) {
      return toast.error('Enter customer email for Paystack payment');
    }

    setProcessing(true);
    try {
      // Paystack flow for CARD / MOBILE_MONEY
      if (paymentMethod === 'CARD' || paymentMethod === 'MOBILE_MONEY') {
        const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
        if (!key) {
          toast.error('Paystack key not set — use Cash payment for now, or add VITE_PAYSTACK_PUBLIC_KEY in Vercel env vars');
          setProcessing(false);
          return;
        }
        try {
          const psRes = await loadPaystack(key, {
            email: paystackEmail,
            amount: total,
            storeName: settings.storeName || 'Vendora',
          });
          const { data: verifyData } = await api.post('/payments/paystack/verify-and-create', {
            reference: psRes.reference,
            sale: {
              customerId: customer?.id || null,
              items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity })),
              discount,
              paymentMethod,
              amountPaid: total,
            },
          });
          setReceipt(verifyData.sale);
        } catch (err) {
          if (err.message === 'Payment cancelled') { toast.error('Payment cancelled'); setProcessing(false); return; }
          throw err;
        }
      } else {
        // CASH — always works, no external service needed
        const { data } = await api.post('/sales', {
          customerId: customer?.id || null,
          items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity })),
          discount,
          paymentMethod,
          amountPaid: parseFloat(amountPaid),
        });
        setReceipt(data);
      }
      clearCart();
      toast.success('Sale completed!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Checkout failed');
    } finally { setProcessing(false); }
  };

  const printReceipt = () => {
    const s = loadSettings();
    const w = window.open('', '_blank', 'width=420,height=650');
    const items = receipt.items?.map(item =>
      `<tr><td>${item.product.name} &times; ${item.quantity}</td><td style="text-align:right">GH&#8373;${parseFloat(item.subtotal).toFixed(2)}</td></tr>`
    ).join('');
    w.document.write(`<!DOCTYPE html><html><head><title>Receipt</title>
      <style>
        body{font-family:'Courier New',monospace;font-size:12px;padding:20px;max-width:320px;margin:0 auto;color:#111}
        h2{text-align:center;margin:0 0 2px;font-size:16px}
        p.sub{text-align:center;margin:2px 0;color:#555;font-size:11px}
        table{width:100%;border-collapse:collapse;margin:8px 0}
        td{padding:3px 0;font-size:11px}
        hr{border:none;border-top:1px dashed #aaa;margin:8px 0}
        .total{font-weight:bold;font-size:13px}
        .footer{text-align:center;margin-top:12px;color:#888;font-size:10px}
        @media print{button{display:none!important}}
      </style></head><body>
      <h2>${s.storeName || 'Vendora'}</h2>
      ${s.storeAddress ? `<p class="sub">${s.storeAddress}</p>` : ''}
      ${s.storePhone ? `<p class="sub">Tel: ${s.storePhone}</p>` : ''}
      ${s.storeEmail ? `<p class="sub">${s.storeEmail}</p>` : ''}
      <hr/>
      <p class="sub">Receipt #${receipt.id}</p>
      <p class="sub">${new Date(receipt.createdAt).toLocaleString()}</p>
      ${receipt.cashier ? `<p class="sub">Cashier: ${receipt.cashier.fullName}</p>` : ''}
      ${receipt.customer ? `<p class="sub">Customer: ${receipt.customer.name}</p>` : ''}
      <hr/>
      <table>${items}</table>
      <hr/>
      <table>
        <tr><td>Subtotal</td><td style="text-align:right">GH&#8373;${parseFloat(receipt.subtotal).toFixed(2)}</td></tr>
        ${taxRate > 0 ? `<tr><td>Tax (${taxRate}%)</td><td style="text-align:right">GH&#8373;${(parseFloat(receipt.subtotal)*taxRate/100).toFixed(2)}</td></tr>` : ''}
        ${parseFloat(receipt.discount)>0 ? `<tr><td>Discount</td><td style="text-align:right">-GH&#8373;${parseFloat(receipt.discount).toFixed(2)}</td></tr>` : ''}
        <tr class="total"><td>TOTAL</td><td style="text-align:right">GH&#8373;${parseFloat(receipt.totalAmount).toFixed(2)}</td></tr>
        <tr><td>Payment</td><td style="text-align:right">${receipt.paymentMethod}</td></tr>
        ${parseFloat(receipt.change||0)>0 ? `<tr><td>Change</td><td style="text-align:right">GH&#8373;${parseFloat(receipt.change).toFixed(2)}</td></tr>` : ''}
      </table>
      <hr/>
      <div class="footer">${s.receiptFooter || 'Thank you for your purchase!'}<br/>Powered by Vendora</div>
      <br/><button onclick="window.print()" style="width:100%;padding:8px;cursor:pointer">&#128438; Print</button>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  const PAY_METHODS = [
    { id: 'CASH', label: 'Cash', Icon: Banknote },
    { id: 'MOBILE_MONEY', label: 'Mobile Money', Icon: Smartphone },
    { id: 'CARD', label: 'Card', Icon: CreditCard },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">

      {/* ── LEFT: Product search + Cart ── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingCart size={20} className="text-blue-600" /> Cashier
          </h2>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition">
              <X size={12} /> Clear all
            </button>
          )}
        </div>

        {/* Search bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input ref={searchRef}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Search product or scan barcode..."
              value={query}
              onChange={e => { setQuery(e.target.value); if (!e.target.value) setProducts([]); }}
              onKeyDown={handleSearchKey} />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          <button onClick={() => searchProducts(query)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl transition">
            <Search size={16} />
          </button>
        </div>

        {/* Search results dropdown */}
        {products.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg divide-y dark:divide-gray-700 max-h-52 overflow-auto">
            {products.map(p => (
              <div key={p.id} onClick={() => addToCart(p)}
                className="flex justify-between items-center px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition">
                <div>
                  <p className="font-semibold text-sm dark:text-white">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.category} · {p.quantity} in stock</p>
                </div>
                <span className="font-bold text-blue-600 text-sm">GH₵{parseFloat(p.price).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Cart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex-1 flex flex-col overflow-hidden min-h-[200px]">
          <div className="px-4 py-3 border-b dark:border-gray-700 flex justify-between items-center">
            <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Cart</span>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold">
              {cart.length} item{cart.length !== 1 ? 's' : ''}
            </span>
          </div>
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 gap-2">
              <ShoppingCart size={36} className="opacity-30" />
              <p className="text-sm">Search for products to add</p>
            </div>
          ) : (
            <div className="overflow-auto flex-1 divide-y dark:divide-gray-700">
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate dark:text-white">{product.name}</p>
                    <p className="text-xs text-gray-400">GH₵{parseFloat(product.price).toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(product.id, quantity - 1)}
                      className="w-7 h-7 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-bold dark:text-white transition">−</button>
                    <span className="w-8 text-center text-sm font-semibold dark:text-white">{quantity}</span>
                    <button onClick={() => updateQty(product.id, quantity + 1)}
                      className="w-7 h-7 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-bold dark:text-white transition">+</button>
                  </div>
                  <span className="w-20 text-right font-bold text-sm dark:text-white">
                    GH₵{(parseFloat(product.price) * quantity).toFixed(2)}
                  </span>
                  <button onClick={() => removeFromCart(product.id)} className="text-red-400 hover:text-red-600 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Customer + Checkout ── */}
      <div className="w-full lg:w-80 flex flex-col gap-4">

        {/* Customer panel */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <UserCheck size={15} /> Customer
            <span className="text-gray-400 font-normal text-xs">(optional)</span>
          </p>

          {customer ? (
            <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 rounded-xl px-3 py-2.5">
              <div>
                <p className="font-semibold text-sm dark:text-white">{customer.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{customer.phone} · {customer.loyaltyPoints || 0} pts</p>
              </div>
              <button onClick={() => { setCustomer(null); setCustQuery(''); }} className="text-gray-400 hover:text-red-500 transition">
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  className="flex-1 border dark:border-gray-600 rounded-xl px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Phone or name..."
                  value={custQuery}
                  onChange={e => { setCustQuery(e.target.value); setShowQuickAdd(false); setCustResults([]); }}
                  onKeyDown={e => e.key === 'Enter' && searchCustomers()} />
                <button onClick={searchCustomers}
                  className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 rounded-xl transition">
                  <Search size={14} className="dark:text-white" />
                </button>
              </div>

              {custResults.length > 0 && (
                <div className="border dark:border-gray-600 rounded-xl divide-y dark:divide-gray-600 max-h-32 overflow-auto">
                  {custResults.map(c => (
                    <div key={c.id} onClick={() => { setCustomer(c); setCustResults([]); setCustQuery(''); }}
                      className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm dark:text-white transition">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.phone}</p>
                    </div>
                  ))}
                </div>
              )}

              {showQuickAdd && (
                <form onSubmit={quickAddCustomer} className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                    <UserPlus size={12} /> New customer — {custQuery}
                  </p>
                  <input
                    className="w-full border dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Full name *"
                    value={quickName}
                    onChange={e => setQuickName(e.target.value)}
                    autoFocus />
                  <div className="flex gap-2">
                    <button type="submit"
                      className="flex-1 bg-blue-600 text-white text-xs py-1.5 rounded-lg hover:bg-blue-700 transition font-semibold">
                      Add Customer
                    </button>
                    <button type="button" onClick={() => setShowQuickAdd(false)}
                      className="px-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white text-xs py-1.5 rounded-lg hover:bg-gray-300 transition">
                      Skip
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Checkout panel */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 space-y-4">
          <h3 className="font-bold text-gray-800 dark:text-white text-sm">Checkout</h3>

          {/* Totals */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Subtotal</span><span>GH₵{subtotal.toFixed(2)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Tax ({taxRate}%)</span><span>GH₵{taxAmt.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
              <span>Discount (GH₵)</span>
              <input type="number" min="0" step="0.01"
                className="w-24 border dark:border-gray-600 rounded-lg px-2 py-1 text-right text-sm bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="flex justify-between font-black text-base border-t dark:border-gray-700 pt-2">
              <span className="dark:text-white">Total</span>
              <span className="text-blue-600">GH₵{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment method */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Payment Method</p>
            <div className="grid grid-cols-3 gap-1.5">
              {PAY_METHODS.map(({ id, label, Icon }) => (
                <button key={id} onClick={() => setPayment(id)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition ${
                    paymentMethod === id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}>
                  <Icon size={15} />
                  <span className="leading-tight text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cash: amount paid */}
          {paymentMethod === 'CASH' && (
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Amount Paid</label>
              <input type="number" min="0" step="0.01"
                className="w-full border dark:border-gray-600 rounded-xl px-3 py-2.5 mt-1.5 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={amountPaid} onChange={e => setAmountPaid(e.target.value)} placeholder="0.00" />
              {amountPaid && change >= 0 && (
                <p className="text-sm mt-1.5 text-emerald-600 font-bold">Change: GH₵{change.toFixed(2)}</p>
              )}
              {amountPaid && change < 0 && (
                <p className="text-sm mt-1.5 text-red-500 font-semibold">Short by GH₵{Math.abs(change).toFixed(2)}</p>
              )}
            </div>
          )}

          {/* Paystack: email */}
          {(paymentMethod === 'CARD' || paymentMethod === 'MOBILE_MONEY') && (
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Customer Email</label>
              <input type="email"
                className="w-full border dark:border-gray-600 rounded-xl px-3 py-2.5 mt-1.5 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="customer@email.com"
                value={paystackEmail}
                onChange={e => setPaystackEmail(e.target.value)} />
              <p className="text-[10px] text-gray-400 mt-1">Required for Paystack payment</p>
            </div>
          )}

          <button onClick={checkout} disabled={processing || cart.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-black transition text-sm shadow-sm">
            {processing ? 'Processing...' : `Complete Sale — GH₵${total.toFixed(2)}`}
          </button>
        </div>

        {/* Receipt */}
        {receipt && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 text-sm">
            <div className="text-center mb-3 border-b dark:border-gray-700 pb-3">
              <p className="font-black text-base dark:text-white">{settings.storeName || 'Vendora'}</p>
              {settings.storeAddress && <p className="text-gray-500 text-xs">{settings.storeAddress}</p>}
              {settings.storePhone && <p className="text-gray-500 text-xs">Tel: {settings.storePhone}</p>}
              <p className="text-gray-400 text-xs mt-1">Receipt #{receipt.id}</p>
              <p className="text-gray-400 text-xs">{new Date(receipt.createdAt).toLocaleString()}</p>
              {receipt.cashier && <p className="text-xs text-gray-500 mt-1">Cashier: {receipt.cashier.fullName}</p>}
              {receipt.customer && <p className="text-xs text-gray-500">Customer: {receipt.customer.name}</p>}
            </div>
            <div className="divide-y dark:divide-gray-700 mb-3">
              {receipt.items?.map(item => (
                <div key={item.id} className="flex justify-between py-1.5 text-xs dark:text-gray-300">
                  <span>{item.product.name} × {item.quantity}</span>
                  <span>GH₵{parseFloat(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t dark:border-gray-700 pt-2 space-y-1 text-xs">
              <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>Subtotal</span><span>GH₵{parseFloat(receipt.subtotal).toFixed(2)}</span></div>
              {parseFloat(receipt.discount) > 0 && (
                <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>Discount</span><span>−GH₵{parseFloat(receipt.discount).toFixed(2)}</span></div>
              )}
              <div className="flex justify-between font-black text-sm dark:text-white"><span>Total</span><span>GH₵{parseFloat(receipt.totalAmount).toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>Payment</span><span>{receipt.paymentMethod}</span></div>
              {parseFloat(receipt.change || 0) > 0 && (
                <div className="flex justify-between text-emerald-600"><span>Change</span><span>GH₵{parseFloat(receipt.change).toFixed(2)}</span></div>
              )}
            </div>
            <button onClick={printReceipt}
              className="w-full mt-3 bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white py-2 rounded-xl flex items-center justify-center gap-2 text-xs transition font-semibold">
              <Printer size={14} /> Print Receipt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
