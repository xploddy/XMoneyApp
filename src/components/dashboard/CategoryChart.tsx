"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface CategoryChartProps {
    data: { name: string; value: number }[];
}

// Fixed Premium Colors for Chart and matching Legends
export const CHART_COLORS = ["#0066FF", "#A855F7", "#00FF94", "#6366F1", "#F43F5E", "#F59E0B"];

export default function CategoryChart({ data }: CategoryChartProps) {
    if (data.length === 0) {
        return (
            <div className="h-[280px] flex items-center justify-center text-slate-500 font-black uppercase tracking-widest text-[10px]">
                Aguardando lançamentos
            </div>
        );
    }

    return (
        <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={105}
                        paddingAngle={6}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={10}
                    >
                        {data.map((_, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                                className="outline-none focus:outline-none"
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            borderRadius: '24px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            fontWeight: '900',
                            fontSize: '11px',
                            backgroundColor: '#161B26',
                            color: '#ffffff',
                            padding: '16px 20px',
                            backdropFilter: 'blur(10px)'
                        }}
                        itemStyle={{ color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                        cursor={{ fill: 'transparent' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
