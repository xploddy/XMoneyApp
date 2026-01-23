"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    List,
    Settings,
    LogOut,
    Bell,
    Wallet,
    Sun,
    Moon,
    Menu,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

const navItems = [
    { name: "PAINEL", href: "/", icon: LayoutDashboard },
    { name: "HISTÓRICO", href: "/transactions", icon: List },
    { name: "AJUSTES", href: "/settings", icon: Settings },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    if (pathname === "/login") return null;

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    const toggleTheme = () => {
        const root = document.documentElement;
        const isDark = root.classList.contains("dark");

        root.classList.remove("dark", "light");
        root.classList.add(isDark ? "light" : "dark");

        localStorage.setItem("xmoney_theme", isDark ? "light" : "dark");
    };

    const isDark =
        typeof window !== "undefined" &&
        document.documentElement.classList.contains("dark");

    return (
        <>
            {/* ================= DESKTOP NAVBAR ================= */}
            <nav className="hidden md:flex fixed top-0 left-0 right-0 h-20 bg-[var(--background)]/80 backdrop-blur-xl z-[100] px-12 items-center justify-between border-b border-[var(--card-border)]">
                <Link href="/" className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:rotate-6 transition-all">
                        <Wallet className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <span className="font-black text-xl tracking-tighter uppercase block leading-none italic text-foreground">
                            XMoney
                        </span>
                        <span className="text-[8px] font-black text-slate-500 tracking-[0.4em] uppercase mt-1 block">
                            Private Asset Mgt.
                        </span>
                    </div>
                </Link>

                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 bg-[var(--card-bg)]/60 p-1 rounded-2xl border border-[var(--card-border)]">
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
                                            : "text-slate-500 hover:text-foreground"
                                    )}
                                >
                                    <Icon size={14} strokeWidth={isActive ? 3 : 2} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-4 border-l border-[var(--card-border)] pl-8">
                        <button className="text-slate-500 hover:text-foreground transition relative">
                            <Bell size={20} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-[var(--card-bg)] transition"
                        >
                            {isDark ? (
                                <Sun size={20} className="text-yellow-400" />
                            ) : (
                                <Moon size={20} />
                            )}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-rose-500 font-black text-[10px] tracking-widest hover:text-rose-400 transition uppercase"
                        >
                            <LogOut size={16} />
                            SAIR
                        </button>
                    </div>
                </div>
            </nav>

            {/* ================= MOBILE TOP NAVBAR ================= */}
            <nav className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--background)]/95 backdrop-blur-xl z-[110] px-4 flex items-center justify-between border-b border-[var(--card-border)]">
                <Link href="/" className="flex items-center gap-2">
                    <Wallet className="w-6 h-6 text-primary" />
                    <span className="font-black text-sm text-foreground">XMoney</span>
                </Link>

                <button
                    onClick={() => setMobileOpen(true)}
                    className="p-2 rounded-lg hover:bg-[var(--card-bg)] transition"
                >
                    <Menu size={24} />
                </button>
            </nav>

            {/* ================= MOBILE DRAWER ================= */}
            {mobileOpen && (
                <div className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm">
                    <aside className="absolute top-0 right-0 w-72 h-full bg-[var(--card-bg)] shadow-xl p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <span className="font-black tracking-wide text-foreground">
                                Menu
                            </span>
                            <button onClick={() => setMobileOpen(false)}>
                                <X size={22} />
                            </button>
                        </div>

                        <nav className="flex flex-col gap-2 flex-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition",
                                            isActive
                                                ? "bg-[var(--background)] text-primary"
                                                : "text-slate-500 hover:text-foreground hover:bg-[var(--background)]"
                                        )}
                                    >
                                        <Icon size={18} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="border-t border-[var(--card-border)] pt-4 space-y-3">
                            <button
                                onClick={toggleTheme}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-foreground hover:bg-[var(--background)] transition"
                            >
                                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                                Mudar tema
                            </button>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition"
                            >
                                <LogOut size={18} />
                                Sair
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Spacers */}
            <div className="h-20 hidden md:block" />
            <div className="h-16 md:hidden" />
        </>
    );
}
