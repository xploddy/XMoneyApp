"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";

export default function ThemeProviderLayout({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<"light" | "dark" | null>(null); // null = ainda carregando

    useEffect(() => {
        if (typeof window === "undefined") return;

        const path = window.location.pathname;

        let initialTheme: "light" | "dark";
        if (path === "/login") {
            initialTheme = "light";
        } else {
            initialTheme = (localStorage.getItem("user-theme") as "light" | "dark") || "light";
        }

        setTheme(initialTheme);
        document.documentElement.classList.remove("dark", "light");
        document.documentElement.classList.add(initialTheme);
    }, []);

    const toggleTheme = (newTheme: "light" | "dark") => {
        setTheme(newTheme);
        document.documentElement.classList.remove("dark", "light");
        document.documentElement.classList.add(newTheme);
        localStorage.setItem("user-theme", newTheme);
    };

    // não renderiza nada até ter definido o tema
    if (!theme) return null;

    return (
        <>
            <Navbar theme={theme} toggleTheme={toggleTheme} />
            <main className="pt-20 pb-32 md:pb-20 px-4 md:px-8 max-w-7xl mx-auto">
                {children}
            </main>
        </>
    );
}
