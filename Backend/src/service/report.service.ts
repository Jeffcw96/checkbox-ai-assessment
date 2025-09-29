import { sql } from "drizzle-orm";
import { contracts, contractStatusHistory } from "../db/schema";

export interface ContractsByStatus {
  status: string;
  count: number;
}

export interface AverageStatusCycleTime {
  status: string;
  averageDurationSeconds: number;
  averageDurationHuman: string;
}

export interface ReportingResult {
  totalContracts: number;
  contractsByStatus: ContractsByStatus[];
  averageStatusCycleTime: AverageStatusCycleTime[];
}

/**
 * getReport
 * @param db Drizzle database instance (pass your configured db)
 */
export async function getReport(db: any): Promise<ReportingResult> {
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

  // 3. Average cycle time a contract sits in each status before moving
  // Uses window function LEAD to get the next changed_at per contract.
  const averageStatusCycleTimeRaw = await db.execute(sql`
    with ordered as (
      select
        csh.contract_id,
        csh.status,
        csh.changed_at,
        lead(csh.changed_at) over (
          partition by csh.contract_id
          order by csh.changed_at
        ) as next_changed_at
      from ${contractStatusHistory} csh
    ),
    durations as (
      select
        status,
        extract(epoch from (next_changed_at - changed_at)) as duration_seconds
      from ordered
      where next_changed_at is not null -- exclude current/open terminal status
    )
    select
      status,
      avg(duration_seconds)::float as average_duration_seconds
    from durations
    group by status
    order by status;
  `);

  const averageStatusCycleTime: AverageStatusCycleTime[] =
    (averageStatusCycleTimeRaw as any).rows?.map((row: any) => {
      const seconds = Number(row.average_duration_seconds);
      return {
        status: row.status,
        averageDurationSeconds: seconds,
        averageDurationHuman: humanizeDuration(seconds),
      };
    }) ?? [];

  return {
    totalContracts,
    contractsByStatus,
    averageStatusCycleTime,
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
