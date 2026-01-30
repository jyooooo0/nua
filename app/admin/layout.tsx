"use client";

import Link from "next/link";
import AuthGuard from "../components/AuthGuard";
import { usePathname } from "next/navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path || pathname?.startsWith(`${path}/`);
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-[#ebe6df]">
                <header className="bg-white border-b border-wood/10 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
                    <div>
                        <h1 className="font-serif text-xl text-wood">nua 管理画面</h1>
                        <p className="text-xs text-gray-400">Admin Dashboard (V2.0)</p>
                    </div>
                    <nav className="flex gap-4 text-sm">
                        <Link
                            href="/admin"
                            className={`transition-colors ${pathname === '/admin' ? 'text-wood font-bold border-b-2 border-wood' : 'text-gray-500 hover:text-wood'}`}
                        >
                            ダッシュボード
                        </Link>
                        <Link
                            href="/admin/customers"
                            className={`transition-colors ${isActive('/admin/customers') ? 'text-wood font-bold border-b-2 border-wood' : 'text-gray-500 hover:text-wood'}`}
                        >
                            顧客管理
                        </Link>
                        <Link
                            href="/admin/settings/menus"
                            className={`transition-colors ${isActive('/admin/settings/menus') ? 'text-wood font-bold border-b-2 border-wood' : 'text-gray-500 hover:text-wood'}`}
                        >
                            メニュー設定
                        </Link>
                    </nav>
                </header>

                <main className="p-6 max-w-6xl mx-auto">
                    {children}
                </main>
            </div>
        </AuthGuard>
    );
}
