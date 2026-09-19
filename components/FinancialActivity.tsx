"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type FinancialActivityProps = {
  data: {
    date: string;
    credit: number;
    debit: number;
  }[];
};

const FinancialActivity = ({ data }: FinancialActivityProps) => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Financial Activity
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Money received and sent over the last 7 days.
        </p>
      </div>

      <div className="h-70 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: -15,
              bottom: 5,
            }}
            barGap={8}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
                fill: "#94a3b8",
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
                fill: "#94a3b8",
              }}
              tickFormatter={(value) => `₹${value}`}
            />

            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              formatter={(value, name) => [
                `₹${Number(value).toLocaleString("en-IN")}`,
                name === "credit" ? "Received" : "Sent",
              ]}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #f1f5f9",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              }}
            />

            <Bar
              dataKey="credit"
              name="credit"
              radius={[5, 5, 0, 0]}
              fill="#3b82f6"
              barSize={12}
            />

            <Bar
              dataKey="debit"
              name="debit"
              radius={[5, 5, 0, 0]}
              fill="#9CA3AF"
              barSize={12}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          Received
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-gray-400" />
          Sent
        </div>
      </div>
    </div>
  );
};

export default FinancialActivity;