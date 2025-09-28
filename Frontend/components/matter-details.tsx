"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";

interface Matter {
  id: string;
  contractId: string;
  title: string;
  description?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  requester?: { id: string; name: string; image: string };
  assignee?: { id: string; name: string; image: string };
  rank?: number; // kept for data, not shown
  version: number; // kept for data, not shown
}

interface Comment {
  id: string;
  message: string;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    image: string;
  };
}

interface Document {
  id: string;
  name: string;
  createdAt: Date;
}

interface MatterDetailsProps {
  matter: Matter | null;
  comments: Comment[];
  documents: Document[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const dateTime = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const MatterDetails: React.FC<MatterDetailsProps> = ({
  matter,
  comments,
  documents,
  open,
  onOpenChange,
}) => {
  if (!open || !matter) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-6"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-5xl rounded-lg bg-background shadow-lg border grid grid-cols-1 md:grid-cols-[1fr_260px] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close (X) button */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close dialog"
          className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            ×
          </span>
        </button>
        {/* Left Main Panel */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <h2 className="text-xl font-semibold leading-tight">
            {matter.title}
          </h2>

          {/* Description */}
          {matter.description && (
            <div>
              <h3 className="text-sm font-medium mb-1 text-muted-foreground uppercase tracking-wide">
                Description
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {matter.description}
              </p>
            </div>
          )}

          {/* Documents */}
          <div>
            <h3 className="text-sm font-medium mb-2 text-muted-foreground uppercase tracking-wide">
              Documents ({documents.length})
            </h3>
            {documents.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No documents uploaded.
              </p>
            )}
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between rounded border px-3 py-2 text-sm hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{doc.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {dateTime.format(doc.createdAt)}
                    </p>
                  </div>
                  {/* uploader & size removed */}
                </li>
              ))}
            </ul>
          </div>

          {/* Comments */}
          <div>
            <h3 className="text-sm font-medium mb-2 text-muted-foreground uppercase tracking-wide">
              Comments ({comments.length})
            </h3>
            {comments.length === 0 && (
              <p className="text-xs text-muted-foreground">No comments yet.</p>
            )}
            <ul className="space-y-4">
              {comments.map((c) => (
                <li key={c.id} className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={c.author.image} />
                    <AvatarFallback>{c.author.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {c.author.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {dateTime.format(c.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm mt-1 whitespace-pre-wrap">
                      {c.message}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="border-l p-6 space-y-5 bg-muted/30">
          <SidebarField label="ID" value={matter.id} mono />
          <SidebarField label="Status" value={matter.status} />
          <SidebarField
            label="Created"
            value={dateTime.format(matter.createdAt)}
          />
          <SidebarField
            label="Updated"
            value={dateTime.format(matter.updatedAt)}
          />
          <SidebarUser label="Requester" user={matter.requester} />
          <SidebarUser label="Assignee" user={matter.assignee} />
          {/* rank & version intentionally hidden but preserved in data */}
        </div>
      </div>
    </div>
  );
};

const SidebarField: React.FC<{
  label: string;
  value?: string;
  mono?: boolean;
}> = ({ label, value, mono }) => {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={`text-sm ${
          mono ? "font-mono break-all leading-snug" : "font-medium"
        }`}
      >
        {value}
      </p>
    </div>
  );
};

const SidebarUser: React.FC<{
  label: string;
  user?: { id: string; name: string; image: string };
}> = ({ label, user }) => {
  if (!user) return null;
  return (
    <div className="space-y-1">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={user.image} />
          <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{user.name}</span>
      </div>
    </div>
  );
};
