"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage("確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。完了したらログイン画面へ移動します。");
            // Optionally redirect after a delay or let user click
            setTimeout(() => {
                router.push("/admin/login");
            }, 5000);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#ebe6df] p-4">
            <div className="bg-white p-8 rounded-sm shadow-sm w-full max-w-md space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-serif text-wood">nua</h1>
                    <p className="text-gray-500 text-sm mt-2">管理者登録（初回のみ）</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-sm text-sm">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="bg-green-50 text-green-700 p-3 rounded-sm text-sm">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase text-gray-500 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-200 p-2 rounded-sm outline-none focus:border-wood"
                            placeholder="admin@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-500 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-200 p-2 rounded-sm outline-none focus:border-wood"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-wood text-white py-2 rounded-sm hover:bg-wood/90 transition-colors disabled:opacity-50"
                    >
                        {loading ? "登録処理中..." : "登録メールを送信"}
                    </button>
                    <p className="text-xs text-center text-gray-400">
                        ※登録完了後は、このページは削除するかアクセスできないようにしてください。
                    </p>
                </form>
            </div>
        </div>
    );
}
