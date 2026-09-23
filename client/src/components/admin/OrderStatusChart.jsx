import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95 text-xs">
        <p className="font-bold" style={{ color: item.payload.color }}>
          {item.name}: <span className="text-slate-900 dark:text-white">{item.value} orders</span>
        </p>
      </div>
    );
  }
  return null;
}

export default function OrderStatusChart({ data }) {
  if (!data || data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        No orders recorded yet.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {value}
              </span>
            )}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
