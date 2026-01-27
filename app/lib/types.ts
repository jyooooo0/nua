export type Customer = {
    id: string
    created_at: string
    name: string
    email: string | null
    phone: string | null
    notes: string | null
}

export type Visit = {
    id: string
    created_at: string
    customer_id: string
    visit_date: string
    services: string[] | null // stored as array in Supabase
    price: number | null
    notes: string | null
}
