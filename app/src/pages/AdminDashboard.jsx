import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [productForm, setProductForm] = useState({ name: '', category: 'Jagua', price: '', description: '' });

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders(data || []);
  }

  const handleAddProduct = async (e) => {
    e.preventDefault();
    await supabase.from('products').insert([{ ...productForm, price: parseFloat(productForm.price) }]);
    alert("Product added!");
    setProductForm({ name: '', category: 'Jagua', price: '', description: '' });
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    fetchOrders();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <section className="border p-6 rounded-2xl">
        <h2 className="text-xl font-serif mb-4">Add Product</h2>
        <form onSubmit={handleAddProduct} className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Name" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required className="border p-2 rounded" />
          <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="border p-2 rounded">
            <option value="Jagua">Jagua</option>
            <option value="Henna">Henna</option>
            <option value="Tools">Tools</option>
          </select>
          <input type="number" placeholder="Price" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required className="border p-2 rounded" />
          <button type="submit" className="bg-black text-white rounded">Upload</button>
        </form>
      </section>

      <section className="border p-6 rounded-2xl">
        <h2 className="text-xl font-serif mb-4">Manage Orders</h2>
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border p-4 rounded flex justify-between items-center">
              <div>
                <p className="font-bold">{order.customer_name} (${Number(order.total_amount).toFixed(2)})</p>
                <p className="text-sm text-gray-500">Status: <span className="capitalize font-semibold">{order.status}</span></p>
              </div>
              <div className="space-x-2">
                <button onClick={() => handleUpdateStatus(order.id, 'paid')} className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">Mark Paid</button>
                <button onClick={() => handleUpdateStatus(order.id, 'delivering')} className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">Mark Delivering</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}