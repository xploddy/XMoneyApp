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
        <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#0B0F17] flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
            {/* Background Decor - Pure Light and Pure Dark */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/[0.05] dark:bg-primary/[0.1] rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary/[0.05] dark:bg-secondary/[0.1] rounded-full blur-[120px]" />

            <div className="w-full max-w-md space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="text-center space-y-4">
                    <div className="w-18 h-18 bg-primary mx-auto rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/20 hover:rotate-6 transition-all duration-300">
                        <Wallet className="text-white w-9 h-9" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">XFinance</h1>
                        <p className="text-slate-400 dark:text-slate-500 font-bold text-[9px] tracking-[0.4em] uppercase mt-2">Private Asset Mgt.</p>
                    </div>
                </div>

                <div className="p-8 md:p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 transition-all">
                    <div className="flex mb-8 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <button
                            onClick={() => setMode("login")}
                            className={cn(
                                "flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                                mode === "login" ? "bg-white dark:bg-slate-800 text-primary shadow-md" : "text-slate-400 dark:text-slate-600"
                            )}
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => setMode("signup")}
                            className={cn(
                                "flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                                mode === "signup" ? "bg-white dark:bg-slate-800 text-primary shadow-md" : "text-slate-400 dark:text-slate-600"
                            )}
                        >
                            Registrar
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {mode === "signup" && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                        placeholder="Identificação"
                                        className="w-full bg-[#FFFFFF] dark:bg-[#0F172A] border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-14 pr-6 font-black outline-none focus:border-primary transition-all text-slate-900 dark:text-white text-sm placeholder:text-slate-200 dark:placeholder:text-slate-800"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Acesso via E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder="gestor@xfinance.com"
                                    className="w-full bg-[#FFFFFF] dark:bg-[#0F172A] border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-14 pr-6 font-black outline-none focus:border-primary transition-all text-slate-900 dark:text-white text-sm placeholder:text-slate-200 dark:placeholder:text-slate-800"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                                Chave de Segurança
                                {mode === "login" && <button type="button" className="text-primary hover:underline lowercase tracking-normal font-black">Esqueceu?</button>}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-[#FFFFFF] dark:bg-[#0F172A] border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-14 pr-6 font-black outline-none focus:border-primary transition-all text-slate-900 dark:text-white text-sm placeholder:text-slate-200 dark:placeholder:text-slate-800"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-900/20 text-rose-600 dark:text-rose-500 font-black text-[9px] uppercase tracking-widest text-center rounded-xl animate-in fade-in zoom-in-95 duration-300">
                                {error}
                            </p>
                        )}

                        <button
                            disabled={isLoading}
                            className="w-full bg-primary py-5 rounded-2xl font-black text-white shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 group"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span className="text-[11px] tracking-[0.2em] uppercase">{mode === "login" ? "Entrar no Terminal" : "Finalizar Cadastro"}</span>
                                    {mode === "login" ? <LogIn size={18} className="group-hover:translate-x-1 transition-transform" /> : <UserPlus size={18} className="group-hover:translate-x-1 transition-transform" />}
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-400 dark:text-slate-600 font-black text-[10px] uppercase tracking-widest">
                    Sistema de Gestão de Ativos Privados v2.0
                </p>
            </div>
        </div>
    );
}
