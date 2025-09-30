"use client";
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { NameType } from "recharts/types/component/DefaultTooltipContent";
import { useGetReport } from "../hooks/service/useGetReport";

function secondsToHours(sec?: number) {
  if (!sec || sec <= 0) return 0;
  return Number((sec / 3600).toFixed(2));
}

export default function Report() {
  const { data, isLoading, isError, error, refetch } = useGetReport();

  if (isLoading)
    return (
      <div className="p-6 animate-pulse text-sm text-muted-foreground">
        Loading report...
      </div>
    );

  if (isError)
    return (
      <div className="p-6 space-y-3">
        <div className="text-red-600 text-sm">
          Failed to load report: {error.message}
        </div>
        <button
          onClick={() => refetch()}
          className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
        >
          Retry
        </button>
      </div>
    );

  if (!data) return null;

  const statusCountData = data.contractsByStatus.map((d) => ({
    status: d.status,
    count: d.count,
  }));

  const avgCycleData = data.averageStatusCycleTime.map((d) => ({
    status: d.status,
    hours: secondsToHours(d.averageDurationSeconds),
    label: d.averageDurationLabel,
  }));

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Reporting</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded border p-4 bg-white shadow-sm">
          <div className="text-sm text-muted-foreground">Total Matters</div>
          <div className="text-3xl font-bold mt-1">{data.totalContracts}</div>
        </div>
        <div className="rounded border p-4 bg-white shadow-sm">
          <div className="text-sm text-muted-foreground">Total Status Type</div>
          <div className="text-3xl font-bold mt-1">
            {data.contractsByStatus.length}
          </div>
        </div>
      </div>

      {/* Status counts list */}
      <div className="rounded border bg-white shadow-sm">
        <div className="p-4 border-b font-medium">Matters by Status</div>
        <ul className="divide-y">
          {statusCountData.map((s) => (
            <li
              key={s.status}
              className="flex items-center justify-between px-4 py-2 text-sm"
            >
              <span>{s.status}</span>
              <span className="font-semibold">{s.count}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Charts */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Bar chart: counts */}
        <div className="rounded border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-medium mb-4">Matters per Status</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusCountData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar chart: average cycle time */}
        <div className="rounded border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-medium mb-4">
            Average Cycle Time (Hours)
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={avgCycleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip
                  formatter={(val: number, _name, entry) => [
                    entry.payload.label,
                    "Avg Duration" as NameType,
                  ]}
                />
                <Bar dataKey="hours" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
