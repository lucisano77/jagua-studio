import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

export default function Checkout() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '', method: 'PayMe' });

  useEffect(() => {
    async function loadCart() {
      const { data } = await supabase
        .from('shopping_cart')
        .select('*, products(*)')
        .eq('member_id', user.id);
      
      setCartItems(data || []);
      const cartTotal = (data || []).reduce((sum, item) => sum + (item.products.price * item.quantity), 0);
      setTotal(cartTotal);
    }
    loadCart();
  }, [user]);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    // Call your secure Vercel backend API
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: form.name,
        customer_email: user.email,
        customer_phone: form.phone,
        customer_address: form.address,
        payment_method: form.method,
        total_amount: total,
        cart_items: cartItems
      })
    });

    if (response.ok) {
      // Clear cart entries upon successful submission
      await supabase.from('shopping_cart').delete().eq('member_id', user.id);
      setOrderPlaced(true);
    } else {
      alert("Order submission error.");
    }
  };

  if (orderPlaced) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center p-8 border rounded-2xl">
        <h2 className="text-3xl font-serif mb-4">Order Received!</h2>
        <p className="mb-6">Total Due: <strong>${total.toFixed(2)}</strong></p>
        <div className="bg-gray-100 p-12 rounded-xl mb-4">[ PayMe / HK QR Code Image ]</div>
        <p className="text-sm text-gray-500">Please upload your transfer confirmation receipt to our WhatsApp link.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 mt-10 border rounded-2xl">
      <h2 className="text-2xl font-serif mb-6">Confirm Your Purchase</h2>
      <div className="mb-6 space-y-2 border-b pb-4">
        {cartItems.map(item => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.products.name} (x{item.quantity})</span>
            <span>${(item.products.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-lg pt-2">
          <span>Total Payable:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="space-y-4">
        <input type="text" placeholder="Full Name" required onChange={e => setForm({...form, name: e.target.value})} className="w-full border p-3 rounded-lg" />
        <input type="tel" placeholder="Hong Kong Mobile Number" required onChange={e => setForm({...form, phone: e.target.value})} className="w-full border p-3 rounded-lg" />
        <input type="text" placeholder="Delivery Address" required onChange={e => setForm({...form, address: e.target.value})} className="w-full border p-3 rounded-lg" />
        <select onChange={e => setForm({...form, method: e.target.value})} className="w-full border p-3 rounded-lg">
          <option value="PayMe">PayMe</option>
          <option value="AlipayHK">AlipayHK</option>
          <option value="FPS">FPS</option>
        </select>
        <button type="submit" className="w-full bg-black text-white p-4 rounded-xl font-bold">Submit and View Payment QR Code</button>
      </form>
    </div>
  );
}