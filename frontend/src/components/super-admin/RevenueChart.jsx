
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 25000 },
  { month: "Feb", revenue: 32000 },
  { month: "Mar", revenue: 28000 },
  { month: "Apr", revenue: 45000 },
  { month: "May", revenue: 52000 },
  { month: "Jun", revenue: 48295 },
  { month: "Jul", revenue: 61000 },
  { month: "Aug", revenue: 58000 },
  { month: "Sep", revenue: 67000 },
  { month: "Oct", revenue: 72000 },
  { month: "Nov", revenue: 81000 },
  { month: "Dec", revenue: 95000 },
];

const RevenueChart = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      {" "}
      <div className="mb-6">
        {" "}
        <h2 className="text-xl font-bold text-slate-800">Revenue Analytics </h2>
        <p className="text-sm text-slate-500 mt-1">
          Revenue trend for the last 12 months.
        </p>
      </div>
      <ResponsiveContainer width="100%"  height={350}>
        <LineChart data={revenueData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.25} />

          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />

          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />

          <Tooltip
            formatter={(value) => [
              `₹${Number(value).toLocaleString()}`,
              "Revenue",
            ]}
          />

          <Line
            type="natural"
            dataKey="revenue"
            stroke="#2563EB"
            strokeWidth={4}
            dot={{ r: 4 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
