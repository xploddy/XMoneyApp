"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SummaryCards from "@/components/dashboard/SummaryCards";
import TransactionForm from "@/components/transactions/TransactionForm";
import CategoryChart, { CHART_COLORS } from "@/components/dashboard/CategoryChart";
import { Plus, Calendar, Zap, ChevronRight, LayoutDashboard, Coffee, Home, Car, Heart, Briefcase, HelpCircle, ShoppingCart, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
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
  const [userRole, setUserRole] = useState("USER");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', session.user.id)
        .single();

      setUserName(profile?.name || session.user.user_metadata?.name || "gestor");
      setUserRole(profile?.role || "USER");
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
    // Keep date as a string YYYY-MM-DD to avoid JS Date timezone shifts
    setTransactions(data);
  };

  const handleTransactionSubmit = async (data: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { id, ...cleanData } = data;
    const transactionData = {
      ...cleanData,
      user_id: session.user.id
    };

    const { error } = id
      ? await supabase.from('transactions').update(transactionData).eq('id', id)
      : await supabase.from('transactions').insert([transactionData]);

    if (error) {
      console.error("Save Error:", error);
      alert("Erro ao salvar: " + error.message);
      return;
    }

    fetchTransactions(session.user.id);
    setIsFormOpen(false);
  };

  const handleDeleteTransaction = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from('transactions').delete().eq('id', id);
    fetchTransactions(session.user.id);
    setIsFormOpen(false);
  };


  // Dashboard optimized for Analysis & Action
  const currentMonthTransactions = transactions.filter(t => {
    const tDate = new Date(t.date + 'T12:00:00');
    return tDate.getMonth() + 1 === month && tDate.getFullYear() === year;
  });

  const income = currentMonthTransactions.filter(t => t.type === "INCOME").reduce((acc, t) => acc + t.amount, 0);
  const expense = currentMonthTransactions.filter(t => t.type === "EXPENSE").reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expense;

  const categoryData = currentMonthTransactions
    .filter(t => t.type === "EXPENSE")
    .reduce((acc: any, t) => {
      const existing = acc.find((item: any) => item.name === t.category);
      if (existing) existing.value += t.amount;
      else acc.push({ name: t.category, value: t.amount });
      return acc;
    }, []);

  const MONTHS = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: format(new Date(2024, i, 1), "MMMM", { locale: ptBR })
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-10 px-4 md:px-12 animate-in fade-in duration-700">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-4 md:pt-0">
        <div className="space-y-1">
          <p className="text-primary font-black text-[10px] tracking-[0.3em] uppercase flex items-center gap-2">
            <ChevronRight size={12} strokeWidth={3} /> Dashboard Operacional
          </p>
          <h1 className="text-5xl font-black text-white tracking-tighter">
            Olá, <span className="text-primary">{userName.toLowerCase()}</span>
          </h1>
        </div>

        <div className="flex flex-col items-end gap-2 text-right">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Seletor de Ciclo</span>
          <div className="flex items-center gap-2 bg-[#161B26] p-1.5 rounded-2xl border border-white/5 shadow-lg">
            <button onClick={() => setYear(y => y - 1)} className="p-2 text-slate-500 hover:text-white transition-colors"><Zap size={14} /></button>
            <span className="text-xs font-black text-white px-2">{year}</span>
            <button onClick={() => setYear(y => y + 1)} className="p-2 text-slate-500 hover:text-white transition-colors"><Zap size={14} className="rotate-180" /></button>
          </div>
        </div>
      </div>

      {/* Premium Month Selector Panel */}
      <div className="bg-[#161B26]/50 p-2 rounded-[2.5rem] border border-white/5 overflow-hidden">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-2 py-1">
          {MONTHS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMonth(m.id)}
              className={cn(
                "whitespace-nowrap px-8 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                month === m.id
                  ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              )}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Action Button - Desktop side or Top Mobile */}
      <div className="flex md:justify-start">
        <button
          onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }}
          className="w-full md:w-auto px-10 bg-primary py-5 rounded-2xl flex items-center justify-center gap-4 shadow-2xl shadow-primary/30 hover:scale-[1.03] transition-all group"
        >
          <Plus size={22} strokeWidth={4} className="text-white bg-white/20 rounded-lg" />
          <span className="text-[13px] font-black uppercase tracking-widest text-white">Lançar Registro</span>
        </button>
      </div>

      {/* Summary Section - RESTORED BALANCE CARD & GRID */}
      <SummaryCards income={income} expense={expense} balance={balance} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Layout optimized for Desktop Content Management */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white tracking-tight">Fluxo de Caixa</h2>
            <Link href="/transactions" className="w-10 h-10 bg-[#161B26] rounded-xl flex items-center justify-center text-slate-500 hover:text-white border border-white/5 transition-all">
              <ArrowRight size={20} strokeWidth={3} />
            </Link>
          </div>

          <div className="space-y-4">
            {currentMonthTransactions.length === 0 ? (
              <div className="premium-card p-16 text-center border-dashed border-white/10 opacity-30">
                <p className="text-xs font-black uppercase tracking-[0.2em]">Aguardando novas movimentações</p>
              </div>
            ) : (
              currentMonthTransactions.slice(0, 6).map((t) => {
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
        </div>

        {/* Analytics Section - Desktop Right | Mobile Below */}
        <div className="lg:col-span-4 space-y-8">
          <h2 className="text-2xl font-black text-white tracking-tight">Análise</h2>
          <div className="premium-card p-10 bg-[#161B26] border-white/5 space-y-10 shadow-2xl">
            <div className="flex justify-center">
              <CategoryChart data={categoryData} />
            </div>

            <div className="text-center space-y-2 py-4 border-y border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Total Desembolsado</p>
              <p className="text-3xl font-black text-white tracking-widest">
                {expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>

            <div className="space-y-6">
              {categoryData.slice(0, 4).map((cat: any, idx: number) => (
                <div key={cat.name} className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.15em]">
                    <span className="text-slate-400">{cat.name}</span>
                    <span className="text-white">{((cat.value / expense) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,102,255,0.1)]"
                      style={{
                        width: `${(cat.value / expense) * 100}%`,
                        backgroundColor: CHART_COLORS[idx % CHART_COLORS.length]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-slate-950/40 rounded-3xl border border-white/5 flex gap-4 items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                <Zap size={24} />
              </div>
              <p className="text-[10px] font-black text-slate-400 leading-relaxed uppercase tracking-[0.1em]">
                Mantenha os custos operacionais sob monitoramento constante.
              </p>
            </div>
          </div>
        </div>
      </div>

      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleTransactionSubmit}
        onDelete={handleDeleteTransaction}
        initialData={editingTransaction}
      />
    </div>
  );
}
