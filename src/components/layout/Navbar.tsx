"use client";

import Link from "next/link";
import { Wallet, LayoutDashboard, List, PlusCircle, Settings, LogOut, ChevronRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { supabase } from "@/lib/supabase";

const navItems = [
    { name: "PAINEL", href: "/", icon: LayoutDashboard },
    { name: "HISTÓRICO", href: "/transactions", icon: List },
    { name: "AJUSTES", href: "/settings", icon: Settings },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();

    if (pathname === "/login") return null;

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    return (
        <>
            {/* Desktop Header */}
            <nav className="hidden md:flex fixed top-0 left-0 right-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-50 px-12 items-center justify-between border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
                <Link href="/" className="flex items-center gap-4 group">
                    <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:rotate-6 transition-all duration-500">
                        <Wallet className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <span className="font-black text-xl tracking-tighter text-slate-900 dark:text-white uppercase block leading-none">XFinance</span>
                        <span className="text-[7.5px] font-black text-slate-400 dark:text-slate-500 tracking-[0.3em] uppercase mt-1 block">Private Asset Mgt.</span>
                    </div>
                </Link>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-2.5 px-6 py-3 rounded-xl transition-all duration-300 font-black text-[9px] tracking-widest uppercase",
                                        isActive
                                            ? "bg-white dark:bg-slate-800 text-primary shadow-md border border-slate-100 dark:border-slate-700"
                                            : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                                    )}
                                >
                                    <Icon size={14} strokeWidth={isActive ? 3 : 2} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[9px] tracking-widest text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-100"
                    >
                        <LogOut size={14} />
                        <span>SAIR</span>
                    </button>
                </div>
            </nav>

            {/* Mobile Sidebar Navigation */}
            <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] bg-white dark:bg-slate-900 rounded-[2.5rem] h-20 z-[9999] px-8 flex items-center justify-between shadow-2xl border border-slate-100 dark:border-slate-800 transition-all duration-300">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center transition-all duration-300",
                                isActive
                                    ? "text-primary scale-110"
                                    : "text-slate-300 dark:text-slate-500 hover:text-primary dark:hover:text-slate-300"
                            )}
                        >
                            <Icon size={24} strokeWidth={isActive ? 3 : 2} />
                            <span className="text-[8px] font-black mt-1 uppercase tracking-widest">{item.name}</span>
                        </Link>
                    );
                })}

                <button
                    onClick={handleLogout}
                    className="flex flex-col items-center justify-center text-rose-400 hover:animate-pulse"
                >
                    <LogOut size={24} />
                    <span className="text-[8px] font-black mt-1 uppercase tracking-widest">Sair</span>
                </button>
            </nav>
        </>
    );
}
