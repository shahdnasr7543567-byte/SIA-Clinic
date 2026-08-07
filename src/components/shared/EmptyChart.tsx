import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";

interface EmptyChartProps {
  height?: number;
  message?: string;
}

// Placeholder x-axis labels so the chart frame renders with the right shape
// even though there is no real data yet.
const placeholderData = [
  { label: "1" }, { label: "2" }, { label: "3" }, { label: "4" }, { label: "5" }, { label: "6" },
];

export function EmptyChart({ height = 220, message = "لا توجد بيانات كافية لعرض الرسم البياني" }: EmptyChartProps) {
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={placeholderData}>
          <XAxis dataKey="label" tick={false} axisLine={{ stroke: "hsl(var(--border))" }} />
          <YAxis tick={false} axisLine={{ stroke: "hsl(var(--border))" }} />
          <Area dataKey={() => 0} stroke="hsl(var(--border))" fill="transparent" />
        </AreaChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <BarChart3 className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
