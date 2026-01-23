"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";

export default function ThemeProviderLayout({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [isLoginPage, setIsLoginPage] = useState(false);

    // Detecta se está na página de login
    useEffect(() => {
        const path = window.location.pathname;
        setIsLoginPage(path === "/login");
    }, []);

    // Aplica o tema inicial
    useEffect(() => {
        if (isLoginPage) {
            setTheme("light");
            document.documentElement.classList.remove("dark", "light");
            document.documentElement.classList.add("light");
            return;
        }

        const savedTheme = localStorage.getItem("user-theme") as "light" | "dark" | null;
        const initialTheme = savedTheme || "light";
        setTheme(initialTheme);
        document.documentElement.classList.remove("dark", "light");
        document.documentElement.classList.add(initialTheme);
    }, [isLoginPage]);

    // Função para alternar tema
    const toggleTheme = (newTheme: "light" | "dark") => {
        setTheme(newTheme);
        document.documentElement.classList.remove("dark", "light");
        document.documentElement.classList.add(newTheme);
        localStorage.setItem("user-theme", newTheme);
    };

    return (
        <>
            {/* Navbar agora recebe props tipadas */}
            <Navbar theme={theme} toggleTheme={toggleTheme} />

            <main className="pt-20 pb-32 md:pb-20 px-4 md:px-8 max-w-7xl mx-auto">
                {children}
            </main>
        </>
    );
}
