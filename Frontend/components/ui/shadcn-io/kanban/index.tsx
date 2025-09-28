"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type {
  Announcements,
  DndContextProps,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  createContext,
  type HTMLAttributes,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import tunnel from "tunnel-rat";

const t = tunnel();

export type { DragEndEvent } from "@dnd-kit/core";

type KanbanItemProps = {
  id: string;
  name: string;
  column: string;
  rank?: number; // optional fractional rank
};

type KanbanColumnProps = {
  id: string;
  name: string;
};

type KanbanContextProps<
  T extends KanbanItemProps = KanbanItemProps,
  C extends KanbanColumnProps = KanbanColumnProps
> = {
  columns: C[];
  data: T[];
  activeCardId: string | null;
};

const KanbanContext = createContext<KanbanContextProps>({
  columns: [],
  data: [],
  activeCardId: null,
});

export type KanbanBoardProps = {
  id: string;
  children: ReactNode;
  className?: string;
};

export const KanbanBoard = ({ id, children, className }: KanbanBoardProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      className={cn(
        "flex size-full min-h-40 flex-col divide-y overflow-hidden rounded-md border bg-secondary text-xs shadow-sm ring-2 transition-all",
        isOver ? "ring-primary" : "ring-transparent",
        className
      )}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
};

export type KanbanCardProps<T extends KanbanItemProps = KanbanItemProps> = T & {
  children?: ReactNode;
  className?: string;
};

export const KanbanCard = <T extends KanbanItemProps = KanbanItemProps>({
  id,
  name,
  children,
  className,
}: KanbanCardProps<T>) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transition,
    transform,
    isDragging,
  } = useSortable({
    id,
  });
  const { activeCardId } = useContext(KanbanContext) as KanbanContextProps;

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <>
      <div style={style} {...listeners} {...attributes} ref={setNodeRef}>
        <Card
          className={cn(
            "cursor-grab gap-4 rounded-md p-3 shadow-sm",
            isDragging && "pointer-events-none cursor-grabbing opacity-30",
            className
          )}
        >
          {children ?? <p className="m-0 font-medium text-sm">{name}</p>}
        </Card>
      </div>
      {activeCardId === id && (
        <t.In>
          <Card
            className={cn(
              "cursor-grab gap-4 rounded-md p-3 shadow-sm ring-2 ring-primary",
              isDragging && "cursor-grabbing",
              className
            )}
          >
            {children ?? <p className="m-0 font-medium text-sm">{name}</p>}
          </Card>
        </t.In>
      )}
    </>
  );
};

export type KanbanCardsProps<T extends KanbanItemProps = KanbanItemProps> =
  Omit<HTMLAttributes<HTMLDivElement>, "children" | "id"> & {
    children: (item: T) => ReactNode;
    id: string;
  };

