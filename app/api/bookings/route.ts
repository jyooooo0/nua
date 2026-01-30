import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase Client with Service Role Key for admin privileges (bypassing RLS)
// Fallback to Anon key if Service Key is missing (might fail if RLS is strict)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            name,
            email,
            phone,
            menu_id,
            menu_name,
            menu_price,
            date,
            start_time,
            end_time,
            staff_notes
        } = body;

        // 1. Customer Matching Logic
        // Normalize input name (remove all spaces)
        const cleanInputName = name.replace(/[\s\u3000]+/g, '');

        // Search for existing customers by Email OR Phone
        const { data: candidates, error: searchError } = await supabaseAdmin
            .from('customers')
            .select('*')
            .or(`email.eq.${email},phone.eq.${phone}`);

        if (searchError) {
            console.error("Error searching customers:", searchError);
            return NextResponse.json({ error: searchError.message }, { status: 500 });
        }

        let customerId = null;

        // Check for Name Match among candidates (Fuzzy match ignoring spaces)
        if (candidates && candidates.length > 0) {
            const match = candidates.find(c => {
                const cleanCandidateName = c.name.replace(/[\s\u3000]+/g, '');
                return cleanCandidateName === cleanInputName;
            });

            if (match) {
                customerId = match.id;
                // Optional: Update customer info if needed (e.g. latest phone/email)
            }
        }

        // 2. If no matching customer found, Create New Customer
        if (!customerId) {
            const { data: newCustomer, error: createError } = await supabaseAdmin
                .from('customers')
                .insert([{
                    name,
                    email,
                    phone,
                    // Note: If 'profiles' is linked to Auth, this might be separate. 
                    // But assuming 'customers' is a standalone table for the salon.
                }])
                .select()
                .single();

            if (createError) {
                console.error("Error creating customer:", createError);
                // If error is unique violation, fallback to finding strict match?
                // For now, return error.
                return NextResponse.json({ error: "Failed to create customer: " + createError.message }, { status: 500 });
            }
            customerId = newCustomer.id;
        }

        // 3. Create Booking
        const { error: bookingError } = await supabaseAdmin
            .from('bookings')
            .insert([{
                customer_id: customerId,
                customer_name: name,
                customer_email: email,
                customer_phone: phone,
                menu_id,
                menu_name,
                menu_price,
                date,
                start_time,
                end_time,
                status: 'pending',
                staff_notes
            }]);

        if (bookingError) {
            return NextResponse.json({ error: bookingError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, customerId });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
