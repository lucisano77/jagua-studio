import { createClient } from '@supabase/supabase-js';
import { validateOrderData } from '../src/utils/validator.mjs';

// Initialize Supabase (Ensure env variables are set in production)
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-local-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

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

        return res.status(200).json({ 
            success: true, 
            orderId: order.id 
        });

    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}