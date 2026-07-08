import { useState } from 'react';

// Temporary mock data until we connect the Supabase database
const MOCK_PRODUCTS = [
  { id: 1, name: "Premium Jagua Gel", category: "Jagua", price: 120, img: "🌿" },
  { id: 2, name: "Organic Henna Cone", category: "Henna", price: 45, img: "🍂" },
  { id: 3, name: "Applicator Bottle Set", category: "Tools", price: 30, img: "🧴" },
  { id: 4, name: "Jagua Juice Extract", category: "Jagua", price: 150, img: "💧" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('All');
  const [cart, setCart] = useState([]);
  const [orderStatus, setOrderStatus] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', payment_method: 'PayMe'
  });

  const filteredProducts = activeTab === 'All' 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(p => p.category === activeTab);

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const handleAddToCart = (product) => {
    setCart([...cart, product]);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Your cart is empty!");
    
    setOrderStatus('loading');

    try {
      // Calls the /api/orders.mjs endpoint on your backend
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, total_amount: cartTotal })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setOrderStatus({ id: result.orderId, method: formData.payment_method, total: cartTotal });
        setCart([]); // Empty the cart upon success
      } else {
        setOrderStatus('error');
        alert(`Checkout Failed:\n${result.errors.join('\n')}`);
      }
    } catch (err) {
      setOrderStatus('error');
      alert("Please ensure your backend server is running.");
    }
  };

  // The Payment Instruction Screen
  if (orderStatus && orderStatus.id) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md text-center border border-studio-accent/20">
          <h2 className="text-3xl font-serif text-studio-dark mb-4">Thank You!</h2>
          <p className="mb-6">Your order <span className="font-bold text-studio-accent">#{orderStatus.id.split('-')[0]}</span> is reserved.</p>
          <div className="bg-studio-light p-6 rounded-lg mb-6">
            <p className="text-sm uppercase tracking-wide text-gray-500 mb-2">Amount Due</p>
            <p className="text-4xl font-light">${orderStatus.total.toFixed(2)}</p>
          </div>
          <p className="mb-6">Please transfer the exact amount via <strong>{orderStatus.method}</strong> and include your Order ID in the remarks.</p>
          <div className="h-48 w-48 bg-gray-200 mx-auto flex items-center justify-center text-gray-400 mb-6 rounded-lg">
             [ {orderStatus.method} QR Code Here ]
          </div>
          <button onClick={() => setOrderStatus(null)} className="text-studio-accent underline">Return to Store</button>
        </div>
      </div>
    );
  }

  // The Main Storefront Layout
  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <header className="py-12 text-center">
        <h1 className="text-5xl font-serif tracking-tight text-studio-dark mb-4">Anna's Jagua Studio</h1>
        <p className="text-gray-500 tracking-widest uppercase text-sm">Natural Artistry & Supplies</p>
      </header>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Product Section */}
        <div className="flex-1">
          <div className="flex gap-4 border-b border-gray-200 mb-8 pb-4 overflow-x-auto">
            {['All', 'Jagua', 'Henna', 'Tools'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${activeTab === tab ? 'bg-studio-accent text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-6xl mb-4 text-center">{product.img}</div>
                <h3 className="font-serif text-xl mb-1">{product.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{product.category}</p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-lg font-light">${product.price.toFixed(2)}</span>
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="bg-studio-light text-studio-accent border border-studio-accent px-4 py-2 rounded-full text-sm hover:bg-studio-accent hover:text-white transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart & Checkout Section */}
        <div className="w-full md:w-96">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-6">
            <h2 className="text-2xl font-serif mb-6 border-b pb-4">Your Bag ({cart.length})</h2>
            
            <div className="space-y-3 mb-6 max-h-48 overflow-y-auto">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span>${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between font-bold text-lg mb-8">
              <span>Total:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4">
              <input type="text" placeholder="Full Name" required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-studio-accent/50"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              
              <input type="email" placeholder="Email Address" required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-studio-accent/50"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              
              <input type="tel" placeholder="Phone Number (8 digits)" required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-studio-accent/50"
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              
              <input type="text" placeholder="Shipping Address" required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-studio-accent/50"
                value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              
              <select 
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-studio-accent/50"
                value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})}
              >
                <option value="PayMe">PayMe</option>
                <option value="AlipayHK">AlipayHK</option>
                <option value="WeChatCode">WeChat Pay</option>
                <option value="FPS">FPS</option>
              </select>

              <button 
                type="submit" 
                disabled={orderStatus === 'loading'}
                className="w-full bg-studio-dark text-white py-4 rounded-xl font-bold tracking-wide hover:bg-black transition-colors disabled:opacity-50"
              >
                {orderStatus === 'loading' ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}