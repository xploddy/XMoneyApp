"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { List, Search, ArrowUpCircle, ArrowDownCircle, Trash2, Filter, Download, Table, Edit3, ArrowLeft, Clock } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import TransactionForm from "@/components/transactions/TransactionForm";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
            .order('date', { ascending: false });

        if (error) {
            console.error("Erro ao buscar transações:", error);
            return;
        }
        setTransactions(data.map(t => ({ ...t, date: new Date(t.date) })));
    };

    const handleDelete = async (id: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Erro ao deletar transação:", error);
            return;
        }

        fetchTransactions(session.user.id);
    };

    const handleUpdate = async (data: any) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const transactionData = {
            ...data,
            user_id: session.user.id,
            date: new Date(data.date).toISOString().split('T')[0]
        };

        const { error } = await supabase
            .from('transactions')
            .update(transactionData)
            .eq('id', data.id);

        if (error) {
            console.error("Erro ao atualizar transação:", error);
            return;
        }

        fetchTransactions(session.user.id);
    };

    const filteredTransactions = transactions
        .filter((t) => {
            const matchesSearch = t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesType = filterType === "ALL" || t.type === filterType;
            return matchesSearch && matchesType;
        })
        .sort((a, b) => b.date.getTime() - a.date.getTime());

    const exportToXLSX = () => {
        const worksheetData = filteredTransactions.map(t => ({
            "DATA": formatDate(t.date),
            "CATEGORIA": t.category.toUpperCase(),
            "DESCRIÇÃO": t.description || "—",
            "TIPO": t.type === "INCOME" ? "ENTRADA" : "SAÍDA",
            "VALOR": t.amount,
            "STATUS": t.paid ? "LIQUIDADO" : "PENDENTE"
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Planilha Geral");
        XLSX.writeFile(workbook, "Relatorio_XFinance_Full.xlsx");
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 py-10 px-4 md:px-6 animate-in fade-in duration-700 pb-32">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <Link href="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-primary transition-all font-black text-[9px] uppercase tracking-widest leading-none">
                        <ArrowLeft size={12} /> Painel
                    </Link>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-tight">Fluxo de Caixa</h1>
                </div>

                <button
                    onClick={exportToXLSX}
                    className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-600 text-white rounded-xl font-black transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Table size={16} />
                    <span className="text-[10px] tracking-widest uppercase">Exportar para Excel</span>
                </button>
            </header>

            {/* Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                <div className="lg:col-span-8 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-all" size={18} />
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-3.5 pl-12 pr-5 rounded-xl outline-none focus:border-primary transition-all font-bold text-sm"
                    />
                </div>

                <div className="lg:col-span-4 flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 h-[52px] items-center">
                    {[
                        { id: "ALL", label: "Geral" },
                        { id: "INCOME", label: "Entrada" },
                        { id: "EXPENSE", label: "Saída" }
                    ].map((type) => (
                        <button
                            key={type.id}
                            onClick={() => setFilterType(type.id)}
                            className={cn(
                                "flex-1 h-full rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                filterType === type.id
                                    ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                {filteredTransactions.length === 0 ? (
                    <div className="premium-card p-16 rounded-[2rem] text-center border-dashed border-2 border-slate-100 dark:border-slate-800">
                        <p className="text-slate-300 font-black text-[10px] uppercase tracking-widest">Sem registros</p>
                    </div>
                ) : (
                    filteredTransactions.map((t) => (
                        <div
                            key={t.id}
                            onClick={() => { setEditingTransaction(t); setIsFormOpen(true); }}
                            className="premium-card p-5 rounded-2xl flex items-center justify-between group cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-11 h-11 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 shadow-sm",
                                    t.type === "INCOME" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10"
                                )}>
                                    {t.type === "INCOME" ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-sm text-slate-800 dark:text-slate-100">{t.category}</span>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest",
                                            t.paid ? "bg-emerald-500 text-white" : "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500"
                                        )}>
                                            {t.paid ? "LIQ" : "PEND"}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[150px]">{t.description || 'Geral'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={cn(
                                    "font-black text-lg tracking-tighter",
                                    t.type === "INCOME" ? "text-emerald-500" : "text-slate-900 dark:text-white"
                                )}>
                                    {t.type === "INCOME" ? "+" : "-"} {formatCurrency(t.amount)}
                                </p>
                                <p className="text-[9px] text-slate-300 font-black">{formatDate(t.date)}</p>
                            </div>
                        </div>
                    ))
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
