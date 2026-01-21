"use client";

import { useState, useEffect, useRef } from "react";
import { User, Database, Shield, Moon, Sun, Trash2, Download, Upload, CheckCircle2, Save, Users, Crown, Settings, LogOut, Bell, DollarSign, Calendar, Tag, Target, Lock, Eye, EyeOff, Palette, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface XUser {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "USER";
    created_at: string;
}

export default function SettingsPage() {
    const [theme, setTheme] = useState("system");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [budgetGoal, setBudgetGoal] = useState("");
    const [currency, setCurrency] = useState("BRL");
    const [monthStartDay, setMonthStartDay] = useState("1");
    const [isSaved, setIsSaved] = useState(false);
    const [activeTab, setActiveTab] = useState("conta");
    const [users, setUsers] = useState<XUser[]>([]);
    const [userRole, setUserRole] = useState("USER");
    const [showPassword, setShowPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [categories, setCategories] = useState<string[]>([]);
    const [newCategory, setNewCategory] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profile) {
                setName(profile.name || "");
                setEmail(session.user.email || "");
                setUserRole(profile.role || "USER");
            }

            const savedTheme = localStorage.getItem("xmoney_theme") || "system";
            setTheme(savedTheme);
            applyTheme(savedTheme);

            const savedBudget = localStorage.getItem("xmoney_budget_goal") || "";
            setBudgetGoal(savedBudget);

            const savedCurrency = localStorage.getItem("xmoney_currency") || "BRL";
            setCurrency(savedCurrency);

            const savedMonthStart = localStorage.getItem("xmoney_month_start") || "1";
            setMonthStartDay(savedMonthStart);

            const savedCategories = localStorage.getItem("xmoney_categories");
            if (savedCategories) {
                setCategories(JSON.parse(savedCategories));
            } else {
                setCategories(["Alimentação", "Lazer", "Aluguel", "Transporte", "Saúde", "Salário", "Assinaturas", "Outros"]);
            }

            if (profile?.role === "ADMIN") {
                fetchTeam();
            }
        };

        init();
    }, []);

    const fetchTeam = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Erro ao carregar equipe:", error);
            return;
        }
        if (data) setUsers(data as XUser[]);
    };

    const applyTheme = (newTheme: string) => {
        const root = document.documentElement;
        if (newTheme === "dark") {
            root.classList.add("dark");
        } else if (newTheme === "light") {
            root.classList.remove("dark");
        } else {
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                root.classList.add("dark");
            } else {
                root.classList.remove("dark");
            }
        }
    };

    const handleSave = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { error } = await supabase
            .from('profiles')
            .update({ name })
            .eq('id', session.user.id);

        localStorage.setItem("xmoney_theme", theme);
        localStorage.setItem("xmoney_budget_goal", budgetGoal);
        localStorage.setItem("xmoney_currency", currency);
        localStorage.setItem("xmoney_month_start", monthStartDay);
        localStorage.setItem("xmoney_categories", JSON.stringify(categories));
        applyTheme(theme);

        if (!error) {
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        }
    };

    const handlePasswordChange = async () => {
        if (!newPassword || newPassword.length < 6) {
            alert("A senha deve ter no mínimo 6 caracteres");
            return;
        }

        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            alert("Erro ao alterar senha: " + error.message);
        } else {
            alert("Senha alterada com sucesso!");
            setNewPassword("");
        }
    };

    const addCategory = () => {
        if (newCategory && !categories.includes(newCategory)) {
            setCategories([...categories, newCategory]);
            setNewCategory("");
        }
    };

    const removeCategory = (cat: string) => {
        setCategories(categories.filter(c => c !== cat));
    };

    const handleBackup = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', session.user.id)
            .order('date', { ascending: false });

        if (error || !data) {
            alert("Erro ao gerar backup: " + (error?.message || "Sem dados"));
            return;
        }

        const workbook = XLSX.utils.book_new();
        const groups: Record<string, any[]> = {};

        data.forEach(t => {
            const parts = t.date.split('-');
            const monthLabel = format(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1), "MMMM_yyyy", { locale: ptBR }).toUpperCase();
            if (!groups[monthLabel]) groups[monthLabel] = [];

            const [yearStr, monthStr, dayStr] = t.date.split('-');
            groups[monthLabel].push({
                "DIA": dayStr,
                "DATA COMPLETA": `${dayStr}/${monthStr}/${yearStr}`,
                "CATEGORIA": t.category.toUpperCase(),
                "DESCRIÇÃO": t.description || "Geral",
                "TIPO": t.type === "INCOME" ? "ENTRADA" : "SAÍDA",
                "VALOR": t.amount,
                "STATUS": t.paid ? "LIQUIDADO" : "PENDENTE",
                "RAW_DATA": JSON.stringify(t)
            });
        });

        Object.keys(groups).sort().reverse().forEach(label => {
            const worksheet = XLSX.utils.json_to_sheet(groups[label]);
            worksheet['!cols'] = [{ wch: 6 }, { wch: 15 }, { wch: 20 }, { wch: 35 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 0 }];
            XLSX.utils.book_append_sheet(workbook, worksheet, label.slice(0, 31));
        });

        XLSX.writeFile(workbook, `XMONEY_BACKUP_${format(new Date(), "dd-MM-yyyy")}.xlsx`);
    };

    const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const workbook = XLSX.read(bstr, { type: 'binary' });
                const transactionsToUpsert: any[] = [];

                for (const sheetName of workbook.SheetNames) {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

                    jsonData.forEach(row => {
                        let id = undefined;
                        if (row["RAW_DATA"]) {
                            try {
                                const raw = JSON.parse(row["RAW_DATA"]);
                                id = raw.id;
                            } catch { }
                        }

                        let dateISO = new Date().toISOString().split('T')[0];
                        if (row["DATA COMPLETA"]) {
                            const parts = row["DATA COMPLETA"].toString().split('/');
                            if (parts.length === 3) dateISO = `${parts[2]}-${parts[1]}-${parts[0]}`;
                        }

                        const transaction = {
                            ...(id ? { id } : {}),
                            user_id: session.user.id,
                            date: dateISO,
                            amount: parseFloat(row["VALOR"]) || 0,
                            description: row["DESCRIÇÃO"] || "",
                            category: row["CATEGORIA"] || "Outros",
                            type: (row["TIPO"] === "ENTRADA") ? "INCOME" : "EXPENSE",
                            paid: (row["STATUS"] === "LIQUIDADO")
                        };

                        transactionsToUpsert.push(transaction);
                    });
                }

                if (transactionsToUpsert.length > 0) {
                    const { error } = await supabase.from('transactions').upsert(transactionsToUpsert);

                    if (error) {
                        alert("Erro na sincronização: " + error.message);
                        return;
                    }
                }

                alert(`✅ ${transactionsToUpsert.length} registros processados.`);
                window.location.reload();

            } catch (error) {
                alert("Erro ao processar arquivo.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const tabs = [
        { id: "conta", label: "Conta", icon: User },
        { id: "preferencias", label: "Preferências", icon: Settings },
        { id: "orcamento", label: "Orçamento", icon: Target },
        { id: "notificacoes", label: "Notificações", icon: Bell },
        { id: "aparencia", label: "Aparência", icon: Palette },
        { id: "dados", label: "Dados", icon: Database },
        { id: "usuarios", label: "Equipe", icon: Users },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 py-10 px-4 md:px-6 animate-in fade-in duration-700 pb-32">
            <header className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">Ajustes</h1>
                    <p className="text-slate-500 font-bold text-[10px] tracking-widest uppercase">Configurações do Sistema</p>
                </div>
                <button
                    onClick={async () => {
                        await supabase.auth.signOut();
                        router.push('/login');
                    }}
                    className="flex items-center gap-2 px-5 py-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all border border-rose-100 dark:border-rose-900/20"
                >
                    <LogOut size={16} strokeWidth={3} /> Sair
                </button>
            </header>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto scrollbar-hide">
                {tabs.filter(t => t.id !== 'usuarios' || userRole?.toUpperCase() === 'ADMIN').map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex-1 min-w-[100px]",
                            activeTab === tab.id
                                ? "bg-white dark:bg-slate-800 text-primary shadow-xl shadow-primary/5 border border-slate-100 dark:border-slate-700"
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        )}
                    >
                        <tab.icon size={14} />
                        <span className="hidden md:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="mt-6">
                {/* CONTA E SEGURANÇA */}
                {activeTab === "conta" && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                        <section className="premium-card p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-8">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-primary/5 dark:bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><User size={28} /></div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white">Informações da Conta</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dados pessoais e credenciais</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Nome Completo</label>
                                    <input
                                        type="text" value={name} onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 py-4 px-6 rounded-2xl outline-none focus:border-primary font-black text-sm text-slate-900 dark:text-white transition-all shadow-inner"
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">E-mail</label>
                                    <input
                                        type="email" value={email} disabled
                                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-4 px-6 rounded-2xl outline-none font-black text-sm text-slate-500 cursor-not-allowed shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-5 mb-6">
                                    <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500"><Lock size={24} /></div>
                                    <div>
                                        <h4 className="text-lg font-black text-slate-800 dark:text-white">Alterar Senha</h4>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Mínimo 6 caracteres</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1 relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Nova senha"
                                            className="w-full bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 py-4 px-6 pr-12 rounded-2xl outline-none focus:border-primary font-black text-sm text-slate-900 dark:text-white transition-all shadow-inner"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <button
                                        onClick={handlePasswordChange}
                                        className="px-8 py-4 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
                                    >
                                        Atualizar
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* PREFERÊNCIAS FINANCEIRAS */}
                {activeTab === "preferencias" && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                        <section className="premium-card p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-8">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500"><DollarSign size={28} /></div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white">Preferências Financeiras</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Moeda, datas e categorias</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Moeda Padrão</label>
                                    <select
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        className="w-full bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 py-4 px-6 rounded-2xl outline-none focus:border-primary font-black text-sm text-slate-900 dark:text-white transition-all shadow-inner appearance-none"
                                    >
                                        <option value="BRL">BRL - Real Brasileiro</option>
                                        <option value="USD">USD - Dólar Americano</option>
                                        <option value="EUR">EUR - Euro</option>
                                    </select>
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Início do Mês</label>
                                    <select
                                        value={monthStartDay}
                                        onChange={(e) => setMonthStartDay(e.target.value)}
                                        className="w-full bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 py-4 px-6 rounded-2xl outline-none focus:border-primary font-black text-sm text-slate-900 dark:text-white transition-all shadow-inner appearance-none"
                                    >
                                        {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                                            <option key={day} value={day}>Dia {day}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-5 mb-6">
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500"><Tag size={24} /></div>
                                    <div>
                                        <h4 className="text-lg font-black text-slate-800 dark:text-white">Categorias Personalizadas</h4>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Gerencie suas categorias</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 mb-4">
                                    <input
                                        type="text"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        placeholder="Nova categoria"
                                        className="flex-1 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 py-3 px-5 rounded-xl outline-none focus:border-primary font-black text-sm text-slate-900 dark:text-white transition-all shadow-inner"
                                    />
                                    <button
                                        onClick={addCategory}
                                        className="px-6 py-3 bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all"
                                    >
                                        Adicionar
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {categories.map(cat => (
                                        <div key={cat} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                                            <span className="text-xs font-black text-slate-700 dark:text-slate-300">{cat}</span>
                                            <button
                                                onClick={() => removeCategory(cat)}
                                                className="text-rose-500 hover:text-rose-600"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* ORÇAMENTO E METAS */}
                {activeTab === "orcamento" && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                        <section className="premium-card p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-8">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500"><Target size={28} /></div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white">Orçamento e Metas</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Defina limites e objetivos</p>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Meta de Gastos Mensal</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300">R$</span>
                                    <input
                                        type="number"
                                        value={budgetGoal}
                                        onChange={(e) => setBudgetGoal(e.target.value)}
                                        className="w-full bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 py-4 pl-12 pr-6 rounded-2xl outline-none focus:border-primary font-black text-sm text-slate-900 dark:text-white transition-all shadow-inner"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* NOTIFICAÇÕES */}
                {activeTab === "notificacoes" && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                        <section className="premium-card p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500"><Bell size={28} /></div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white">Notificações</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Em desenvolvimento</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500">Funcionalidade de notificações será implementada em breve.</p>
                        </section>
                    </div>
                )}

                {/* APARÊNCIA */}
                {activeTab === "aparencia" && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                        <section className="premium-card p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-8">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500"><Palette size={28} /></div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white">Aparência</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tema e personalização</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Tema do Sistema</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: "light", icon: Sun, label: "CLARO" },
                                        { id: "dark", icon: Moon, label: "ESCURO" },
                                        { id: "system", icon: Settings, label: "AUTO" }
                                    ].map((t) => (
                                        <button
                                            key={t.id} onClick={() => setTheme(t.id)}
                                            className={cn(
                                                "flex flex-col items-center justify-center gap-2 py-6 rounded-2xl font-black text-[8px] uppercase border-2 transition-all",
                                                theme === t.id
                                                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                                    : "bg-white dark:bg-slate-950 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-slate-200"
                                            )}
                                        >
                                            <t.icon size={20} /> {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* DADOS E BACKUP */}
                {activeTab === "dados" && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                        <section className="premium-card p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-8">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-500"><Database size={28} /></div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white">Dados e Backup</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exportar e importar</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <button onClick={handleBackup} className="flex flex-col items-center justify-center gap-5 p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl group hover:border-primary transition-all bg-slate-50/50 dark:bg-slate-950/20">
                                    <Download size={32} className="text-slate-300 group-hover:text-primary transition-all transform group-hover:-translate-y-1" />
                                    <div className="text-center">
                                        <p className="font-black text-xs uppercase tracking-[0.2em] text-slate-900 dark:text-white">Exportar Dados</p>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Backup Excel</p>
                                    </div>
                                </button>
                                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-5 p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl group hover:border-emerald-500 transition-all bg-slate-50/50 dark:bg-slate-950/20">
                                    <Upload size={32} className="text-slate-300 group-hover:text-emerald-500 transition-all transform group-hover:-translate-y-1" />
                                    <div className="text-center">
                                        <p className="font-black text-xs uppercase tracking-[0.2em] text-slate-900 dark:text-white">Importar Dados</p>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Restaurar Excel</p>
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleRestore} className="hidden" />
                                </button>
                            </div>
                        </section>
                    </div>
                )}

                {/* EQUIPE (ADMIN) */}
                {activeTab === "usuarios" && userRole === "ADMIN" && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                        <section className="premium-card p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500"><Shield size={28} /></div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white">Controle de Equipe</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gerencie usuários</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {users.map(u => (
                                    <div key={u.id} className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm",
                                                u.role === "ADMIN" ? "bg-amber-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                                            )}>
                                                {(u.name || u.email || "??").substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-sm text-slate-900 dark:text-white">{u.name || "Sem Nome"}</span>
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded-md text-[7px] font-black uppercase",
                                                        u.role === "ADMIN" ? "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500" : "bg-slate-100 text-slate-400"
                                                    )}>
                                                        {u.role || "USER"}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{u.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </div>

            {/* Botão Salvar Fixo */}
            <div className="fixed bottom-8 right-8 z-50">
                <button
                    onClick={handleSave}
                    className={cn(
                        "flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl transition-all",
                        isSaved
                            ? "bg-emerald-500 text-white"
                            : "bg-primary text-white hover:scale-105"
                    )}
                >
                    {isSaved ? (
                        <>
                            <CheckCircle2 size={20} /> Salvo!
                        </>
                    ) : (
                        <>
                            <Save size={20} /> Salvar Alterações
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
