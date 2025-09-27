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
import { useState } from "react";
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
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
const exampleFeatures = Array.from({ length: 3 })
  .fill(null)
  .map((_val, ind) => {
    const name = capitalize(faker.company.buzzPhrase());
    return {
      id: name,
      name,
      startAt: faker.date.past({ years: 0.5, refDate: new Date() }),
      endAt: faker.date.future({ years: 0.5, refDate: new Date() }),
      column: faker.helpers.arrayElement(columns).id,
      owner: faker.helpers.arrayElement(users),
      index: ind * 100, // This will be the ranking index in the column later on
    };
  });
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

type Feature = (typeof exampleFeatures)[number];
function calculateChanges(original: Feature[], current: Feature[]) {
  const changes: Partial<Feature>[] = [];

  console.log("original", original);
  console.log("current", current);

  return changes;
}

const KanbanExample = () => {
  const [originalFeatures, setOriginalFeatures] = useState(
    JSON.parse(JSON.stringify(exampleFeatures))
  );
  const [features, setFeatures] = useState(exampleFeatures);

  const handleDragEnd = () => {
    const changes = calculateChanges(originalFeatures, features);
    if (changes.length > 0) {
      // api.updatePositions(changes); // your backend call
      console.log("Changes to be saved:", changes);
      setOriginalFeatures([...features]); // sync baseline
    }
  };
  return (
    <KanbanProvider
      columns={columns}
      data={features}
      onDataChange={(e) => {
        console.log("eee", e);
        setFeatures(e);
      }}
      onDragEnd={handleDragEnd}
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
                index={feature.index}
                startAt={feature.startAt}
                endAt={feature.endAt}
                owner={feature.owner}
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
                  {shortDateFormatter.format(feature.startAt)} -{" "}
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
export default KanbanExample;
