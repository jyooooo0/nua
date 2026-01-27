"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<any>(null);
    const router = useRouter();
    const hasRedirected = useRef(false);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session && !hasRedirected.current) {
                hasRedirected.current = true;
                router.replace("/admin/login");
            } else {
                setSession(session);
            }
            setLoading(false);
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (!session && !hasRedirected.current) {
                hasRedirected.current = true;
                router.replace("/admin/login");
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    if (loading) {
        return <div className="min-h-screen bg-[#ebe6df] flex items-center justify-center text-wood">読み込み中...</div>;
    }

    if (!session) {
        return null; // Will redirect
    }

    return <>{children}</>;
}