export const KanbanCards = <T extends KanbanItemProps = KanbanItemProps>({
  children,
  className,
  ...props
}: KanbanCardsProps<T>) => {
  const { data } = useContext(KanbanContext) as KanbanContextProps<T>;
  const filteredData = data.filter((item) => item.column === props.id);
  const items = filteredData.map((item) => item.id);

  return (
    <ScrollArea className="overflow-hidden">
      <SortableContext items={items}>
        <div
          className={cn("flex flex-grow flex-col gap-2 p-2", className)}
          {...props}
        >
          {filteredData.map(children)}
        </div>
      </SortableContext>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
};

export type KanbanHeaderProps = HTMLAttributes<HTMLDivElement>;

export const KanbanHeader = ({ className, ...props }: KanbanHeaderProps) => (
  <div className={cn("m-0 p-2 font-semibold text-sm", className)} {...props} />
);

export type KanbanProviderProps<
  T extends KanbanItemProps = KanbanItemProps,
  C extends KanbanColumnProps = KanbanColumnProps
> = Omit<DndContextProps, "children"> & {
  children: (column: C) => ReactNode;
  className?: string;
  columns: C[];
  data: T[];
  onDataChange?: (data: T[]) => void;
  /**
   * Optional immediate sync callback. Called with { id, column, rank }
   */
  onSync?: (payload: { id: string; column: string; rank: number }) => void;
  onDragStart?: (event: DragStartEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  /**
   * Return false to prevent dropping a card into a target column.
   */
  canMoveCard?: (args: {
    item: T;
    fromColumn: string;
    toColumn: string;
    data: T[];
    columns: C[];
  }) => boolean;
};

export const KanbanProvider = <
  T extends KanbanItemProps = KanbanItemProps,
  C extends KanbanColumnProps = KanbanColumnProps
>({
  children,
  onDragStart,
  onDragEnd,
  onDragOver,
  className,
  columns,
  data,
  onDataChange,
  onSync,
  canMoveCard,
  ...props
}: KanbanProviderProps<T, C>) => {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  // keep a ref to the latest data to avoid stale closures during drag events
  const dataRef = useRef<T[]>(data);
  dataRef.current = data;

  // No debounce: send only changed card(s) immediately on drop
  const sendImmediateSyncFor = (newData: T[], changedIds: string[]) => {
    if (!onSync) return;
    const item = newData.find((it) => changedIds.includes(it.id));
    if (!item) return;
    onSync({ id: item.id, column: item.column, rank: item.rank ?? 0 });
  };

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  const recomputeRanks = (arr: T[]) => {
    // Preserve existing ranks from backend; only assign gaps for items without rank
    const copy = arr.map((i) => ({ ...i }));
    columns.forEach((col) => {
      let r = 1;
      copy.forEach((item) => {
        if (item.column === col.id) {
          if (item.rank === undefined || item.rank === null) {
            (item as T).rank = r++ * 1000; // assign gap rank only when missing
          }
          r++;
        }
      });
    });
    return copy;
  };

  // On mount, ensure any missing ranks are filled once and notify parent
  useEffect(() => {
    const filled = recomputeRanks(dataRef.current);
    const changed = filled.some(
      (f, idx) => f.rank !== dataRef.current[idx]?.rank
    );
    if (changed) {
      onDataChange?.(filled);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateRankBetween = (before?: number, after?: number) => {
    if (before === undefined && after === undefined) return 1000;
    if (before === undefined) return (after ?? 2000) / 2;
    if (after === undefined) return before + 1000;
    return (before + after) / 2;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const card = data.find((item) => item.id === event.active.id);
    if (card) {
      setActiveCardId(event.active.id as string);
    }
    onDragStart?.(event);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const activeItem = dataRef.current.find((item) => item.id === active.id);
    const overItem = dataRef.current.find((item) => item.id === over.id);

    if (!activeItem) {
      return;
    }

    const activeColumn = activeItem.column;
    const overColumn =
      overItem?.column ||
      columns.find((col) => col.id === over.id)?.id ||
      columns[0]?.id;

    if (activeColumn !== overColumn) {
      // Do not call onDataChange here; we'll update state and sync on drop only.
      // This avoids intermediate state updates while dragging across columns.
    }

    onDragOver?.(event);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCardId(null);

    onDragEnd?.(event);

    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // start from the latest data snapshot
    let newData = [...dataRef.current];

    const oldIndex = newData.findIndex((item) => item.id === active.id);

    if (oldIndex === -1) return;

    const overItem = newData.find((item) => item.id === over.id);
    const destColumn =
      overItem?.column ||
      columns.find((col) => col.id === over.id)?.id ||
      columns[0]?.id;

    const originalColumn = newData[oldIndex].column;

    // Authorization / rule check
    if (
      canMoveCard &&
      !canMoveCard({
        item: newData[oldIndex],
        fromColumn: originalColumn,
        toColumn: destColumn,
        data: newData,
        columns,
      })
    ) {
      // Disallowed: abort move
      return;
    }

    // ensure the item's column is updated when moving between columns
    newData[oldIndex] = { ...newData[oldIndex], column: destColumn } as T;

    // compute destination index as the index after the last item currently in destColumn
    const destIndices = newData
      .map((item, idx) => (item.column === destColumn ? idx : -1))
      .filter((i) => i !== -1);

    let newIndex: number;
    if (overItem) {
      newIndex = newData.findIndex((item) => item.id === over.id);
    } else if (destIndices.length > 0) {
      newIndex = destIndices[destIndices.length - 1] + 1;
    } else {
      // no items in dest column: place at end of array
      newIndex = newData.length - 1;
    }

    if (oldIndex === -1 || newIndex === -1) return;

    newData = arrayMove(newData, oldIndex, newIndex);

    // Assign a fractional rank only for the moved item using neighbors in its destination column
    const destColumnItems = newData.filter((it) => it.column === destColumn);
    const movedIndexInColumn = destColumnItems.findIndex(
      (it) => it.id === active.id
    );
    const before = destColumnItems[movedIndexInColumn - 1];
    const after = destColumnItems[movedIndexInColumn + 1];
    const newRank = calculateRankBetween(before?.rank, after?.rank);
    // find and set moved item rank in newData
    const movedGlobalIndex = newData.findIndex((it) => it.id === active.id);
    if (movedGlobalIndex !== -1) {
      newData[movedGlobalIndex] = {
        ...newData[movedGlobalIndex],
        rank: newRank,
      } as T;
    }

    // do not renumber other items; recomputeRanks used only to fill missing ranks earlier

    onDataChange?.(newData);
    // send only the moved card immediately to the backend
    sendImmediateSyncFor(newData, [active.id as string]);
  };

  const announcements: Announcements = {
    onDragStart({ active }) {
      const { name, column } = data.find((item) => item.id === active.id) ?? {};

      return `Picked up the card "${name}" from the "${column}" column`;
    },
    onDragOver({ active, over }) {
      const { name } = data.find((item) => item.id === active.id) ?? {};
      const newColumn = columns.find((column) => column.id === over?.id)?.name;

      return `Dragged the card "${name}" over the "${newColumn}" column`;
    },
    onDragEnd({ active, over }) {
      const { name } = data.find((item) => item.id === active.id) ?? {};
      const newColumn = columns.find((column) => column.id === over?.id)?.name;

      return `Dropped the card "${name}" into the "${newColumn}" column`;
    },
    onDragCancel({ active }) {
      const { name } = data.find((item) => item.id === active.id) ?? {};

      return `Cancelled dragging the card "${name}"`;
    },
  };

  return (
    <KanbanContext.Provider value={{ columns, data, activeCardId }}>
      <DndContext
        accessibility={{ announcements }}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
        sensors={sensors}
        {...props}
      >
        <div
          className={cn(
            "grid size-full auto-cols-fr grid-flow-col gap-4",
            className
          )}
        >
          {columns.map((column) => children(column))}
        </div>
        {typeof window !== "undefined" &&
          createPortal(
            <DragOverlay>
              <t.Out />
            </DragOverlay>,
            document.body
          )}
      </DndContext>
    </KanbanContext.Provider>
  );
};
