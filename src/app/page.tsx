"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SummaryCards from "@/components/dashboard/SummaryCards";
import TransactionForm from "@/components/transactions/TransactionForm";
import CategoryChart from "@/components/dashboard/CategoryChart";
import { Plus, Calendar, Zap, TrendingUp, TrendingDown, Clock, ShoppingCart, Coffee, Home, Car, Heart, Briefcase, HelpCircle, ArrowRight, Trash2, Download, Table, PlusCircle, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
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

export default function Dashboard() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [userName, setUserName] = useState("Usuário");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUserName(session.user.user_metadata?.name || "Gestor");
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

  const handleTransactionSubmit = async (data: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const transactionData = {
      ...data,
      user_id: session.user.id,
      date: new Date(data.date).toISOString().split('T')[0]
    };

    let result;
    if (data.id) {
      result = await supabase
        .from('transactions')
        .update(transactionData)
        .eq('id', data.id)
        .select();
    } else {
      const { id, ...newData } = transactionData;
      result = await supabase
        .from('transactions')
        .insert([newData])
        .select();
    }

    if (result.error) {
      console.error("Erro ao salvar transação:", result.error);
      return;
    }

    fetchTransactions(session.user.id);
  };

  const handleDeleteTransaction = async (id: string) => {
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

  const exportToXLSX = () => {
    const worksheetData = transactions.map(t => ({
      "DATA": format(new Date(t.date), "dd/MM/yyyy"),
      "CATEGORIA": t.category.toUpperCase(),
      "DESCRIÇÃO": t.description || "N/A",
      "TIPO": t.type === "INCOME" ? "ENTRADA" : "SAÍDA",
      "VALOR (R$)": t.amount,
      "STATUS": t.paid ? "LIQUIDADO" : "PENDENTE"
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "XFinance Relatório");
    XLSX.writeFile(workbook, `XFinance_Extrato_${month}_${year}.xlsx`);
  };

  const openEdit = (t: any) => {
    setEditingTransaction(t);
    setIsFormOpen(true);
  };

  const currentMonthTransactions = transactions
    .filter(t => {
      const d = new Date(t.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const income = currentMonthTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = currentMonthTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expense;

  const categoryData = currentMonthTransactions
    .filter(t => t.type === "EXPENSE")
    .reduce((acc: any, t) => {
      const existing = acc.find((item: any) => item.name === t.category);
      if (existing) existing.value += t.amount;
      else acc.push({ name: t.category, value: t.amount });
      return acc;
    }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-8 px-4 md:px-6 animate-in fade-in duration-1000 pb-32 md:pb-8">
      {/* Upper Header */}
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles size={16} className="animate-pulse" />
            <p className="font-black text-[9px] tracking-[0.3em] uppercase">Private Assets</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white">
            Olá, <span className="text-primary">{userName}</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex-1 md:flex-none flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-2xl shadow-sm">
            <Calendar size={18} className="text-slate-400" />
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="bg-transparent border-none focus:ring-0 font-black text-sm text-slate-900 dark:text-white outline-none cursor-pointer appearance-none pr-4"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i + 1} value={i + 1} className="dark:bg-slate-900">
                  {format(new Date(2024, i, 1), "MMMM", { locale: ptBR })}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={exportToXLSX}
            className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-emerald-500 transition-all shadow-sm active:scale-90"
          >
            <Table size={20} />
          </button>
        </div>
      </header>

      {/* Button 'Novo Item' - Integrated for Desktop | Fixed for Mobile in a clean spot */}
      <div className="flex justify-start md:block">
        <button
          onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }}
          className={cn(
            "flex items-center gap-3 px-6 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all z-[60]",
            "md:static", // Desktop behavior
            "fixed bottom-28 right-6 md:bottom-auto md:right-auto" // Mobile floating behavior, moved higher to clear navbar
          )}
        >
          <PlusCircle size={22} strokeWidth={3} />
          <span className="text-[11px] tracking-widest uppercase">Lançar Registro</span>
        </button>
      </div>

      {/* Stats Section */}
      <SummaryCards income={income} expense={expense} balance={balance} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
        {/* Main List */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Fluxo de Caixa</h2>
            <Link href="/transactions" className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-primary transition-all">
              <ArrowRight size={20} />
            </Link>
          </div>

          <div className="space-y-3">
            {currentMonthTransactions.length === 0 ? (
              <div className="premium-card p-16 rounded-[2rem] text-center border-dashed border-2 border-slate-100 dark:border-slate-800">
                <p className="text-slate-300 font-black text-xs uppercase tracking-widest">Sem registros este mês</p>
              </div>
            ) : (
              currentMonthTransactions.map((transaction) => {
                const Icon = CATEGORY_ICONS[transaction.category] || HelpCircle;
                return (
                  <div
                    key={transaction.id}
                    onClick={() => openEdit(transaction)}
                    className="premium-card p-5 rounded-2xl flex items-center justify-between group cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 shadow-sm",
                        transaction.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'
                      )}>
                        <Icon size={22} />
                      </div>
                      <div>
                        <h4 className="font-black text-base text-slate-900 dark:text-white leading-tight">{transaction.category}</h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-widest truncate max-w-[120px]">{transaction.description || 'Geral'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "font-black text-lg tracking-tighter",
                        transaction.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'
                      )}>
                        {transaction.type === 'INCOME' ? '+' : '-'} {transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <span className={cn(
                          "text-[8px] px-2 py-0.5 rounded-md font-black uppercase tracking-[0.1em]",
                          transaction.paid ? "bg-emerald-500 text-white" : "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500"
                        )}>
                          {transaction.paid ? 'Confirmado' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Analytics Card */}
        <div className="lg:col-span-4 space-y-8">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Análise</h2>
          <div className="premium-card p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-8 shadow-2xl">
            <div className="relative">
              <CategoryChart data={categoryData} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/50">Total Gasto</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              </div>
            </div>

            <div className="space-y-5">
              {categoryData.slice(0, 4).map((cat: any) => (
                <div key={cat.name} className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                    <span className="text-slate-500 dark:text-white/60">{cat.name}</span>
                    <span className="text-slate-900 dark:text-white">{((cat.value / expense) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-white/10 h-1 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-1000"
                      style={{ width: `${(cat.value / expense) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-white/10">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/5 dark:bg-primary/20 flex items-center justify-center shrink-0">
                  <Zap size={18} className="text-primary" />
                </div>
                <p className="text-[10px] font-bold leading-relaxed text-slate-400 dark:text-white/80 uppercase tracking-widest">
                  Mantenha os custos fixos sob controle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingTransaction(null); }}
        onSubmit={handleTransactionSubmit}
        onDelete={handleDeleteTransaction}
        initialData={editingTransaction}
      />
    </div>
  );
}
