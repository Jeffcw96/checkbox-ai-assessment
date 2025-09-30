"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/ui/shadcn-io/kanban";
import { useGetContracts } from "@/hooks/service/useGetContracts";
import { useEffect, useRef, useState } from "react";
import { ContractDetails } from "./contract-details";

export interface KanbanContract {
  id: string;
  title: string;
  description?: string;
  rank: number | undefined;
  status: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  requester?: { id: string; name: string; image: string };
  assignee?: { id: string; name: string; image: string };
  column: string;
  name: string;
}

const columns = [
  { id: "Draft", name: "Draft", color: "#6B7280" },
  { id: "In Review", name: "In Review", color: "#F59E0B" },
  { id: "Done", name: "Done", color: "#10B981" },
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const Dashboard = () => {
  const [contracts, setContracts] = useState<KanbanContract[]>([]);
  const latestContractRef = useRef<KanbanContract[]>([]);

  const { data: apiContracts, isLoading } = useGetContracts();

  const [selectedContract, setSelectedContract] =
    useState<KanbanContract | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const openContract = (m: KanbanContract) => {
    setSelectedContract(m);
    setDetailsOpen(true);
  };

  const pointerRef = useRef<{ x: number; y: number; time: number } | null>(
    null
  );
  const CLICK_MOVE_PX = 5;
  const CLICK_TIME_MS = 300;

  useEffect(() => {
    if (!apiContracts) return;
    const transformed: KanbanContract[] = apiContracts.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      rank: c.rank ?? undefined,
      status: c.status,
      version: c.version,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
      requester: c.requester,
      assignee: c.assignee,
      column: c.status,
      name: c.title,
    }));

    // Map-based rank fill (replaces previous columns.forEach)
    const idToRank = new Map<string, number>();
    columns
      .map((col) => {
        let next = 1000;
        return transformed
          .filter((m) => m.column === col.id)
          .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
          .map((m) => {
            const rank =
              m.rank == null || isNaN(m.rank) ? next : (m.rank as number);
            idToRank.set(m.id, rank);
            next = rank + 1000;
            return m;
          });
      })
      .flat();

    const finalTransformed = transformed.map((m) => ({
      ...m,
      rank: idToRank.get(m.id),
    }));

    setContracts(finalTransformed);
    latestContractRef.current = finalTransformed;
  }, [apiContracts]);

  const handleDataChange = (newData: KanbanContract[]) => {
    setContracts([...newData]);
    latestContractRef.current = [...newData];
  };

  const calculateRank = (before?: number, after?: number) => {
    if (before === undefined && after === undefined) return 1000;
    if (before === undefined) return (after as number) / 2;
    if (after === undefined) return before + 1000;
    return (before + after) / 2;
  };

  const handleSync = (payload: {
    id: string;
    column: string;
    rank: number;
  }) => {
    console.log("latest features snapshot", latestContractRef.current);
    console.log("sync payload", payload);
    const { column, id } = payload;
    const filteredColumn = latestContractRef.current.filter(
      (m) => m.column === column
    );
    const index = filteredColumn.findIndex((m) => m.id === id);
    const before = filteredColumn[index - 1];
    const after = filteredColumn[index + 1];
    console.log("index", index);
    console.log("before", before);
    console.log("after", after);
    console.log("filteredColumn", filteredColumn);
    const apiPayload = {
      id,
      rank: calculateRank(before?.rank, after?.rank),
      status: column,
    };
    console.log("sync payload", apiPayload);
  };

  return (
    <>
      <KanbanProvider
        columns={columns}
        data={contracts}
        onDataChange={handleDataChange}
        onSync={handleSync}
        canMoveCard={({ fromColumn, toColumn }) => fromColumn === toColumn}
      >
        {(column) => (
          <KanbanBoard id={column.id} key={column.id}>
            <KanbanHeader>
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
                <span>{column.name}</span>
                {isLoading && (
                  <span className="text-xs text-muted-foreground">
                    Loading...
                  </span>
                )}
              </div>
            </KanbanHeader>
            <KanbanCards id={column.id}>
              {(contract: KanbanContract) => (
                <KanbanCard
                  column={column.id}
                  id={contract.id}
                  key={contract.id}
                  name={contract.title}
                  rank={contract.rank}
                >
                  <div
                    role="button"
                    className="flex flex-col gap-1 cursor-pointer select-none"
                    onPointerDown={(e) => {
                      pointerRef.current = {
                        x: e.clientX,
                        y: e.clientY,
                        time: performance.now(),
                      };
                    }}
                    onPointerUp={(e) => {
                      const start = pointerRef.current;
                      pointerRef.current = null;
                      if (!start) return;
                      const dx = Math.abs(e.clientX - start.x);
                      const dy = Math.abs(e.clientY - start.y);
                      const dt = performance.now() - start.time;
                      if (
                        dx <= CLICK_MOVE_PX &&
                        dy <= CLICK_MOVE_PX &&
                        dt <= CLICK_TIME_MS
                      ) {
                        e.stopPropagation();
                        openContract(contract);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <p className="m-0 flex-1 font-medium text-sm">
                          {contract.title}
                        </p>
                        <p className="m-0 text-[10px] uppercase tracking-wide text-muted-foreground">
                          {contract.id}
                        </p>
                      </div>
                      {contract.assignee && (
                        <Avatar className="h-4 w-4 shrink-0">
                          <AvatarImage src={contract.assignee.image} />
                          <AvatarFallback>
                            {contract.assignee.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    <p className="m-0 text-muted-foreground text-xs">
                      {shortDateFormatter.format(contract.createdAt)} -{" "}
                      {dateFormatter.format(contract.updatedAt)}
                    </p>
                  </div>
                </KanbanCard>
              )}
            </KanbanCards>
          </KanbanBoard>
        )}
      </KanbanProvider>
      <ContractDetails
        contractId={selectedContract ? selectedContract.id : null}
        open={detailsOpen}
        onOpenChange={(o) => {
          if (!o) setSelectedContract(null);
          setDetailsOpen(o);
        }}
      />
    </>
  );
};
export default Dashboard;
