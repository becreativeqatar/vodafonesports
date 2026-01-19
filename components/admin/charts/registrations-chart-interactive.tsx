"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RegistrationsChartInteractiveProps {
  data: {
    date: string;
    fullDate: string;
    count: number;
  }[];
  onDateClick?: (fullDate: string) => void;
}

export function RegistrationsChartInteractive({
  data,
  onDateClick,
}: RegistrationsChartInteractiveProps) {
  const handleClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0] && onDateClick) {
      const fullDate = data.activePayload[0].payload.fullDate;
      onDateClick(fullDate);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Registration Trend</span>
          {onDateClick && (
            <span className="text-xs font-normal text-gray-400">
              Click on chart to view details
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              onClick={handleClick}
              style={{ cursor: onDateClick ? "pointer" : "default" }}
            >
              <defs>
                <linearGradient id="colorCountInteractive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E60000" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E60000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [value.toLocaleString(), "Registrations"]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#E60000"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCountInteractive)"
                activeDot={{
                  r: 6,
                  stroke: "#E60000",
                  strokeWidth: 2,
                  fill: "white",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
