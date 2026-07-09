import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function AdminDashboard() {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Jagua', 
    price: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleAddNewProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .insert([
          { 
            name: formData.name, 
            category: formData.category, 
            price: parseFloat(formData.price),
            description: formData.description 
          }
        ]);

      if (error) throw error;

      alert("Product added successfully!");
      setFormData({ name: '', category: 'Jagua', price: '', description: '' });
    } catch (error) {
      console.error("Error adding product:", error.message);
      alert(`Failed to add product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container" style={{ maxWidth: '500px', margin: '40px auto', padding: '20px' }}>
      <h2 className="text-2xl font-serif mb-6">Admin Panel: Add New Product</h2>
      
      <form onSubmit={handleAddNewProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Product Name</label>
          <input 
            type="text" 
            placeholder="e.g., Premium Jagua Gel"
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Category</label>
          <select 
            value={formData.category} 
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="Jagua">Jagua</option>
            <option value="Henna">Henna</option>
            <option value="Tools">Tools</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Price (HKD)</label>
          <input 
            type="number" 
            step="0.01"
            placeholder="0.00"
            value={formData.price} 
            onChange={(e) => setFormData({...formData, price: e.target.value})} 
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
          <textarea 
            placeholder="Product details..."
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})} 
            rows="3"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '12px', background: 'black', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Adding...' : 'Upload Product to Store'}
        </button>
      </form>
    </div>
  );
}