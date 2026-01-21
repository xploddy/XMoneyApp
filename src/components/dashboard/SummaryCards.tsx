import { ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface SummaryCardsProps {
    income: number;
    expense: number;
    balance: number;
}

export default function SummaryCards({ income, expense, balance }: SummaryCardsProps) {
    const cards = [
        {
            title: "RECEITAS",
            amount: income,
            icon: ArrowUpCircle,
            trend: income > 0 ? "Em alta" : "Estável",
            color: "text-emerald-500",
            iconColor: "text-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-500/10",
            accent: "bg-emerald-500",
            TrendIcon: TrendingUp,
        },
        {
            title: "DESPESAS",
            amount: expense,
            icon: ArrowDownCircle,
            trend: "Sob controle",
            color: "text-rose-500",
            iconColor: "text-rose-600",
            bg: "bg-rose-50 dark:bg-rose-500/10",
            accent: "bg-rose-500",
            TrendIcon: TrendingDown,
        },
        {
            title: "SALDO LÍQUIDO",
            amount: balance,
            icon: Wallet,
            trend: balance > 0 ? "Positivo" : "Atenção",
            color: "text-blue-500",
            iconColor: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-500/10",
            accent: "bg-blue-500",
            highlight: true,
            TrendIcon: TrendingUp,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {cards.map((card) => {
                const Icon = card.icon;
                const TrendIcon = card.TrendIcon;
                return (
                    <div
                        key={card.title}
                        className={cn(
                            "group p-6 rounded-[1.75rem] bg-white dark:bg-slate-900 border-2 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden",
                            card.highlight ? "border-blue-500/40 shadow-lg shadow-blue-500/5" : "border-slate-100 dark:border-slate-800"
                        )}
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:rotate-12",
                                card.bg,
                                card.iconColor
                            )}>
                                <Icon size={24} strokeWidth={2.5} />
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-0.5">
                                    {card.title}
                                </span>
                                <div className={cn("flex items-center justify-end gap-1 text-[8px] font-black uppercase", card.color)}>
                                    <TrendIcon size={10} />
                                    <span>{card.trend}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-0.5">
                            <h3 className={cn("text-2xl font-black tracking-tighter", card.color)}>
                                {formatCurrency(card.amount)}
                            </h3>
                            <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">Status de Patrimônio</p>
                        </div>

                        <div className={cn("absolute bottom-0 left-0 h-1.5 w-0 group-hover:w-full transition-all duration-700", card.accent)} />
                    </div>
                );
            })}
        </div>
    );
}
