"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from "recharts";
import { useState } from "react";

interface AgeDistributionChartInteractiveProps {
  data: {
    KIDS: number;
    YOUTH: number;
    ADULT: number;
    SENIOR: number;
  };
  onAgeGroupClick?: (ageGroup: string) => void;
}

const COLORS = {
  KIDS: "#FECB00",
  YOUTH: "#00B0CA",
  ADULT: "#E60000",
  SENIOR: "#007C92",
};

const LABELS = {
  KIDS: "Kids",
  YOUTH: "Youth",
  ADULT: "Adult",
  SENIOR: "Senior",
};

// Custom active shape for hover effect
const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    value,
    percent,
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" }}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 4}
        outerRadius={innerRadius}
        fill={fill}
      />
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        fill="#333"
        fontSize={16}
        fontWeight="bold"
      >
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#666" fontSize={14}>
        {value.toLocaleString()}
      </text>
      <text x={cx} y={cy + 28} textAnchor="middle" fill="#999" fontSize={12}>
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

export function AgeDistributionChartInteractive({
  data,
  onAgeGroupClick,
}: AgeDistributionChartInteractiveProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const chartData = Object.entries(data).map(([key, value]) => ({
    name: LABELS[key as keyof typeof LABELS],
    value,
    color: COLORS[key as keyof typeof COLORS],
    ageGroup: key,
  }));

  const handleClick = (_: any, index: number) => {
    if (onAgeGroupClick && chartData[index]) {
      onAgeGroupClick(chartData[index].ageGroup);
    }
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Age Distribution</span>
          {onAgeGroupClick && (
            <span className="text-xs font-normal text-gray-400">
              Click on segment to view details
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                onClick={handleClick}
                style={{ cursor: onAgeGroupClick ? "pointer" : "default" }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [value.toLocaleString(), "Count"]}
              />
              <Legend
                formatter={(value, entry: any) => (
                  <span
                    style={{ cursor: onAgeGroupClick ? "pointer" : "default" }}
                    onClick={() => {
                      const item = chartData.find((d) => d.name === value);
                      if (item && onAgeGroupClick) {
                        onAgeGroupClick(item.ageGroup);
                      }
                    }}
                  >
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
