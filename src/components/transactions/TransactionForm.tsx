"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Tag, AlignLeft, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    onDelete?: (id: string, deleteFuture?: boolean) => void;
    initialData?: any;
}

export default function TransactionForm({ isOpen, onClose, onSubmit, onDelete, initialData }: TransactionFormProps) {
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [category, setCategory] = useState("Alimentação");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("EXPENSE");
    const [paid, setPaid] = useState(true);
    const [isRecurring, setIsRecurring] = useState(false);
    const [installments, setInstallments] = useState(2);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isRecurringDelete, setIsRecurringDelete] = useState(false);

    useEffect(() => {
        if (initialData) {
            setAmount(initialData.amount.toString());
            setDate(new Date(initialData.date).toISOString().split("T")[0]);
            setCategory(initialData.category);
            setDescription(initialData.description || "");
            setType(initialData.type);
            setPaid(initialData.paid);
            setIsRecurring(false);
            setInstallments(2);
            setShowDeleteModal(false);
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
        setIsRecurring(false);
        setInstallments(2);
        setShowDeleteModal(false);
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
            installments: (isRecurring && installments > 1) ? installments : 1
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

                    {!initialData && (
                        <div className="space-y-4 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsRecurring(!isRecurring)}
                                className={cn(
                                    "w-full flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all",
                                    isRecurring
                                        ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                                        : "bg-slate-50/50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                        isRecurring ? "bg-amber-500 border-amber-500 text-white" : "bg-transparent border-slate-200 dark:border-slate-700 text-transparent"
                                    )}>
                                        <Check size={16} strokeWidth={4} />
                                    </div>
                                    <span className="font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">Repetir Lançamento (Mensal)</span>
                                </div>
                            </button>

                            {isRecurring && (
                                <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Quantidade de Meses</span>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setInstallments(Math.max(2, installments - 1))}
                                                className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center font-black text-slate-500 hover:scale-95 transition shadow-sm"
                                            >-</button>
                                            <div className="w-12 text-center font-black text-xl text-slate-700 dark:text-white pointer-events-none">{installments}x</div>
                                            <button
                                                type="button"
                                                onClick={() => setInstallments(Math.min(60, installments + 1))}
                                                className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center font-black text-slate-500 hover:scale-95 transition shadow-sm"
                                            >+</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div onClick={() => setPaid(!paid)} className="flex items-center gap-3 p-4 bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-inner">
                        <div className={cn(
                            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                            paid ? "bg-primary border-primary text-white" : "bg-transparent border-slate-200 dark:border-slate-700 text-transparent"
                        )}>
                            <Check size={16} strokeWidth={4} />
                        </div>
                        <input type="checkbox" className="hidden" checked={paid} readOnly />
                        <span className="font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">Registrada como Liquidada</span>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-[3] bg-primary text-white py-4.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-98 transition-all"
                        >
                            {initialData ? "Atualizar Dados" : "Salvar Registro"}
                        </button>
                        {initialData && onDelete && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const isRec = initialData.description && /\(\d+\/\d+\)/.test(initialData.description);
                                        setIsRecurringDelete(!!isRec);
                                        setShowDeleteModal(true);
                                    }}
                                    className="flex-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500 py-4.5 rounded-2xl font-black flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all border border-rose-100 dark:border-rose-900/20"
                                >
                                    <Trash2 size={24} />
                                </button>
                            </>
                        )}
                    </div>
                </form>

                {/* CUSTOM DELETE MODAL - Portal-like behavior via absolute positioning */}
                {showDeleteModal && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[2.5rem]" />
                        <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="text-center mb-6">
                                <div className="w-14 h-14 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Trash2 size={28} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">Excluir Registro?</h3>
                                <p className="text-xs font-medium text-slate-500 leading-relaxed px-4">
                                    {isRecurringDelete
                                        ? "Este item é recorrente. Você pode excluir apenas este mês ou cancelar todas as parcelas futuras."
                                        : "Tem certeza? Esta ação removerá o registro permanentemente do seu histórico."}
                                </p>
                            </div>

                            <div className="space-y-2">
                                {isRecurringDelete ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => { onDelete?.(initialData.id, true); onClose(); }}
                                            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-rose-600/20"
                                        >
                                            Excluir Este e Futuros
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { onDelete?.(initialData.id, false); onClose(); }}
                                            className="w-full py-3.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500 border border-rose-100 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                        >
                                            Excluir Apenas Este
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => { onDelete?.(initialData.id, false); onClose(); }}
                                        className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-rose-600/20"
                                    >
                                        Confirmar Exclusão
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="w-full py-3.5 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
