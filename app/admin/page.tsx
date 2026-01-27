"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data
const initialReservations = [
    { id: 1, name: "Yamada Hanako", menu: "Cut & Color", date: "2024-02-14", time: "10:00", source: "Web", status: "Pending" },
    { id: 2, name: "Suzuki Ichiro", menu: "Perm", date: "2024-02-14", time: "14:00", source: "Web", status: "Confirmed" },
];

export default function AdminDashboard() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [passcode, setPasscode] = useState("");
    const [reservations, setReservations] = useState(initialReservations);
    const [showManualModal, setShowManualModal] = useState(false);

    // Login Mock
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (passcode === "0000") {
            setIsLoggedIn(true);
        } else {
            alert("Passcode is 0000");
        }
    };

    // Manual Add Mock
    const handleManualAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const newRes = {
            id: reservations.length + 1,
            name: formData.get("name") as string,
            menu: formData.get("menu") as string,
            date: formData.get("date") as string,
            time: formData.get("time") as string,
            source: formData.get("source") as string, // Phone / Instagram
            status: "Confirmed" // Manual entries are usually confirmed immediately
        };
        setReservations([newRes, ...reservations]);
        setShowManualModal(false);
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#ebe6df]">
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-sm shadow-sm text-center space-y-4 w-full max-w-xs">
                    <h1 className="text-xl font-serif text-wood">nua Admin</h1>
                    <input
                        type="password"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        placeholder="Passcode"
                        className="w-full border border-wood/20 p-2 rounded-sm text-center outline-none focus:border-wood"
                    />
                    <button className="w-full bg-wood text-white py-2 rounded-sm hover:bg-wood/90 transition-colors">LOGIN</button>
                    <p className="text-xs text-gray-400">Hint: 0000</p>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#ebe6df] pb-24">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-wood/10 px-6 py-4 flex justify-between items-center">
                <h1 className="font-serif text-xl text-wood">nua Admin Dashboard</h1>
                <button onClick={() => setIsLoggedIn(false)} className="text-xs text-wood/60 hover:text-wood">LOGOUT</button>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-sm shadow-sm border-l-4 border-wood">
                        <p className="text-xs text-gray-500 uppercase">Today's Reservations</p>
                        <p className="text-2xl font-bold text-wood">2</p>
                    </div>
                    <div className="bg-white p-4 rounded-sm shadow-sm border-l-4 border-accent">
                        <p className="text-xs text-gray-500 uppercase">Pending Requests</p>
                        <p className="text-2xl font-bold text-wood">1</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowManualModal(true)}
                        className="bg-wood text-white px-6 py-3 rounded-sm shadow-sm hover:bg-wood/90 transition-colors flex items-center gap-2 text-sm"
                    >
                        <span>+</span> Manual Reservation
                    </button>
                </div>

                {/* Reservation List */}
                <div className="bg-white rounded-sm shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-wood/10">
                        <h2 className="font-serif text-lg text-wood">Reservation List</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f9f8f6] text-wood/60 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Date / Time</th>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Menu</th>
                                    <th className="px-6 py-3">Source</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-wood/10">
                                {reservations.map((res) => (
                                    <tr key={res.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-xs text-xs ${res.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {res.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {res.date}<br />
                                            <span className="font-bold">{res.time}</span>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{res.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{res.menu}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs border border-gray-200 px-2 py-0.5 rounded-full text-gray-500">
                                                {res.source}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {res.status === "Pending" && (
                                                <div className="flex gap-2">
                                                    <button className="text-green-600 hover:text-green-800 text-xs border border-green-200 px-2 py-1 rounded-sm">Approve</button>
                                                    <button className="text-red-600 hover:text-red-800 text-xs border border-red-200 px-2 py-1 rounded-sm">Decline</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Manual Entry Modal */}
            <AnimatePresence>
                {showManualModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-md rounded-sm shadow-lg overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-wood/10 flex justify-between items-center">
                                <h3 className="font-serif text-lg text-wood">New Manual Reservation</h3>
                                <button onClick={() => setShowManualModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
                            </div>
                            <form onSubmit={handleManualAdd} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Source</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="source" value="Phone" defaultChecked className="accent-wood" />
                                            <span className="text-sm">Phone calls</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="source" value="Instagram" className="accent-wood" />
                                            <span className="text-sm">Instagram DM</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Customer Name</label>
                                    <input name="name" required className="w-full border border-gray-200 p-2 rounded-sm outline-none focus:border-wood" placeholder="Customer Name" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase text-gray-500 mb-1">Date</label>
                                        <input type="date" name="date" required className="w-full border border-gray-200 p-2 rounded-sm outline-none focus:border-wood" />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase text-gray-500 mb-1">Time</label>
                                        <input type="time" name="time" required className="w-full border border-gray-200 p-2 rounded-sm outline-none focus:border-wood" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Menu</label>
                                    <select name="menu" className="w-full border border-gray-200 p-2 rounded-sm outline-none focus:border-wood">
                                        <option>Cut</option>
                                        <option>Cut & Color</option>
                                        <option>Perm</option>
                                        <option>Head Spa</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setShowManualModal(false)} className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-sm hover:bg-gray-50">Cancel</button>
                                    <button type="submit" className="flex-1 py-2 bg-wood text-white rounded-sm hover:bg-wood/90">Add Reservation</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
