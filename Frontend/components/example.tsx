"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/ui/shadcn-io/kanban";
import { faker } from "@faker-js/faker";
import { useRef, useState } from "react";
import { MatterDetails } from "./matter-details";

// Backend (snake_case) columns will be transformed to this camelCase shape later.
export interface Comment {
  id: string;
  matterId: string;
  message: string;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    image: string;
  };
}
export interface Document {
  id: string;
  matterId: string;
  name: string;
  url: string;
  createdAt: Date;
}
export interface Matter {
  id: string; // id
  contractId: string; // contract_id
  title: string; // title
  description?: string; // description
  rank: number | undefined; // rank (numeric)
  status: string; // status
  version: number; // version
  createdAt: Date; // created_at
  updatedAt: Date; // updated_at
  requesterId?: string; // requester_id
  assigneeId?: string; // assignee_id
  requester?: { id: string; name: string; image: string };
  assignee?: { id: string; name: string; image: string };
  // Kanban-specific (derived):
  column: string; // mirrors status
  name: string; // alias for KanbanCard (use title)
}

const columns = [
  { id: "PLANNED", name: "Planned", color: "#6B7280" },
  { id: "IN_PROGRESS", name: "In Progress", color: "#F59E0B" },
  { id: "DONE", name: "Done", color: "#10B981" },
];
const users = Array.from({ length: 4 })
  .fill(null)
  .map(() => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    image: faker.image.avatar(),
  }));

// Generate mocked matters (replace previous feature mocks)
const mockedMattersRaw: Matter[] = Array.from({ length: 8 }).map((_v, idx) => {
  const status = faker.helpers.arrayElement(columns).id;
  const requester = faker.helpers.arrayElement(users);
  const assignee = faker.helpers.arrayElement(users);
  // Ensure deterministic date ordering
  const createdAt = faker.date.past({ years: 0.25 });
  const updatedAt = faker.date.between({ from: createdAt, to: new Date() });
  return {
    id: faker.string.uuid(),
    contractId: faker.string.alphanumeric({ length: 10 }).toUpperCase(),
    title: faker.company.catchPhrase(),
    description: faker.lorem.sentences({ min: 1, max: 2 }),
    rank: undefined, // will be filled per column
    status,
    version: 0,
    createdAt,
    updatedAt,
    requesterId: requester.id,
    assigneeId: assignee.id,
    requester,
    assignee,
    column: status,
    name: "", // set after
  } as Matter;
});

// Initialize name + rank per column with gaps
const initialMatters: Matter[] = (() => {
  const copy = mockedMattersRaw.map((m) => ({ ...m, name: m.title }));
  columns.forEach((col) => {
    let r = 1;
    copy
      .filter((m) => m.column === col.id)
      .forEach((m) => {
        m.rank = r++ * 1000;
      });
  });
  return copy;
})();

// Mock documents & comments per matter
const initialDocuments: Document[] = initialMatters.flatMap((m) =>
  Array.from({ length: faker.number.int({ min: 0, max: 3 }) }).map(() => {
    const [from, to] =
      m.createdAt <= m.updatedAt
        ? [m.createdAt, m.updatedAt]
        : [m.updatedAt, m.createdAt];
    return {
      id: faker.string.uuid(),
      matterId: m.id,
      name: faker.system.commonFileName(faker.system.commonFileExt()),
      url: faker.internet.url(),
      createdAt: faker.date.between({ from, to }),
    };
  })
);

const initialComments: Comment[] = initialMatters.flatMap((m) =>
  Array.from({ length: faker.number.int({ min: 1, max: 5 }) }).map(() => {
    const author = faker.helpers.arrayElement(users);
    const [from, to] =
      m.createdAt <= m.updatedAt
        ? [m.createdAt, m.updatedAt]
        : [m.updatedAt, m.createdAt];
    return {
      id: faker.string.uuid(),
      matterId: m.id,
      message: faker.lorem.sentences({ min: 1, max: 2 }),
      createdAt: faker.date.between({ from, to }),
      author,
    } as Comment;
  })
);

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});
const Example = () => {
  const [matters, setMatters] = useState<Matter[]>(initialMatters);
  const latestMattersRef = useRef<Matter[]>(initialMatters);
  const [documents] = useState<Document[]>(initialDocuments);
  const [comments] = useState<Comment[]>(initialComments);

  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const openMatter = (m: Matter) => {
    setSelectedMatter(m);
    setDetailsOpen(true);
  };

  // Track pointer to distinguish click vs drag
  const pointerRef = useRef<{ x: number; y: number; time: number } | null>(
    null
  );
  const CLICK_MOVE_PX = 5;
  const CLICK_TIME_MS = 300;

  const handleDataChange = (newData: Matter[]) => {
    setMatters([...newData]);
    latestMattersRef.current = [...newData];
  };

  const handleSync = (payload: {
    id: string;
    column: string;
    rank: number;
  }) => {
    console.log("latest features snapshot", latestMattersRef.current);
    console.log("sync payload", payload);
    // Placeholder for future PATCH /api/matters/:id
    const { column, id } = payload;
    const filteredColumn = latestMattersRef.current.filter(
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
      status: column, // backend expects status (snake_case later)
    };
    console.log("sync payload", apiPayload);
  };

  const calculateRank = (before?: number, after?: number) => {
    if (before === undefined && after === undefined) return 1000;
    if (before === undefined) return (after as number) / 2;
    if (after === undefined) return before + 1000;
    return (before + after) / 2;
  };

  return (
    <>
      <KanbanProvider
        columns={columns}
        data={matters}
        onDataChange={handleDataChange}
        onSync={handleSync}
        canMoveCard={({ fromColumn, toColumn }) => fromColumn === toColumn} // keep disabled for now
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
              </div>
            </KanbanHeader>
            <KanbanCards id={column.id}>
              {(matter: Matter) => (
                <KanbanCard
                  column={column.id}
                  id={matter.id}
                  key={matter.id}
                  name={matter.title}
                  rank={matter.rank}
                  // onClick removed: drag engine likely swallows it
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
                        openMatter(matter);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <p className="m-0 flex-1 font-medium text-sm">
                          {matter.title}
                        </p>
                        <p className="m-0 text-[10px] uppercase tracking-wide text-muted-foreground">
                          {matter.contractId}
                        </p>
                      </div>
                      {matter.assignee && (
                        <Avatar className="h-4 w-4 shrink-0">
                          <AvatarImage src={matter.assignee.image} />
                          <AvatarFallback>
                            {matter.assignee.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    <p className="m-0 text-muted-foreground text-xs">
                      {shortDateFormatter.format(matter.createdAt)} -{" "}
                      {dateFormatter.format(matter.updatedAt)}
                    </p>
                  </div>
                </KanbanCard>
              )}
            </KanbanCards>
          </KanbanBoard>
        )}
      </KanbanProvider>
      <MatterDetails
        matter={selectedMatter}
        comments={
          selectedMatter
            ? comments
                .filter((c) => c.matterId === selectedMatter.id)
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            : []
        }
        documents={
          selectedMatter
            ? documents
                .filter((d) => d.matterId === selectedMatter.id)
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            : []
        }
        open={detailsOpen}
        onOpenChange={(o) => {
          if (!o) setSelectedMatter(null);
          setDetailsOpen(o);
        }}
      />
    </>
  );
};
export default Example;
