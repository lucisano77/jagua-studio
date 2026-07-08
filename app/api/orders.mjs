import { createClient } from '@supabase/supabase-js';
import { validateOrderData } from './utils/validator.mjs';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const orderData = req.body;
    const validationErrors = validateOrderData(orderData);
    
    if (validationErrors.length > 0) {
        return res.status(400).json({ errors: validationErrors });
    }

    try {
        const { data: order, error } = await supabase
            .from('orders')
            .insert([{
                customer_name: orderData.name,
                customer_email: orderData.email,
                customer_phone: orderData.phone,
                customer_address: orderData.address,
                payment_method: orderData.payment_method,
                total_amount: orderData.total_amount
            }])
            .select()
            .single();

        if (error) throw error;
        return res.status(200).json({ success: true, orderId: order.id });

    } catch (error) {
      console.error("SUPABASE INSERTION CRASH:", error)
      return res.status(500).json({
        error: 'Internal Server Error',
        details: error.message || error
      })
    }
}