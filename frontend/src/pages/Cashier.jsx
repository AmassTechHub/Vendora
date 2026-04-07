import { useEffect, useRef, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Badge from '../components/Badge';
import { Search, Trash2, Printer, UserCheck, X } from 'lucide-react';

function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve(window.PaystackPop);
      return;
    }

    const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.PaystackPop));
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Paystack script')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve(window.PaystackPop);
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.body.appendChild(script);
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
  const [customerEmail, setCustomerEmail] = useState('');
  const [custQuery, setCustQuery]     = useState('');
  const [custResults, setCustResults] = useState([]);
  const searchRef = useRef(null);

  // Product search
  const searchProducts = async (q = query) => {
    if (!q.trim()) return;
    const { data } = await api.get(`/products/search?q=${q}`);
    setProducts(data);
  };

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') {
      if (query.match(/^\d{4,}$/)) searchByBarcode(query);
      else searchProducts();
    }
  };

  const searchByBarcode = async (barcode) => {
    try {
      const { data } = await api.get(`/products/barcode/${barcode}`);
      addToCart(data);
    } catch {
      toast.error('Product not found for barcode: ' + barcode);
    }
  };

  const addToCart = (product) => {
    if (product.quantity <= 0) return toast.error('Product is out of stock');
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          toast.error('Not enough stock');
          return prev;
        }
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setProducts([]);
    setQuery('');
    searchRef.current?.focus();
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart(prev => prev.map(i => i.product.id === id ? { ...i, quantity: qty } : i));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.product.id !== id));

  const clearCart = () => {
    setCart([]); setDiscount(0); setAmountPaid('');
    setCustomer(null); setCustomerEmail(''); setCustQuery(''); setReceipt(null);
  };

  // Customer search
  const searchCustomers = async () => {
    if (!custQuery.trim()) return;
    const { data } = await api.get(`/customers/search?q=${custQuery}`);
    setCustResults(data);
  };

  // Totals
  const subtotal = cart.reduce((sum, i) => sum + parseFloat(i.product.price) * i.quantity, 0);
  const total    = Math.max(0, subtotal - discount);
  const change   = amountPaid ? parseFloat(amountPaid) - total : 0;

  useEffect(() => {
    if (customer?.email) {
      setCustomerEmail(customer.email);
    }
  }, [customer]);

  const checkout = async () => {
    if (cart.length === 0) return toast.error('Cart is empty');
    if (paymentMethod === 'CASH' && parseFloat(amountPaid || '0') < total) {
      return toast.error('Amount paid is less than total');
    }

    const salePayload = {
      customerId: customer?.id || null,
      items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity })),
      discount,
      paymentMethod,
      amountPaid: parseFloat(amountPaid) || total,
    };

    if (paymentMethod !== 'CASH') {
      const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      if (!publicKey) return toast.error('Missing VITE_PAYSTACK_PUBLIC_KEY');
      if (!customerEmail.trim()) return toast.error('Customer email is required for Paystack payment');

      try {
        await loadPaystackScript();
        const handler = window.PaystackPop.setup({
          key: publicKey,
          email: customerEmail.trim(),
          amount: Math.round(total * 100),
          currency: 'GHS',
          ref: `vendora_${Date.now()}`,
          channels: paymentMethod === 'MOBILE_MONEY' ? ['mobile_money'] : ['card'],
          callback: async (response) => {
            try {
              const { data } = await api.post('/payments/paystack/verify-and-create', {
                reference: response.reference,
                sale: salePayload,
              });
              setReceipt(data.sale);
              setCart([]); setDiscount(0); setAmountPaid(''); setCustomer(null); setCustomerEmail(''); setCustQuery('');
              toast.success('Payment verified and sale completed!');
            } catch (err) {
              toast.error(err.response?.data?.error || 'Unable to verify Paystack payment');
            }
          },
          onClose: () => toast('Payment window closed'),
        });

        handler.openIframe();
        return;
      } catch (err) {
        toast.error(err.message || 'Unable to start Paystack payment');
        return;
      }
    }

    try {
      const { data } = await api.post('/sales', salePayload);
      setReceipt(data);
      setCart([]); setDiscount(0); setAmountPaid(''); setCustomer(null); setCustomerEmail(''); setCustQuery('');
      toast.success('Sale completed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Checkout failed');
    }
  };

  return (
    <div className="flex gap-5 h-full">

      {/* LEFT: Search + Cart */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Cashier</h2>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
              <X size={14} /> Clear All
            </button>
          )}
        </div>

        {/* Product Search */}
        <div className="flex gap-2">
          <input
            ref={searchRef}
            className="flex-1 border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Search product name or scan barcode (Enter)"
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (!e.target.value) setProducts([]); }}
            onKeyDown={handleSearchKey}
          />
          <button onClick={() => searchProducts()} className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700">
            <Search size={18} />
          </button>
        </div>

        {/* Search Results Dropdown */}
        {products.length > 0 && (
          <div className="bg-white rounded-lg border shadow-lg divide-y max-h-56 overflow-auto">
            {products.map(p => (
              <div key={p.id}
                className="flex justify-between items-center px-4 py-3 hover:bg-blue-50 cursor-pointer transition"
                onClick={() => addToCart(p)}>
                <div>
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.category} · Stock: {p.quantity}</p>
                </div>
                <span className="font-bold text-blue-600 text-sm">GH₵{parseFloat(p.price).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Cart */}
        <div className="bg-white rounded-xl border shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b flex justify-between items-center">
            <span className="font-semibold text-gray-700">Cart</span>
            <Badge label={`${cart.length} item${cart.length !== 1 ? 's' : ''}`} color="blue" />
          </div>

          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Search for products to add to cart
            </div>
          ) : (
            <div className="overflow-auto flex-1 divide-y">
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">GH₵{parseFloat(product.price).toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQty(product.id, quantity - 1)}
                      className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg text-center font-bold text-sm transition">−</button>
                    <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                    <button onClick={() => updateQty(product.id, quantity + 1)}
                      className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg text-center font-bold text-sm transition">+</button>
                  </div>
                  <span className="w-20 text-right font-semibold text-sm">
                    GH₵{(parseFloat(product.price) * quantity).toFixed(2)}
                  </span>
                  <button onClick={() => removeFromCart(product.id)} className="text-red-400 hover:text-red-600 transition">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Checkout + Receipt */}
      <div className="w-80 flex flex-col gap-4">

        {/* Customer Selector */}
        <div className="bg-white rounded-xl border shadow-sm p-4 space-y-2">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-2"><UserCheck size={16} /> Customer</p>
          {customer ? (
            <div className="flex justify-between items-center bg-blue-50 rounded-lg px-3 py-2">
              <div>
                <p className="font-medium text-sm">{customer.name}</p>
                <p className="text-xs text-gray-500">{customer.loyaltyPoints} loyalty pts</p>
              </div>
              <button onClick={() => { setCustomer(null); setCustQuery(''); }} className="text-gray-400 hover:text-red-500">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Search customer..." value={custQuery}
                onChange={(e) => setCustQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchCustomers()} />
              <button onClick={searchCustomers} className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg">
                <Search size={14} />
              </button>
            </div>
          )}
          {paymentMethod !== 'CASH' && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Paystack Email</label>
              <input
                type="email"
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="customer@email.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
          )}
          {custResults.length > 0 && !customer && (
            <div className="border rounded-lg divide-y max-h-32 overflow-auto">
              {custResults.map(c => (
                <div key={c.id} className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                  onClick={() => { setCustomer(c); setCustResults([]); setCustQuery(''); }}>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkout Panel */}
        <div className="bg-white rounded-xl border shadow-sm p-4 space-y-3">
          <h3 className="font-semibold text-gray-700">Checkout</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span><span>GH₵{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>Discount (GH₵)</span>
              <input type="number" min="0" className="w-24 border rounded-lg px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Total</span><span className="text-green-700">GH₵{total.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment Method</label>
            <div className="grid grid-cols-3 gap-1.5 mt-1.5">
              {['CASH', 'MOBILE_MONEY', 'CARD'].map(m => (
                <button key={m} onClick={() => setPayment(m)}
                  className={`py-1.5 rounded-lg text-xs font-medium transition ${
                    paymentMethod === m ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {m === 'MOBILE_MONEY' ? 'Mobile' : m.charAt(0) + m.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === 'CASH' && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Amount Paid</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="0.00" />
              {amountPaid && change >= 0 && (
                <p className="text-sm mt-1 text-green-600 font-medium">Change: GH₵{change.toFixed(2)}</p>
              )}
              {amountPaid && change < 0 && (
                <p className="text-sm mt-1 text-red-500">Insufficient amount</p>
              )}
            </div>
          )}

          <button onClick={checkout}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 active:scale-95 transition text-sm">
            Complete Sale — GH₵{total.toFixed(2)}
          </button>
        </div>

        {/* Receipt */}
        {receipt && (
          <div className="bg-white rounded-xl border shadow-sm p-4 text-sm" id="receipt">
            <div className="text-center mb-3 border-b pb-3">
              <p className="font-bold text-base">Vendora</p>
              <p className="text-gray-500 text-xs">Receipt #{receipt.id}</p>
              <p className="text-gray-400 text-xs">{new Date(receipt.createdAt).toLocaleString()}</p>
              {receipt.cashier && <p className="text-xs text-gray-500 mt-1">Cashier: {receipt.cashier.fullName}</p>}
            </div>

            <div className="divide-y mb-3">
              {receipt.items?.map(item => (
                <div key={item.id} className="flex justify-between py-1.5 text-xs">
                  <span>{item.product.name} × {item.quantity}</span>
                  <span>GH₵{parseFloat(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-2 space-y-1 text-xs">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>GH₵{parseFloat(receipt.subtotal).toFixed(2)}</span></div>
              {parseFloat(receipt.discount) > 0 && (
                <div className="flex justify-between text-gray-500"><span>Discount</span><span>−GH₵{parseFloat(receipt.discount).toFixed(2)}</span></div>
              )}
              <div className="flex justify-between font-bold text-sm"><span>Total</span><span>GH₵{parseFloat(receipt.totalAmount).toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Payment</span><span>{receipt.paymentMethod}</span></div>
              {parseFloat(receipt.change) > 0 && (
                <div className="flex justify-between text-green-600"><span>Change</span><span>GH₵{parseFloat(receipt.change).toFixed(2)}</span></div>
              )}
            </div>

            <button onClick={() => window.print()}
              className="w-full mt-3 bg-gray-800 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-xs hover:bg-gray-700 transition">
              <Printer size={14} /> Print Receipt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
