import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [addingToCart, setAddingToCart] = useState(null);
  
  const { user } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('products').select('*');
      if (error) console.error(error);
      else setProducts(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const handleAddToCart = async (product) => {
    if (!user) {
      alert("Please log in or register to add items to your bag.");
      navigate('/login');
      return;
    }
    setAddingToCart(product.id);
    try {
      const { data: existingItem } = await supabase
        .from('shopping_cart')
        .select('*')
        .eq('member_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (existingItem) {
        await supabase
          .from('shopping_cart')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);
      } else {
        await supabase.from('shopping_cart').insert({
          member_id: user.id,
          product_id: product.id,
          quantity: 1
        });
      }
      alert(`${product.name} added to your bag!`);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) return <div className="text-center p-20 text-xl">Loading Studio...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="py-12 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-serif mb-2">Anna's Jagua Studio</h1>
          <p className="text-gray-500 text-sm tracking-widest uppercase">Natural Artistry & Supplies</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/admin')} className="text-sm border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">Admin Panel</button>
          {user ? (
            <button onClick={() => navigate('/checkout')} className="bg-black text-white px-6 py-2 rounded-lg">Go to Checkout</button>
          ) : (
            <button onClick={() => navigate('/login')} className="border border-black px-6 py-2 rounded-lg">Member Login</button>
          )}
        </div>
      </header>

      <div className="flex gap-4 border-b mb-8 pb-4">
        {['All', 'Jagua', 'Henna', 'Tools'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-sm ${activeTab === tab ? 'bg-black text-white' : 'text-gray-500'}`}>{tab}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.filter(p => activeTab === 'All' || p.category === activeTab).map(product => (
          <div key={product.id} className="border p-6 rounded-2xl flex flex-col justify-between">
            <div className="text-4xl mb-2 text-center">🌿</div>
            <h3 className="font-medium text-lg">{product.name}</h3>
            <p className="text-gray-500 text-sm mb-4">${Number(product.price).toFixed(2)}</p>
            <button onClick={() => handleAddToCart(product)} disabled={addingToCart === product.id} className="w-full bg-gray-100 py-2 rounded-xl text-sm font-medium hover:bg-black hover:text-white transition-colors">
              {addingToCart === product.id ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}