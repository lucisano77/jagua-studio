import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { customer_name, customer_email, customer_phone, customer_address, payment_method, total_amount, cart_items } = req.body;

  try {
    // 1. Write core transaction record to orders
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_name,
        customer_email,
        customer_phone,
        customer_address,
        payment_method,
        total_amount,
        status: 'not paid'
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Map and write detailed items array into order_items
    const itemRows = cart_items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_time: item.products.price
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemRows);
    if (itemsError) throw itemsError;

    return res.status(200).json({ success: true, orderId: order.id });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}