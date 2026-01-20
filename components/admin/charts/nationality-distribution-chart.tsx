"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface NationalityDistributionChartProps {
  data: { nationality: string; count: number }[];
  onNationalityClick?: (nationality: string) => void;
}

const COLORS = [
  "#E60000", // Vodafone Red
  "#00B0CA", // Aqua Blue
  "#007C92", // Teal
  "#FECB00", // Yellow
  "#9C2AA0", // Purple
  "#5E2750", // Dark Purple
  "#EB9700", // Orange
  "#00857C", // Green
  "#4A4D4E", // Grey
  "#0D0D0D", // Dark
];

export function NationalityDistributionChart({
  data,
  onNationalityClick,
}: NationalityDistributionChartProps) {
  const handleClick = (data: any) => {
    if (onNationalityClick && data?.nationality) {
      onNationalityClick(data.nationality);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Top Nationalities</span>
          {onNationalityClick && (
            <span className="text-xs font-normal text-gray-400">
              Click bar to filter
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <XAxis type="number" />
              <YAxis
                type="category"
                dataKey="nationality"
                tick={{ fontSize: 12 }}
                width={75}
              />
              <Tooltip
                formatter={(value: number) => [value.toLocaleString(), "Registrations"]}
                cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
              />
              <Bar
                dataKey="count"
                onClick={handleClick}
                style={{ cursor: onNationalityClick ? "pointer" : "default" }}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
