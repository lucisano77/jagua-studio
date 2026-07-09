import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient'; // Adjust path if needed

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [addingToCart, setAddingToCart] = useState(null); // Tracks which button is loading
  
  const { user } = useAuth(); 
  const navigate = useNavigate();

  // 1. Fetch Real Products from the Database on Load
  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const filteredProducts = activeTab === 'All' 
    ? products 
    : products.filter(p => p.category === activeTab);

  // 2. The Database "Add to Cart" Logic
  const handleAddToCart = async (product) => {
    // If they aren't a member, send them to login!
    if (!user) {
      alert("Please log in or register to add items to your bag.");
      navigate('/login');
      return;
    }

    setAddingToCart(product.id);

    try {
      // Step A: Check if this member already has this exact product in their cart
      const { data: existingItem, error: fetchError } = await supabase
        .from('shopping_cart')
        .select('*')
        .eq('member_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError; // PGRST116 just means "no rows found", which is fine!

      if (existingItem) {
        // Step B: It exists! Just add 1 to the quantity.
        const { error: updateError } = await supabase
          .from('shopping_cart')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);
        
        if (updateError) throw updateError;
      } else {
        // Step C: It's a new item! Insert a fresh row.
        const { error: insertError } = await supabase
          .from('shopping_cart')
          .insert({
            member_id: user.id,
            product_id: product.id,
            quantity: 1
          });
          
        if (insertError) throw insertError;
      }

      alert(`${product.name} added to your bag!`);
    } catch (error) {
      console.error("Cart Error:", error);
      alert("Something went wrong adding to cart.");
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return <div className="text-center p-20 text-2xl font-serif">Loading Studio...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <header className="py-12 flex justify-between items-center">
        <div>
            <h1 className="text-5xl font-serif tracking-tight text-studio-dark mb-4">Anna's Jagua Studio</h1>
            <p className="text-gray-500 tracking-widest uppercase text-sm">Natural Artistry & Supplies</p>
        </div>
        <div>
            {user ? (
                <button onClick={() => navigate('/checkout')} className="bg-black text-white px-6 py-2 rounded-lg">
                  Go to Checkout
                </button>
            ) : (
                <button onClick={() => navigate('/login')} className="border border-black px-6 py-2 rounded-lg">
                  Member Login
                </button>
            )}
        </div>
      </header>

      <div className="flex gap-4 border-b border-gray-200 mb-8 pb-4 overflow-x-auto">
        {['All', 'Jagua', 'Henna', 'Tools'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${activeTab === tab ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {filteredProducts.length === 0 ? (
           <p className="col-span-full text-center text-gray-500 py-10">No products found. Add some in your Supabase dashboard!</p>
        ) : (
          filteredProducts.map(product => (
            <div key={product.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
              {/* If you add an image_url to your database later, change this to an <img src={product.image_url} /> */}
              <div className="text-6xl mb-4 text-center">🌿</div>
              <h3 className="font-serif text-xl mb-1">{product.name}</h3>
              <p className="text-gray-500 text-sm mb-4">{product.category}</p>
              <div className="flex justify-between items-center mt-auto">
                <span className="text-lg font-light">${Number(product.price).toFixed(2)}</span>
                
                <button 
                  onClick={() => handleAddToCart(product)}
                  disabled={addingToCart === product.id}
                  className="bg-gray-100 text-black border border-gray-300 px-4 py-2 rounded-full text-sm hover:bg-black hover:text-white transition-colors disabled:opacity-50"
                >
                  {addingToCart === product.id ? 'Saving...' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}