"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Tag, AlignLeft, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    onDelete?: (id: string) => void;
    initialData?: any;
}

export default function TransactionForm({ isOpen, onClose, onSubmit, onDelete, initialData }: TransactionFormProps) {
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [category, setCategory] = useState("Alimentação");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("EXPENSE");
    const [paid, setPaid] = useState(true);

    useEffect(() => {
        if (initialData) {
            setAmount(initialData.amount.toString());
            setDate(new Date(initialData.date).toISOString().split("T")[0]);
            setCategory(initialData.category);
            setDescription(initialData.description || "");
            setType(initialData.type);
            setPaid(initialData.paid);
        } else {
            resetForm();
        }
    }, [initialData, isOpen]);

    const resetForm = () => {
        setAmount("");
        setDate(new Date().toISOString().split("T")[0]);
        setCategory("Alimentação");
        setDescription("");
        setType("EXPENSE");
        setPaid(true);
    };

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount) return;
        onSubmit({
            id: initialData?.id,
            amount: parseFloat(amount),
            date,
            category,
            description,
            type,
            paid,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[2.5rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl animate-in slide-in-from-bottom-20 duration-500 border-x border-t md:border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto overflow-x-hidden scrollbar-hide">

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {initialData ? "Revisar Item" : "Novo Registro"}
                        </h2>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lançamento de Protocolo</p>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Valor do Montante</label>
                        <div className="relative group">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-xl text-slate-300 group-focus-within:text-primary transition-colors">R$</span>
                            <input
                                type="number"
                                step="0.01"
                                required
                                autoFocus
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-slate-50/50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 focus:border-primary rounded-2xl py-4.5 pl-14 pr-6 text-2xl font-black outline-none transition-all placeholder:text-slate-200 shadow-inner"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="flex p-1.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                        {["INCOME", "EXPENSE"].map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={cn(
                                    "flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                                    type === t
                                        ? cn("bg-white dark:bg-slate-800 shadow-md", t === "INCOME" ? "text-emerald-600" : "text-rose-600")
                                        : "text-slate-300 hover:text-slate-500 dark:text-slate-500"
                                )}
                            >
                                {t === "INCOME" ? "Entrada" : "Saída"}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Data</label>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-slate-50/50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 py-3.5 px-5 rounded-2xl font-black text-xs outline-none focus:border-primary transition-all shadow-inner"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Categoria</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-slate-50/50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 py-3.5 px-5 rounded-2xl font-black text-xs outline-none focus:border-primary transition-all appearance-none shadow-inner"
                            >
                                <option>Alimentação</option>
                                <option>Lazer</option>
                                <option>Aluguel</option>
                                <option>Transporte</option>
                                <option>Saúde</option>
                                <option>Salário</option>
                                <option>Assinaturas</option>
                                <option>Outros</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Notas Gerais</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-slate-50/50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 py-3.5 px-5 rounded-2xl font-black text-xs outline-none focus:border-primary transition-all shadow-inner"
                            placeholder="Ex: Compra de ativos ou consumos"
                        />
                    </div>

                    <label className="flex items-center gap-3 p-4 bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-inner">
                        <div className={cn(
                            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                            paid ? "bg-primary border-primary text-white" : "bg-transparent border-slate-200 dark:border-slate-700 text-transparent"
                        )}>
                            <Check size={16} strokeWidth={4} />
                        </div>
                        <input type="checkbox" className="hidden" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
                        <span className="font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">Registrada como Liquidada</span>
                    </label>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-[3] bg-primary text-white py-4.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-98 transition-all"
                        >
                            {initialData ? "Atualizar Dados" : "Salvar Registro"}
                        </button>
                        {initialData && onDelete && (
                            <button
                                type="button"
                                onClick={() => { if (confirm("ELIMINAR este registro permanentemente?")) { onDelete(initialData.id); onClose(); } }}
                                className="flex-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500 py-4.5 rounded-2xl font-black flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all border border-rose-100 dark:border-rose-900/20"
                            >
                                <Trash2 size={24} />
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
