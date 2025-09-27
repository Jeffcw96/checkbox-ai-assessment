'use client';
import { faker } from '@faker-js/faker';
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from '@/components/ui/shadcn-io/kanban';
import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const columns = [
  { id: "PLANNED", name: 'Planned', color: '#6B7280' },
  { id: "IN_PROGRESS", name: 'In Progress', color: '#F59E0B' },
  { id: "DONE", name: 'Done', color: '#10B981' },
];
const users = Array.from({ length: 4 })
  .fill(null)
  .map(() => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    image: faker.image.avatar(),
  }));

// generate raw features
const exampleFeaturesRaw = Array.from({ length: 5 })
  .fill(null)
  .map((_val, ind) => {
    const name = capitalize(faker.company.buzzPhrase())
    return {
    id: name,
    name,
    startAt: faker.date.past({ years: 0.5, refDate: new Date() }),
    endAt: faker.date.future({ years: 0.5, refDate: new Date() }),
    column: faker.helpers.arrayElement(columns).id,
    owner: faker.helpers.arrayElement(users),
    rank: ind * 1000,
  }});

// compute initial rank per column
const exampleFeatures = (() => {
  const copy = exampleFeaturesRaw.map((f) => ({ ...f }));
  // Start with rank 1000 for the first item in each column
  columns.forEach((col) => {
    let r = 1;
    copy.forEach((item) => {
      if (item.column === col.id) {
        (item as unknown as { rank?: number }).rank = (r++) * 1000; // multiply by 1000 to leave gaps
      }
    });
  });
  return copy;
})();

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});
const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});
const Example = () => {
  const [features, setFeatures] = useState(exampleFeatures);
  // keep a mutable ref with the latest features snapshot so sync handlers
  // can access the current board without waiting for React state to settle
  const latestFeaturesRef = useRef<typeof exampleFeatures>(exampleFeatures);

  const handleDataChange = (newData: typeof exampleFeatures) => {
    console.log('Data changed:', newData);
    setFeatures([...newData]);
    latestFeaturesRef.current = [...newData];
  };


  const handleSync = (payload: { id: string; column: string; rank: number }) => {
    // replace this with an actual network call to your backend endpoint
    // e.g. fetch('/api/kanban/card', { method: 'PATCH', body: JSON.stringify(payload) })
    // use latestFeaturesRef.current instead of the possibly-stale `features` variable
    console.log('latest features snapshot', latestFeaturesRef.current);
    console.log('sync payload', payload);

    const {column, id} = payload

    const filteredColumn = latestFeaturesRef.current.filter(f => f.column === column)
    console.log('filteredColumn', filteredColumn)

    // Find the elements index that happened before and after of the moved element
    // Returns undefined if there is no such element
    const index = filteredColumn.findIndex(f => f.id === id)
    const before = filteredColumn[index - 1]
    const after = filteredColumn[index + 1]

    console.log('index', index)
    console.log('before', before)
    console.log('after', after)

    const apiPayload = {
      id,
      rank: calculateRank(before?.rank, after?.rank),
      column
    }

    console.log('apiPayload', apiPayload)

  };

  const calculateRank = (before?: number, after?: number) => {
    if (before === undefined && after === undefined) return 1000;
    if (before === undefined) return after! / 2;
    if (after === undefined) return before + 1000;
    return (before + after) / 2;
  }

  return (
    <KanbanProvider
      columns={columns}
      data={features}
      onDataChange={handleDataChange}
      onSync={handleSync}
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
            {(feature: (typeof features)[number]) => (
              <KanbanCard
                column={column.id}
                id={feature.id}
                key={feature.id}
                name={feature.name}
                rank={feature.rank}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <p className="m-0 flex-1 font-medium text-sm">
                      {feature.name}
                    </p>
                  </div>
                  {feature.owner && (
                    <Avatar className="h-4 w-4 shrink-0">
                      <AvatarImage src={feature.owner.image} />
                      <AvatarFallback>
                        {feature.owner.name?.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <p className="m-0 text-muted-foreground text-xs">
                  {shortDateFormatter.format(feature.startAt)} - {' '}
                  {dateFormatter.format(feature.endAt)}
                </p>
              </KanbanCard>
            )}
          </KanbanCards>
        </KanbanBoard>
      )}
    </KanbanProvider>
  );
};
export default Example;