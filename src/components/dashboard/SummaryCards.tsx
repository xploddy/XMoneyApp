import { ArrowUp, ArrowDown, Wallet, TrendingUp } from "lucide-react";
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
            trend: "EM ALTA",
            amount: income,
            icon: ArrowUp,
            color: "text-success",
            iconBg: "bg-success/10",
        },
        {
            title: "DESPESAS",
            trend: "SOB CONTROLE",
            amount: expense,
            icon: ArrowDown,
            color: "text-danger",
            iconBg: "bg-danger/10",
        },
        {
            title: "SALDO LÍQUIDO",
            trend: balance >= 0 ? "POSITIVO" : "ATENÇÃO",
            amount: balance,
            icon: Wallet,
            color: "text-primary",
            iconBg: "bg-primary/10",
            highlight: true
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <div
                        key={card.title}
                        className={cn(
                            "premium-card p-6 border-white/5 relative group transition-all duration-300 hover:border-primary/30",
                            card.highlight ? "bg-primary/5 border-primary/20" : "bg-[#161B26]"
                        )}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", card.iconBg)}>
                                <Icon size={18} className={card.color} strokeWidth={3} />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{card.title}</p>
                                <p className={cn("text-[9px] font-black uppercase tracking-widest mt-0.5", card.color)}>{card.trend}</p>
                            </div>
                        </div>

                        <div className="space-y-0.5">
                            <h3 className={cn("text-3xl font-black tracking-tight leading-none", card.highlight ? "text-white" : "text-white")}>
                                {formatCurrency(card.amount)}
                            </h3>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">Status de Patrimônio</p>
                        </div>

                        <div className="absolute right-6 bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
                            <TrendingUp size={60} className={card.color} strokeWidth={1} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
