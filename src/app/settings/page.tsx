"use client";

import { useState, useEffect, useRef } from "react";
import { User, Database, Shield, Moon, Sun, Trash2, Download, Upload, CheckCircle2, Save, Users, Crown, Settings, LogOut, MoreHorizontal, UserCheck, UserPlus, ShieldAlert } from "lucide-react";
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
    const [name, setName] = useState("Usuário");
    const [budgetGoal, setBudgetGoal] = useState("");
    const [isSaved, setIsSaved] = useState(false);
    const [activeTab, setActiveTab] = useState("perfil");
    const [users, setUsers] = useState<XUser[]>([]);
    const [userRole, setUserRole] = useState("USER");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
                return;
            }

            // Sync Name and Role from Profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profile) {
                setName(profile.name || "");
                setUserRole(profile.role || "USER");
            }

            // Theme initialization (Local)
            const savedTheme = localStorage.getItem("xmoney_theme") || "system";
            setTheme(savedTheme);
            applyTheme(savedTheme);

            const savedBudget = localStorage.getItem("xmoney_budget_goal") || "";
            setBudgetGoal(savedBudget);

            // Fetch Team Profiles (only for admins)
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
        applyTheme(theme);

        if (!error) {
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        }
    };

    const toggleUserRole = async (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";

        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (!error) fetchTeam();
    };

    const deleteUser = async (userId: string) => {
        if (confirm("Deseja realmente remover este usuário do sistema? (Esta ação no Supabase requer permissão de admin)")) {
            // Note: Normal users cannot delete others without service role or special policies.
            // For now, we perform the UI removal and try the DB call.
            const { error } = await supabase.from('profiles').delete().eq('id', userId);
            if (!error) fetchTeam();
        }
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

        // Elegant grouping for Backup too
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
                "RAW_DATA": JSON.stringify(t) // Hidden column for restoration
            });
        });

        Object.keys(groups).sort().reverse().forEach(label => {
            const worksheet = XLSX.utils.json_to_sheet(groups[label]);
            worksheet['!cols'] = [{ wch: 6 }, { wch: 15 }, { wch: 20 }, { wch: 35 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 0 }]; // Last col hidden
            XLSX.utils.book_append_sheet(workbook, worksheet, label.slice(0, 31));
        });

        XLSX.writeFile(workbook, `XFINANCE_BACKUP_${session.user.id.slice(0, 5)}_${format(new Date(), "dd-MM-yyyy")}.xlsx`);
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
                let processedCount = 0;

                const transactionsToUpsert: any[] = [];

                for (const sheetName of workbook.SheetNames) {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

                    jsonData.forEach(row => {
                        // 1. Recover ID from RAW_DATA if exists
                        let id = undefined;
                        if (row["RAW_DATA"]) {
                            try {
                                const raw = JSON.parse(row["RAW_DATA"]);
                                id = raw.id;
                            } catch { }
                        }

                        // 2. Parse Visible Columns (Allowing user edits in Excel)
                        // Date parsing: Expecting DD/MM/YYYY from Excel or fallback
                        let dateISO = new Date().toISOString().split('T')[0];
                        if (row["DATA COMPLETA"]) {
                            const parts = row["DATA COMPLETA"].toString().split('/');
                            if (parts.length === 3) dateISO = `${parts[2]}-${parts[1]}-${parts[0]}`;
                        } else if (row["DATA"]) {
                            dateISO = row["DATA"];
                        }

                        const amount = parseFloat(row["VALOR"]) || 0;
                        const description = row["DESCRIÇÃO"] || "";
                        const category = row["CATEGORIA"] || "Outros";
                        const type = (row["TIPO"] === "ENTRADA") ? "INCOME" : "EXPENSE";
                        const paid = (row["STATUS"] === "LIQUIDADO");

                        // 3. Build Transaction Object
                        const transaction = {
                            ...(id ? { id } : {}), // Only include ID if found
                            user_id: session.user.id,
                            date: dateISO,
                            amount,
                            description,
                            category,
                            type,
                            paid
                        };

                        transactionsToUpsert.push(transaction);
                    });
                }

                if (transactionsToUpsert.length > 0) {
                    // Upsert: Updates if ID exists, Inserts if not
                    const { error } = await supabase.from('transactions').upsert(transactionsToUpsert);

                    if (error) {
                        console.error("Upsert error:", error);
                        alert("Erro na sincronização: " + error.message);
                        return;
                    }
                    processedCount = transactionsToUpsert.length;
                }

                alert(`Sincronização Inteligente Concluída!\n\n✅ ${processedCount} registros processados.\n(Dados atualizados da planilha foram salvos no sistema)`);
                window.location.reload();

            } catch (error) {
                console.error(error);
                alert("Erro ao processar arquivo. Verifique o formato.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const tabs = [
        { id: "perfil", label: "Perfil", icon: User },
        { id: "usuarios", label: "Equipe", icon: Users },
        { id: "dados", label: "Dados", icon: Database },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-10 py-10 px-4 md:px-6 animate-in fade-in duration-700 pb-32">
            <header className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">Ajustes</h1>
                    <p className="text-slate-500 font-bold text-[10px] tracking-widest uppercase">Gerenciamento de Ativos e Acessos</p>
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
                            "flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex-1 min-w-[140px]",
                            activeTab === tab.id
                                ? "bg-white dark:bg-slate-800 text-primary shadow-xl shadow-primary/5 border border-slate-100 dark:border-slate-700"
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        )}
                    >
                        <tab.icon size={16} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="mt-4">
                {activeTab === "perfil" && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
                        <section className="premium-card p-8 md:p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-10">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-primary/5 dark:bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><User size={28} /></div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">Identidade de Gestor</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sincronização entre dispositivos</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Nome de Exibição</label>
                                    <input
                                        type="text" value={name} onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 py-4 px-6 rounded-2xl outline-none focus:border-primary font-black text-sm text-slate-900 dark:text-white transition-all shadow-inner"
                                        placeholder="Seu nome completo"
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Meta de Gastos Mensal</label>
                                    <div className="relative group">
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

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Estética do Terminal</label>
                                    <div className="grid grid-cols-3 gap-2.5">
                                        {[
                                            { id: "light", icon: Sun, label: "MODO DIA" },
                                            { id: "dark", icon: Moon, label: "MODO NOITE" },
                                            { id: "system", icon: Settings, label: "AUTO" }
                                        ].map((t) => (
                                            <button
                                                key={t.id} onClick={() => setTheme(t.id)}
                                                className={cn(
                                                    "flex flex-col items-center justify-center gap-2 py-5 rounded-2xl font-black text-[8px] uppercase border-2 transition-all",
                                                    theme === t.id
                                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                                        : "bg-white dark:bg-slate-950 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-slate-200"
                                                )}
                                            >
                                                <t.icon size={18} /> {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                {isSaved ? (
                                    <div className="flex items-center gap-2.5 text-emerald-500 font-black text-xs animate-in fade-in duration-300">
                                        <CheckCircle2 size={18} /> Perfil Atualizado com Sucesso
                                    </div>
                                ) : <div />}
                                <button onClick={handleSave} className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-98 transition-all">
                                    Confirmar Mudanças
                                </button>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === "usuarios" && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                        <section className="premium-card p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-amber-500/5 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500"><Shield size={28} /></div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">Controle de Equipe</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gerencie acessos e permissões</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        const url = window.location.origin + "/login";
                                        navigator.clipboard.writeText(url);
                                        alert("Link de registro copiado: " + url + "\n\nEnvie este link para o novo membro se cadastrar. Após o cadastro, você poderá promovê-lo a ADMIN aqui.");
                                    }}
                                    className="hidden md:flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-white/5"
                                >
                                    <UserPlus size={14} strokeWidth={3} /> Convite Rápido
                                </button>
                            </div>

                            <div className="space-y-3">
                                {users.map(u => (
                                    <div key={u.id} className="group p-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-all hover:border-primary/30">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm transition-all group-hover:rotate-3",
                                                u.role === "ADMIN" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                                            )}>
                                                {(u.name || u.email || "??").substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-sm text-slate-900 dark:text-white leading-none">{u.name || "Sem Nome"}</span>
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest",
                                                        u.role?.toUpperCase() === "ADMIN" ? "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                                                    )}>
                                                        {u.role || "USER"}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 opacity-70">{u.email || "Sem e-mail"}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Role Toggle */}
                                            <button
                                                onClick={() => toggleUserRole(u.id)}
                                                title={u.role === "ADMIN" ? "Rebaixar para Usuário" : "Promover a Admin"}
                                                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-primary transition-all shadow-sm"
                                            >
                                                <ShieldAlert size={18} />
                                            </button>
                                            <button
                                                onClick={() => deleteUser(u.id)}
                                                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-rose-500 transition-all shadow-sm"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === "dados" && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
                        <section className="premium-card p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <button onClick={handleBackup} className="flex flex-col items-center justify-center gap-5 p-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl group hover:border-primary transition-all bg-slate-50/50 dark:bg-slate-950/20">
                                    <Download size={36} className="text-slate-300 group-hover:text-primary transition-all transform group-hover:-translate-y-1" />
                                    <div className="text-center">
                                        <p className="font-black text-xs uppercase tracking-[0.2em] text-slate-900 dark:text-white">Exportar Planilha</p>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Backup Completo (.XLSX)</p>
                                    </div>
                                </button>
                                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-5 p-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl group hover:border-emerald-500 transition-all bg-slate-50/50 dark:bg-slate-950/20">
                                    <Upload size={36} className="text-slate-300 group-hover:text-emerald-500 transition-all transform group-hover:-translate-y-1" />
                                    <div className="text-center">
                                        <p className="font-black text-xs uppercase tracking-[0.2em] text-slate-900 dark:text-white">Importar Lançamentos</p>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Restaurar via Excel</p>
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleRestore} className="hidden" />
                                </button>
                            </div>

                            <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                                <div className="p-6 bg-rose-50/50 dark:bg-rose-500/5 rounded-3xl border border-rose-100/50 dark:border-rose-900/20 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="text-center md:text-left">
                                        <h4 className="text-sm font-black text-rose-600 dark:text-rose-500 uppercase tracking-tighter">Zona de Exclusão Irreversível</h4>
                                        <p className="text-[9px] text-rose-400 font-bold uppercase tracking-widest mt-1">Apagar todos os registros de transações e sessões</p>
                                    </div>
                                    <button onClick={() => { if (confirm("ALERTA: Isso apagará TODOS os dados localmente. Confirmar?")) { localStorage.clear(); window.location.reload(); } }}
                                        className="bg-rose-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-600/20 hover:scale-[1.05] active:scale-95 transition-all">
                                        Wipe Storage
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}
