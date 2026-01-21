"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, List, Settings, LogOut, Bell, Wallet } from "lucide-react";
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
            {/* Desktop Navbar */}
            <nav className="hidden md:flex fixed top-0 left-0 right-0 h-20 bg-[#0B0F17]/80 backdrop-blur-xl z-[100] px-12 items-center justify-between border-b border-white/5">
                <Link href="/" className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:rotate-6 transition-all">
                        <Wallet className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <span className="font-black text-xl tracking-tighter text-white uppercase block leading-none italic">XMoney</span>
                        <span className="text-[8px] font-black text-slate-500 tracking-[0.4em] uppercase mt-1 block">Private Asset Mgt.</span>
                    </div>
                </Link>

                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-2xl border border-white/5">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-2.5 px-6 py-2.5 rounded-xl transition-all duration-300 font-black text-[10px] tracking-widest uppercase",
                                        isActive
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "text-slate-500 hover:text-white"
                                    )}
                                >
                                    <Icon size={14} strokeWidth={isActive ? 3 : 2} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-4 border-l border-white/10 pl-8">
                        <button className="text-slate-500 hover:text-white transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full border-2 border-[#0B0F17]" />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-rose-500 font-black text-[10px] tracking-widest hover:text-rose-400 transition-colors uppercase"
                        >
                            <LogOut size={16} />
                            <span>SAIR</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navbar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-24 bg-[#0B0F17]/95 backdrop-blur-2xl z-[100] px-8 flex items-center justify-between border-t border-white/5 pb-6">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 transition-all",
                                isActive ? "text-primary scale-110" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <Icon size={24} strokeWidth={isActive ? 3 : 2} />
                            <span className="text-[9px] font-black uppercase tracking-widest">{item.name}</span>
                        </Link>
                    );
                })}

                <button
                    onClick={handleLogout}
                    className="flex flex-col items-center justify-center gap-1 text-rose-500/80"
                >
                    <LogOut size={24} />
                    <span className="text-[9px] font-black uppercase tracking-widest">SAIR</span>
                </button>
            </nav>

            {/* Support Spacers */}
            <div className="h-20 hidden md:block" />
        </>
    );
}
