"use client";

import { useEffect } from "react";

export default function ThemeInit() {
    useEffect(() => {
        const savedTheme = localStorage.getItem("xmoney_theme") || "dark";
        const root = document.documentElement;

        root.classList.remove("dark", "light");
        root.classList.add(savedTheme);
    }, []);

    return null;
}
