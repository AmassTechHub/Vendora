button onClick={() => setReceipt(null)}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700">
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`

writeFileSync('frontend/src/pages/Cashier.jsx', cashier, 'utf8')
console.log('Cashier written:', cashier.length, 'chars')
n>TOTAL</span><span className="text-green-600">{currency}{parseFloat(receipt.totalAmount).toFixed(2)}</span></div>
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-3">
              <button onClick={() => printReceipt(receipt)}
                className="flex-1 bg-gray-900 dark:bg-gray-700 text-white py-2.5 rounded-xl font-semibold hover:bg-gray-800 flex items-center justify-center gap-2">
                <Printer size={15} /> Print
              </button>
              <space-y-1 text-sm">
                <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>Subtotal</span><span>{currency}{parseFloat(receipt.subtotal).toFixed(2)}</span></div>
                {parseFloat(receipt.discount) > 0 && <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>Discount</span><span>-{currency}{parseFloat(receipt.discount).toFixed(2)}</span></div>}
                <div className="flex justify-between font-black text-base dark:text-white"><spa      <div className="p-5 space-y-3 max-h-72 overflow-y-auto">
              {(receipt.items || []).map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="dark:text-white">{item.product?.name} × {item.quantity}</span>
                  <span className="font-semibold dark:text-white">{currency}{parseFloat(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t dark:border-gray-700 pt-3 sName="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="bg-green-500 px-5 py-4 text-white text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">✓</span>
              </div>
              <p className="font-black text-lg">Sale Complete!</p>
              <p className="text-green-100 text-sm">Receipt #{receipt.id}</p>
            </div>
      
              <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Processing...</>
            ) : (
              <>{paymentMethod === 'CASH' ? 'Complete Sale' : 'Pay with ' + (paymentMethod === 'CARD' ? 'Card' : 'Mobile Money')} · {currency}{total.toFixed(2)}</>
            )}
          </button>
        </div>
      </div>

      {/* Receipt modal */}
      {receipt && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div clascustomer@email.com"
                value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
              <p className="text-xs text-gray-400 mt-1">Required for Paystack payment</p>
            </div>
          )}

          <button onClick={checkout} disabled={processing || cart.length === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-sm">
            {processing ? (-sm">
                  <span className="text-green-700 dark:text-green-400 font-semibold">Change</span>
                  <span className="text-green-700 dark:text-green-400 font-black">{currency}{change.toFixed(2)}</span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Customer Email *</p>
              <input type="email" className={ic} placeholder="div>
          </div>

          {paymentMethod === 'CASH' ? (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Amount Paid</p>
              <input type="number" className={ic} placeholder="0.00"
                value={amountPaid} onChange={e => setAmountPaid(e.target.value)} />
              {change > 0 && (
                <div className="mt-2 bg-green-50 dark:bg-green-900/20 rounded-xl px-3 py-2 flex justify-between text">
              {['CASH', 'MOBILE_MONEY', 'CARD'].map(m => (
                <button key={m} onClick={() => setPayment(m)}
                  className={'py-2 rounded-xl text-xs font-semibold transition ' + (paymentMethod === m ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600')}>
                  {m === 'MOBILE_MONEY' ? 'Mobile' : m === 'CASH' ? 'Cash' : 'Card'}
                </button>
              ))}
            </ame="flex justify-between font-black text-base border-t dark:border-gray-700 pt-2">
              <span className="dark:text-white">TOTAL</span>
              <span className="text-green-600 dark:text-green-400">{currency}{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment method */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Payment Method</p>
            <div className="grid grid-cols-3 gap-1.5sName="flex justify-between items-center text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1"><Tag size={12} /> Discount</span>
              <input type="number" min="0" className="w-24 border dark:border-gray-600 rounded-lg px-2 py-1 text-right text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} />
            </div>
            <div classNt</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span><span>{currency}{subtotal.toFixed(2)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax ({(taxRate * 100).toFixed(1)}%)</span><span>{currency}{tax.toFixed(2)}</span>
              </div>
            )}
            <div clas"button" onClick={() => setShowQuickAdd(false)} className="flex-1 bg-gray-200 dark:bg-gray-700 dark:text-white py-1.5 rounded-lg text-xs font-semibold">Cancel</button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>

        {/* Checkout */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm p-4 space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white">Checkouust.phone} onChange={e => setQuickCust(q => ({ ...q, phone: e.target.value }))} />
                    <input type="email" className={ic} placeholder="Email"
                      value={quickCust.email} onChange={e => setQuickCust(q => ({ ...q, email: e.target.value }))} />
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700">Add</button>
                      <button type=ext-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1">
                    <UserPlus size={12} /> Quick add customer
                  </p>
                  <form onSubmit={quickAddCustomer} className="space-y-2">
                    <input required className={ic} placeholder="Full name *"
                      value={quickCust.name} onChange={e => setQuickCust(q => ({ ...q, name: e.target.value }))} />
                    <input className={ic} placeholder="Phone"
                      value={quickC0 dark:hover:bg-gray-700 cursor-pointer text-sm dark:text-white transition">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.phone}</p>
                    </div>
                  ))}
                </div>
              )}
              {showQuickAdd && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-semibold ted-xl transition">
                  <Search size={14} className="dark:text-white" />
                </button>
              </div>
              {custResults.length > 0 && (
                <div className="border dark:border-gray-600 rounded-xl divide-y dark:divide-gray-600 max-h-32 overflow-auto">
                  {custResults.map(c => (
                    <div key={c.id} onClick={() => { setCustomer(c); setCustResults([]); setCustQuery(''); }}
                      className="px-3 py-2 hover:bg-gray-514} />
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input className={ic + ' flex-1'} placeholder="Name or phone..."
                  value={custQuery}
                  onChange={e => setCustQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchCustomers()} />
                <button onClick={searchCustomers} className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 roundv className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 rounded-xl px-3 py-2.5">
              <div>
                <p className="font-semibold text-sm dark:text-white">{customer.name}</p>
                <p className="text-xs text-gray-500">{customer.phone} · {customer.loyaltyPoints || 0} pts</p>
              </div>
              <button onClick={() => { setCustomer(null); setCustQuery(''); setCustomerEmail(''); }} className="text-gray-400 hover:text-red-500">
                <X size={HT — customer + checkout */}
      <div className="w-full lg:w-80 flex flex-col gap-3 shrink-0">
        {/* Customer */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <UserCheck size={15} /> Customer <span className="text-gray-400 font-normal text-xs">(optional)</span>
          </p>
          {customer ? (
            <di/div>
                  <span className="w-20 text-right font-bold text-sm dark:text-white shrink-0">
                    {currency}{(parseFloat(product.price) * quantity).toFixed(2)}
                  </span>
                  <button onClick={() => removeFromCart(product.id)} className="text-red-400 hover:text-red-600 shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIG100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-bold dark:text-white transition">−</button>
                    <span className="w-8 text-center text-sm font-semibold dark:text-white">{quantity}</span>
                    <button onClick={() => updateQty(product.id, quantity + 1)}
                      className="w-7 h-7 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-bold dark:text-white transition">+</button>
                  <enter gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate dark:text-white">{product.name}</p>
                    <p className="text-xs text-gray-400">{currency}{parseFloat(product.price).toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => updateQty(product.id, quantity - 1)}
                      className="w-7 h-7 bg-gray-    </div>
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 gap-2 py-8">
              <ShoppingCart size={36} />
              <p className="text-sm">Search for products to add to cart</p>
            </div>
          ) : (
            <div className="overflow-auto flex-1 divide-y dark:divide-gray-700">
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-c00 shadow-sm flex-1 flex flex-col overflow-hidden" style={{minHeight: '220px'}}>
          <div className="px-4 py-3 border-b dark:border-gray-700 flex justify-between items-center">
            <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Cart</span>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold">
              {cart.length} item{cart.length !== 1 ? 's' : ''}
            </span>
      v>
                  <p className="font-semibold text-sm dark:text-white">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.category || 'No category'} · {p.quantity} in stock</p>
                </div>
                <span className="font-bold text-blue-600 text-sm">{currency}{parseFloat(p.price).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Cart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-7>
          </button>
        </div>

        {/* Search results */}
        {products.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-lg divide-y dark:divide-gray-700 max-h-48 overflow-auto">
            {products.map(p => (
              <div key={p.id} onClick={() => addToCart(p)}
                className="flex justify-between items-center px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition">
                <di-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Search product or scan barcode (Enter)..."
              value={query}
              onChange={e => { setQuery(e.target.value); if (!e.target.value) setProducts([]); }}
              onKeyDown={handleSearchKey} />
          </div>
          <button onClick={() => searchProducts()} className="bg-blue-600 text-white px-4 rounded-xl hover:bg-blue-700 transition">
            <Search size={15} /} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
              <X size={12} /> Clear all
            </button>
          )}
        </div>

        {/* Search bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input ref={searchRef}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-4 py focus:bg-white transition";

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* LEFT — product search + cart */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingCart size={20} className="text-blue-600" /> Cashier
          </h2>
          {cart.length > 0 && (
            <button onClick={clearAll<td>Change</td><td style="text-align:right">' + currency + parseFloat(r.change).toFixed(2) + '</td></tr>' : '') + '</table><hr/><div class="footer">' + receiptFooter + '</div><br/><button class="no-print" onclick="window.print()">Print</button></body></html>');
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  const ic = "w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-noneign:right">-' + currency + parseFloat(r.discount).toFixed(2) + '</td></tr>' : '') + (taxRate > 0 ? '<tr><td>Tax (' + (taxRate * 100).toFixed(1) + '%)</td><td style="text-align:right">' + currency + (parseFloat(r.subtotal) * taxRate).toFixed(2) + '</td></tr>' : '') + '<tr class="total"><td>TOTAL</td><td style="text-align:right">' + currency + parseFloat(r.totalAmount).toFixed(2) + '</td></tr><tr><td>Payment</td><td style="text-align:right">' + r.paymentMethod + '</td></tr>' + (parseFloat(r.change || 0) > 0 ? '<tr>p style="font-size:10px">' + storeAddress + '</p>' : '') + '<hr/><p>Receipt #' + r.id + '</p><p>' + new Date(r.createdAt).toLocaleString() + '</p>' + (r.cashier ? '<p>Cashier: ' + r.cashier.fullName + '</p>' : '') + (r.customer ? '<p>Customer: ' + r.customer.name + '</p>' : '') + '<hr/><table>' + items + '</table><hr/><table><tr><td>Subtotal</td><td style="text-align:right">' + currency + parseFloat(r.subtotal).toFixed(2) + '</td></tr>' + (parseFloat(r.discount) > 0 ? '<tr><td>Discount</td><td style="text-altle>Receipt #' + r.id + '</title><style>body{font-family:monospace;font-size:12px;padding:16px;max-width:300px;margin:0 auto}h2,p{text-align:center;margin:2px 0}table{width:100%;border-collapse:collapse;margin:8px 0}td{padding:2px 0}hr{border:1px dashed #ccc}.total{font-weight:bold;font-size:14px}.footer{text-align:center;margin-top:12px;color:#888;font-size:11px}@media print{.no-print{display:none}}</style></head><body><h2>' + storeName + '</h2>' + (storePhone ? '<p>' + storePhone + '</p>' : '') + (storeAddress ? '<
        handler.openIframe();
      } catch (err) { setProcessing(false); toast.error(err.message); }
    } else {
      await finalizeSale(null);
    }
  };

  const printReceipt = (r) => {
    const w = window.open('', '_blank', 'width=380,height=620');
    const items = (r.items || []).map(item =>
      '<tr><td>' + item.product.name + ' x' + item.quantity + '</td><td style="text-align:right">' + currency + parseFloat(item.subtotal).toFixed(2) + '</td></tr>'
    ).join('');
    w.document.write('<html><head><tiEnter customer email for card/mobile payment'); }
      if (!paystackKey) { setProcessing(false); return toast.error('Paystack not configured'); }
      try {
        const PS = await loadPaystack();
        const handler = PS.setup({
          key: paystackKey,
          email: customerEmail,
          amount: Math.round(total * 100),
          currency: 'GHS',
          callback: (res) => finalizeSale(res.reference),
          onClose: () => { setProcessing(false); toast.error('Payment cancelled'); }
        }); completed!');
    } catch (err) { toast.error(err.response?.data?.error || 'Checkout failed'); }
    finally { setProcessing(false); }
  };

  const checkout = async () => {
    if (cart.length === 0) return toast.error('Cart is empty');
    if (paymentMethod === 'CASH' && parseFloat(amountPaid || '0') < total) {
      return toast.error('Amount paid is less than total');
    }
    setProcessing(true);
    if (paymentMethod !== 'CASH') {
      if (!customerEmail) { setProcessing(false); return toast.error('email); }, [customer]);

  const finalizeSale = async (payRef) => {
    const payload = {
      customerId: customer?.id || null,
      items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity })),
      discount, paymentMethod,
      amountPaid: parseFloat(amountPaid) || total,
      ...(payRef && { paymentReference: payRef, paymentProvider: 'PAYSTACK' })
    };
    try {
      const { data } = await api.post('/sales', payload);
      setReceipt(data);
      clearAll();
      toast.success('Saleame: '', phone: '', email: '' });
      setCustResults([]);
      setCustQuery('');
      toast.success('Customer added');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const subtotal = cart.reduce((s, i) => s + parseFloat(i.product.price) * i.quantity, 0);
  const tax = subtotal * taxRate;
  const total = Math.max(0, subtotal + tax - discount);
  const change = amountPaid ? parseFloat(amountPaid) - total : 0;

  useEffect(() => { if (customer?.email) setCustomerEmail(customer.m()) return;
    try {
      const { data } = await api.get('/customers/search?q=' + encodeURIComponent(custQuery));
      setCustResults(data);
      if (data.length === 0) setShowQuickAdd(true);
    } catch { toast.error('Search failed'); }
  };

  const quickAddCustomer = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/customers', quickCust);
      setCustomer(data);
      if (data.email) setCustomerEmail(data.email);
      setShowQuickAdd(false);
      setQuickCust({ n
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart(prev => prev.map(i => i.product.id === id ? { ...i, quantity: qty } : i));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.product.id !== id));

  const clearAll = () => {
    setCart([]); setDiscount(0); setAmountPaid('');
    setCustomer(null); setCustomerEmail(''); setCustQuery('');
    setReceipt(null); setProducts([]);
  };

  const searchCustomers = async () => {
    if (!custQuery.trisearchRef.current?.focus(), 50);y: 1 }];
    });
    setProducts([]); setQuery('');
    setTimeout(() => ev, { product, quantit  }
      return [...prtity: i.quantity + 1 } : i);
     ? { ...i, quan  return prev.map(i => i.product.id === product.id barcode);
      addToCart(data);
    } catch { toast.error('Product not found: ' + barcode); }
  };

  const addToCart = (product) => {
    if (product.quantity <= 0) return toast.error('Out of stock');
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id);
      if (ex) {
        if (ex.quantity >= product.quantity) { toast.error('Not enough stock'); return prev; }
      m = q ?? query;
    if (!term.trim()) return;
    try {
      const { data } = await api.get('/products/search?q=' + encodeURIComponent(term));
      setProducts(data);
    } catch { toast.error('Search failed'); }
  }, [query]);

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') {
      if (query.match(/^\\d{4,}$/)) searchByBarcode(query);
      else searchProducts();
    }
  };

  const searchByBarcode = async (barcode) => {
    try {
      const { data } = await api.get('/products/barcode/' +Item('vendora-settings') || '{}');
  const storeName = settings.storeName || 'Vendora';
  const storePhone = settings.storePhone || '';
  const storeAddress = settings.storeAddress || '';
  const receiptFooter = settings.receiptFooter || 'Thank you for your business!';
  const currency = settings.currency || 'GH\u20b5';
  const taxRate = parseFloat(settings.taxRate || '0') / 100;
  const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';

  const searchProducts = useCallback(async (q) => {
    const terceipt] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [custQuery, setCustQuery] = useState('');
  const [custResults, setCustResults] = useState([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickCust, setQuickCust] = useState({ name: '', phone: '', email: '' });
  const [customerEmail, setCustomerEmail] = useState('');
  const [processing, setProcessing] = useState(false);
  const searchRef = useRef(null);

  const settings = JSON.parse(localStorage.getne.js';
    s.onload = () => resolve(window.PaystackPop);
    s.onerror = () => reject(new Error('Failed to load Paystack'));
    document.body.appendChild(s);
  });
}

export default function Cashier() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPayment] = useState('CASH');
  const [amountPaid, setAmountPaid] = useState('');
  const [receipt, setRefix receipt, add Paystack support
const cashier = `import { useEffect, useRef, useState, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Search, Trash2, Printer, UserCheck, X, ShoppingCart, UserPlus, Tag } from 'lucide-react';

function loadPaystack() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) { resolve(window.PaystackPop); return; }
    const s = document.createElement('script');
    s.src = 'https://js.paystack.co/v1/inli} from 'fs'

// Fix 1: Cashier - use localStorage for settings, import { writeFileSync 