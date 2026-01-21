"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface CategoryChartProps {
    data: { name: string; value: number }[];
}

const COLORS = ["#0066FF", "#7000FF", "#00C853", "#FF3D00", "#FFAB00", "#EC4899"];

export default function CategoryChart({ data }: CategoryChartProps) {
    if (data.length === 0) {
        return (
            <div className="h-[250px] flex items-center justify-center text-slate-400 font-black italic uppercase tracking-widest text-[10px]">
                Sem dados para análise
            </div>
        );
    }

    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={10}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            borderRadius: '20px',
                            border: 'none',
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                            fontWeight: '900',
                            fontSize: '10px',
                            backgroundColor: '#0F172A',
                            color: '#ffffff',
                            padding: '12px 16px'
                        }}
                        itemStyle={{ color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                        cursor={{ fill: 'transparent' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
