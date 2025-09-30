import { sql } from "drizzle-orm";
import { db } from "../db/client";
import { contracts, contractStatusHistory } from "../db/schema";

export interface ContractsByStatus {
  status: string;
  count: number;
}

export interface AverageStatusCycleTime {
  status: string;
  averageDurationSeconds: number;
  averageDurationLabel: string;
}

export interface ReportingResult {
  totalContracts: number;
  contractsByStatus: ContractsByStatus[];
  averageStatusCycleTime: AverageStatusCycleTime[];
}

export async function getReport(): Promise<ReportingResult> {
  // 1. Total number of contracts
  const totalContractsRes = await db
    .select({ count: sql<number>`count(*)` })
    .from(contracts);
  const totalContracts = Number(totalContractsRes[0]?.count ?? 0);

  // 2. Count of contracts grouped by status
  const contractsByStatusRaw = await db
    .select({
      status: contracts.status,
      count: sql<number>`count(*)`,
    })
    .from(contracts)
    .groupBy(contracts.status)
    .orderBy(contracts.status);

  const contractsByStatus: ContractsByStatus[] = contractsByStatusRaw.map(
    (r: any) => ({
      status: r.status,
      count: Number(r.count),
    })
  );

  const result = await db.execute(sql`
    WITH status_durations AS (
      SELECT
        csh.contract_id,
        csh.status,
        EXTRACT(EPOCH FROM (
          LEAD(csh.changed_at) OVER (
            PARTITION BY csh.contract_id ORDER BY csh.changed_at
          ) - csh.changed_at
        )) AS duration_seconds
      FROM ${contractStatusHistory} csh
    )
    SELECT
      status,
      AVG(duration_seconds) AS avg_duration_seconds
    FROM status_durations
    WHERE duration_seconds IS NOT NULL
    GROUP BY status
  `);

  return {
    totalContracts,
    contractsByStatus,
    averageStatusCycleTime: result.map((row: any) => {
      const seconds = Number(row.avg_duration_seconds);
      return {
        status: row.status,
        averageDurationSeconds: seconds,
        averageDurationLabel: humanizeDuration(seconds),
      };
    }),
  };
}

// Helper to present a friendly string (e.g., "2d 3h 14m")
function humanizeDuration(totalSeconds: number): string {
  if (!isFinite(totalSeconds) || totalSeconds < 1) return "0s";
  const sec = Math.floor(totalSeconds);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const parts: string[] = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s && parts.length < 2) parts.push(`${s}s`);
  return parts.join(" ") || "0s";
}
