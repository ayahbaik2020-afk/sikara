"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PIE_COLORS = [
  "#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4",
  "#a855f7", "#ec4899", "#84cc16", "#f97316", "#14b8a6",
];

function formatRp(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function MonthlyBarChart({
  data,
}: {
  data: { month: string; Pemasukan: number; Pengeluaran: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="month" fontSize={12} />
        <YAxis
          fontSize={12}
          tickFormatter={(v) => `${(v / 1000).toLocaleString("id-ID")}rb`}
        />
        <Tooltip formatter={(v: number) => formatRp(v)} />
        <Legend />
        <Bar dataKey="Pemasukan" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryPieChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        Belum ada data pengeluaran bulan ini.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={(entry) => entry.name}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => formatRp(v)} />
      </PieChart>
    </ResponsiveContainer>
  );
}
