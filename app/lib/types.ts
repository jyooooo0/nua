// ========================
// Database Types (Schema V2)
// ========================

export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'resuggesting' | 'completed' | 'cancelled';

export type Menu = {
    id: string;
    name: string;
    name_en?: string;
    duration: number; // minutes
    price: number;
    description?: string;
    display_order: number;
};

export type Profile = {
    id: string;
    name: string;
    name_kana?: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
    notes?: string;
    created_at?: string;
};

export type Booking = {
    id: string;
    customer_id?: string;
    menu_id?: string;
    customer_name: string;    // Denormalized
    customer_email?: string;  // Denormalized
    customer_phone?: string;  // Denormalized
    menu_name: string;        // Denormalized
    menu_price?: number;      // Denormalized
    date: string;       // YYYY-MM-DD
    start_time: string; // HH:MM:SS
    end_time: string;   // HH:MM:SS
    status: BookingStatus;
    staff_notes?: string;
    photo_urls?: string[];
    created_at?: string;
};

export type AdminSchedule = {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    type: 'closed' | 'break' | 'other';
    label?: string;
};

// ========================
// Legacy Types (To be removed)
// ========================
export type Customer = Profile;
export type Visit = {
    id: string;
    date: string;
    menu: string;
    price: number;
    notes: string;
    photos?: string[];
};
