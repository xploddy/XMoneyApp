"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { List, Search, ArrowUpCircle, ArrowDownCircle, Trash2, Filter, Download, Table, Edit3, ArrowLeft, Clock, HelpCircle, Coffee, Zap, Home, Car, Heart, Briefcase, ShoppingCart } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import TransactionForm from "@/components/transactions/TransactionForm";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const CATEGORY_ICONS: Record<string, any> = {
    "Alimentação": Coffee,
    "Lazer": Zap,
    "Aluguel": Home,
    "Transporte": Car,
    "Saúde": Heart,
    "Salário": Briefcase,
    "Outros": HelpCircle,
    "Assinaturas": ShoppingCart,
};

export default function TransactionsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [transactions, setTransactions] = useState<any[]>([]);
    const [filterType, setFilterType] = useState<string>("ALL");
    const [editingTransaction, setEditingTransaction] = useState<any>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
                return;
            }
            fetchTransactions(session.user.id);
        };

        checkAuth();
    }, []);

    const fetchTransactions = async (userId: string) => {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) return;
        setTransactions(data);
    };

    const handleDelete = async (id: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        await supabase.from('transactions').delete().eq('id', id);
        fetchTransactions(session.user.id);
        setIsFormOpen(false);
    };

    const handleUpdate = async (data: any) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { id, ...cleanData } = data;
        const transactionData = {
            ...cleanData,
            user_id: session.user.id
        };

        const { error } = await supabase.from('transactions').update(transactionData).eq('id', id);
        if (error) {
            alert("Erro ao atualizar: " + error.message);
            return;
        }
        fetchTransactions(session.user.id);
        setIsFormOpen(false);
    };

    const filteredTransactions = transactions
        .filter((t) => {
            const matchesSearch = t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesType = filterType === "ALL" || t.type === filterType;
            return matchesSearch && matchesType;
        });

    const exportToXLSX = () => {
        if (transactions.length === 0) {
            alert("Sem dados para exportar.");
            return;
        }

        const workbook = XLSX.utils.book_new();

        // Group transactions by Month/Year for Full History
        const groups: Record<string, any[]> = {};

        transactions.forEach(t => {
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
                "STATUS": t.paid ? "LIQUIDADO" : "PENDENTE"
            });
        });

        // Create a sheet for each month
        Object.keys(groups).sort().reverse().forEach(label => {
            const data = groups[label].sort((a, b) => parseInt(b.DIA) - parseInt(a.DIA));
            const worksheet = XLSX.utils.json_to_sheet(data);

            const wscols = [
                { wch: 8 },  // DIA
                { wch: 18 }, // DATA COMPLETA
                { wch: 22 }, // CATEGORIA
                { wch: 40 }, // DESCRIÇÃO
                { wch: 12 }, // TIPO
                { wch: 18 }, // VALOR
                { wch: 18 }  // STATUS
            ];
            worksheet['!cols'] = wscols;

            XLSX.utils.book_append_sheet(workbook, worksheet, label.slice(0, 31));
        });

        XLSX.writeFile(workbook, `XFINANCE_HISTORICO_TOTAL.xlsx`);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 py-10 px-4 md:px-12 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <Link href="/" className="inline-flex items-center gap-1.5 text-primary hover:text-white transition-all font-black text-[9px] uppercase tracking-[0.3em] leading-none mb-2">
                        <ArrowLeft size={12} strokeWidth={3} /> Voltar ao Painel
                    </Link>
                    <h1 className="text-4xl font-black tracking-tighter text-white leading-tight">Histórico de Ativos</h1>
                </div>

                <button
                    onClick={exportToXLSX}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-[#161B26] text-white border border-white/5 rounded-2xl font-black transition-all shadow-xl hover:border-emerald-500/50 group"
                >
                    <Table size={18} className="text-slate-500 group-hover:text-emerald-400" />
                    <span className="text-[11px] tracking-widest uppercase">Exportar para Excel</span>
                </button>
            </header>

            {/* Premium Search & Filter */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-all" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar transação ou categoria..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#161B26] border border-white/5 py-4 pl-14 pr-6 rounded-2xl outline-none focus:border-primary/50 transition-all font-bold text-sm text-white placeholder:text-slate-600 shadow-inner"
                    />
                </div>

                <div className="lg:col-span-4 flex gap-1.5 p-1.5 bg-[#161B26] rounded-2xl border border-white/5 items-center">
                    {[
                        { id: "ALL", label: "Geral" },
                        { id: "INCOME", label: "Entradas" },
                        { id: "EXPENSE", label: "Saídas" }
                    ].map((type) => (
                        <button
                            key={type.id}
                            onClick={() => setFilterType(type.id)}
                            className={cn(
                                "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                filterType === type.id
                                    ? "bg-primary text-white shadow-lg"
                                    : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {filteredTransactions.length === 0 ? (
                    <div className="premium-card p-20 text-center border-dashed border-white/10 opacity-30">
                        <p className="text-xs font-black uppercase tracking-[0.2em]">Sem resultados para esta busca</p>
                    </div>
                ) : (
                    filteredTransactions.map((t) => {
                        const Icon = CATEGORY_ICONS[t.category] || HelpCircle;
                        return (
                            <div
                                key={t.id}
                                onClick={() => { setEditingTransaction(t); setIsFormOpen(true); }}
                                className="premium-card p-4 md:p-6 flex items-center justify-between bg-[#161B26] hover:bg-slate-900 group transition-all cursor-pointer border-white/5"
                            >
                                <div className="flex items-center gap-4 md:gap-5">
                                    <div className="w-11 h-11 md:w-14 md:h-14 bg-slate-950 rounded-xl md:rounded-[1.25rem] flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-inner shrink-0">
                                        <Icon size={22} className="md:size-[26px]" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-black text-white text-[15px] md:text-lg tracking-tight leading-none truncate">{t.category}</h4>
                                        <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em] truncate max-w-[70px] xs:max-w-[100px] md:max-w-xs">{t.description || "Geral"}</p>
                                    </div>
                                </div>
                                <div className="text-right space-y-1 md:space-y-1.5 shrink-0 ml-2">
                                    <p className="text-[9px] md:text-[10px] text-slate-500 font-black tracking-widest">
                                        {t.date.split('-').reverse().slice(0, 2).join('/')}
                                    </p>
                                    <p className={cn(
                                        "text-base md:text-xl font-black tracking-tighter leading-none",
                                        t.type === "INCOME" ? "text-success" : "text-white"
                                    )}>
                                        {t.type === "INCOME" ? "+" : "-"} {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                    <div className="flex justify-end">
                                        <span className={cn(
                                            "text-[7px] md:text-[9px] font-black px-2 md:px-3 py-0.5 md:py-1 rounded-full uppercase tracking-widest transition-all",
                                            t.paid ? "bg-success/10 text-success" : "bg-amber-500/10 text-amber-500"
                                        )}>
                                            {t.paid ? "LIQUIDADO" : "PENDENTE"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <TransactionForm
                isOpen={isFormOpen}
                onClose={() => { setIsFormOpen(false); setEditingTransaction(null); }}
                onSubmit={handleUpdate}
                onDelete={handleDelete}
                initialData={editingTransaction}
            />
        </div>
    );
}
