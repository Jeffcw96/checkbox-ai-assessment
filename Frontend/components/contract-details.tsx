"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetContractById } from "@/hooks/service/useGetContractByID";
import { useGetContractComments } from "@/hooks/service/useGetContractComment";
import { useGetContractDocuments } from "@/hooks/service/useGetContractDocument";

interface ContractDetailsProps {
  contractId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const dateTime = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const ContractDetails: React.FC<ContractDetailsProps> = ({
  contractId,
  open,
  onOpenChange,
}) => {
  const {
    data: contract,
    isLoading: contractLoading,
    error: contractError,
  } = useGetContractById(contractId || "", {
    enabled: open && !!contractId,
    staleTime: 0,
  });

  const {
    data: comments = [],
    isLoading: commentsLoading,
    error: commentsError,
  } = useGetContractComments(contractId || "", {
    enabled: open && !!contractId,
    staleTime: 0,
  });

  const {
    data: documents = [],
    isLoading: documentsLoading,
    error: documentsError,
  } = useGetContractDocuments(contractId || "", {
    enabled: open && !!contractId,
    staleTime: 0,
  });

  if (!open || !contractId) return null;

  if (contractError) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-6"
        onClick={() => onOpenChange(false)}
      >
        <div
          className="w-full max-w-5xl rounded-lg bg-background shadow-lg border p-10 text-sm text-red-600"
          onClick={(e) => e.stopPropagation()}
        >
          Failed to load contract.
        </div>
      </div>
    );
  }

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
          {contractLoading ? (
            <>
              {/* Title skeleton */}
              <Skeleton className="h-6 w-2/3" />
              {/* Description skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              {/* Documents skeleton */}
              <div>
                <Skeleton className="h-3 w-28 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
              {/* Comments skeleton */}
              <div>
                <Skeleton className="h-3 w-24 mb-3" />
                <div className="space-y-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Title */}
              <h2 className="text-xl font-semibold leading-tight">
                {contract?.title}
              </h2>

              {/* Description */}
              {contract?.description && (
                <div>
                  <h3 className="text-sm font-medium mb-1 text-muted-foreground uppercase tracking-wide">
                    Description
                  </h3>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {contract.description}
                  </p>
                </div>
              )}

              {/* Documents */}
              <div>
                <h3 className="text-sm font-medium mb-2 text-muted-foreground uppercase tracking-wide">
                  Documents ({documentsLoading ? "…" : documents.length})
                </h3>
                {documentsError && (
                  <p className="text-xs text-red-600">
                    Failed to load documents.
                  </p>
                )}
                {documentsLoading && (
                  <ul className="space-y-2">
                    {[0, 1].map((i) => (
                      <li key={i} className="rounded border px-3 py-2">
                        <Skeleton className="h-4 w-2/3 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </li>
                    ))}
                  </ul>
                )}
                {!documentsLoading &&
                  documents.length === 0 &&
                  !documentsError && (
                    <p className="text-xs text-muted-foreground">
                      No documents uploaded.
                    </p>
                  )}
                {!documentsLoading && (
                  <ul className="space-y-2">
                    {documents.map((doc) => (
                      <li
                        key={doc.id}
                        className="flex items-center justify-between rounded border px-3 py-2 text-sm hover:bg-muted/40"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{doc.fileName}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {dateTime.format(new Date(doc.createdAt))}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Comments */}
              <div>
                <h3 className="text-sm font-medium mb-2 text-muted-foreground uppercase tracking-wide">
                  Comments ({commentsLoading ? "…" : comments.length})
                </h3>
                {commentsError && (
                  <p className="text-xs text-red-600">
                    Failed to load comments.
                  </p>
                )}
                {commentsLoading && (
                  <ul className="space-y-4">
                    {[0, 1, 2].map((i) => (
                      <li key={i} className="flex gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {!commentsLoading &&
                  comments.length === 0 &&
                  !commentsError && (
                    <p className="text-xs text-muted-foreground">
                      No comments yet.
                    </p>
                  )}
                {!commentsLoading && (
                  <ul className="space-y-4">
                    {comments.map((c) => (
                      <li key={c.id} className="flex gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={c.author.image || ""} />
                          <AvatarFallback>
                            {c.author.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {c.author.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {dateTime.format(new Date(c.createdAt))}
                            </span>
                          </div>
                          <p className="text-sm mt-1 whitespace-pre-wrap">
                            {c.message}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="border-l p-6 space-y-5 bg-muted/30">
          {contractLoading ? (
            <>
              <div className="space-y-1">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </>
          ) : (
            <>
              <SidebarField label="ID" value={contract?.id} mono />
              <SidebarField label="Status" value={contract?.status} />
              <SidebarField
                label="Created"
                value={dateTime.format(new Date(contract?.createdAt || ""))}
              />
              <SidebarField
                label="Updated"
                value={dateTime.format(new Date(contract?.updatedAt || ""))}
              />
              <SidebarUser
                label="Requester"
                user={
                  contract?.requester
                    ? {
                        id: contract.requester.id,
                        name: contract.requester.name,
                        image: contract.requester.image,
                      }
                    : undefined
                }
              />
              <SidebarUser
                label="Assignee"
                user={
                  contract?.assignee
                    ? {
                        id: contract.assignee.id,
                        name: contract.assignee.name,
                        image: contract.assignee.image,
                      }
                    : undefined
                }
              />
            </>
          )}
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
