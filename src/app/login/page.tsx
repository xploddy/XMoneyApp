"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Lock, Mail, ArrowRight, Loader2, UserPlus, LogIn, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        setError("");
    }, [mode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            console.log("Starting Auth Process...", { mode, email });

            if (mode === "login") {
                const { data, error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                console.log("Supabase Login Response:", { data, error: authError });

                if (authError) {
                    if (authError.message.includes("Email not confirmed")) {
                        throw new Error("E-MAIL NÃO CONFIRMADO: Verifique seu e-mail ou desative a confirmação no painel do Supabase (Authentication > Providers > Email).");
                    }
                    if (authError.message.includes("Invalid login credentials")) {
                        throw new Error("CREDENCIAIS INVÁLIDAS: Verifique seu e-mail e senha.");
                    }
                    throw authError;
                }

                if (data.session) {
                    console.log("Session established, redirecting...");
                    window.location.href = "/"; // Direct redirect for cleaner state
                } else {
                    console.warn("Auth successful but no session returned.");
                    setError("Autenticação aceita, mas a sessão não foi criada. Tente novamente.");
                    setIsLoading(false);
                }
            } else {
                const { data, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name: name || "Novo Usuário",
                        },
                    },
                });

                console.log("Supabase SignUp Response:", { data, error: authError });

                if (authError) throw authError;

                if (data.user && data.session) {
                    window.location.href = "/";
                } else {
                    setError("CONTA CRIADA! Verifique seu e-mail para confirmar o acesso e poder logar.");
                    setIsLoading(false);
                }
            }
        } catch (err: any) {
            console.error("Critical Auth Error:", err);
            setError(err.message || "Falha técnica na comunicação com o Supabase.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden transition-all duration-700">
            {/* Ambient Background - Gradient Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 dark:bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-[100px]" />

            <div className="w-full max-w-[440px] space-y-8 relative z-10">
                <div className="text-center space-y-6">
                    <div className="inline-flex p-4 rounded-[2rem] bg-white dark:bg-slate-900 shadow-2xl shadow-primary/10 border border-slate-100 dark:border-white/5 group hover:scale-110 transition-all duration-500">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-all">
                            <Wallet className="text-white w-7 h-7" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black tracking-[ -0.05em] text-slate-900 dark:text-white leading-none">
                            X<span className="text-primary">Finance</span>
                        </h1>
                        <p className="text-slate-400 dark:text-slate-500 font-black text-[10px] tracking-[0.5em] uppercase">Private Asset Management</p>
                    </div>
                </div>

                <div className="group premium-card p-10 rounded-[3rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white dark:border-white/5 transition-all duration-500 hover:shadow-primary/5">
                    <div className="flex mb-10 bg-slate-100/50 dark:bg-slate-950/50 p-1.5 rounded-[1.5rem] border border-slate-200/50 dark:border-white/5">
                        <button
                            onClick={() => setMode("login")}
                            className={cn(
                                "flex-1 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300",
                                mode === "login"
                                    ? "bg-white dark:bg-slate-800 text-primary shadow-xl shadow-black/5 dark:shadow-none scale-100"
                                    : "text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400"
                            )}
                        >
                            Terminal
                        </button>
                        <button
                            onClick={() => setMode("signup")}
                            className={cn(
                                "flex-1 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300",
                                mode === "signup"
                                    ? "bg-white dark:bg-slate-800 text-primary shadow-xl shadow-black/5 dark:shadow-none scale-100"
                                    : "text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400"
                            )}
                        >
                            Acesso
                        </button>
                    </div>

                    {mode === "login" ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">Identificação</label>
                                <div className="relative group">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        className="w-full bg-slate-50 dark:bg-slate-950/50 border-2 border-slate-100 dark:border-white/5 rounded-[1.5rem] py-5 pl-16 pr-6 font-bold outline-none focus:border-primary/50 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-900 dark:text-white text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <div className="flex justify-between items-center ml-4">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Senha Criptografada</label>
                                    <button type="button" className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">Reset</button>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 dark:bg-slate-950/50 border-2 border-slate-100 dark:border-white/5 rounded-[1.5rem] py-5 pl-16 pr-6 font-bold outline-none focus:border-primary/50 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-900 dark:text-white text-sm"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                                    <p className="text-rose-500 font-black text-[10px] uppercase tracking-widest leading-relaxed">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <button
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-primary to-indigo-600 py-5 rounded-[1.5rem] font-black text-white shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 group overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-white/20 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={22} />
                                ) : (
                                    <>
                                        <span className="text-[11px] tracking-[0.2em] uppercase">Autenticar Sistema</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">Nome Completo</label>
                                <div className="relative group">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex: Alexandre H."
                                        className="w-full bg-slate-50 dark:bg-slate-950/50 border-2 border-slate-100 dark:border-white/5 rounded-[1.5rem] py-5 pl-16 pr-6 font-bold outline-none focus:border-primary/50 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-900 dark:text-white text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">E-mail de Acesso</label>
                                <div className="relative group">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        className="w-full bg-slate-50 dark:bg-slate-950/50 border-2 border-slate-100 dark:border-white/5 rounded-[1.5rem] py-5 pl-16 pr-6 font-bold outline-none focus:border-primary/50 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-900 dark:text-white text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">Nova Senha</label>
                                <div className="relative group">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 dark:bg-slate-950/50 border-2 border-slate-100 dark:border-white/5 rounded-[1.5rem] py-5 pl-16 pr-6 font-bold outline-none focus:border-primary/50 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-900 dark:text-white text-sm"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                                    <p className="text-rose-500 font-black text-[10px] uppercase tracking-widest leading-relaxed">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <button
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-primary to-indigo-600 py-5 rounded-[1.5rem] font-black text-white shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 group"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={22} />
                                ) : (
                                    <>
                                        <span className="text-[11px] tracking-[0.2em] uppercase">Criar Conta Master</span>
                                        <UserPlus size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <div className="flex items-center justify-between px-6 opacity-40 hover:opacity-100 transition-opacity duration-500">
                    <p className="text-[9px] text-slate-400 dark:text-slate-600 font-black tracking-widest uppercase">Encrypted Connection</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-600 font-black tracking-widest uppercase text-right">v2.4.0-PRO</p>
                </div>
            </div>

            <p className="absolute bottom-6 left-0 right-0 text-center text-slate-400 dark:text-slate-600 font-black text-[10px] uppercase tracking-widest opacity-20">
                Sistema de Gestão de Ativos Privados v2.4 PRO
            </p>
        </div>
    );
}
