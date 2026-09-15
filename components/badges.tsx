import { Badge } from "@/components/ui/badge";
import { priorityBadgeClass, stageBadgeClass } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function PriorityBadge({
  priority,
}: {
  priority: string | null | undefined;
}) {
  if (!priority) return <span className="text-muted-foreground">—</span>;
  return (
    <Badge className={cn("border-0", priorityBadgeClass(priority))}>
      {priority}
    </Badge>
  );
}

export function StageBadge({ stage }: { stage: string | null | undefined }) {
  if (!stage) return <span className="text-muted-foreground">—</span>;
  return (
    <Badge className={cn("border-0", stageBadgeClass(stage))}>{stage}</Badge>
  );
}

export function StatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  return (
    <Badge className={cn("border-0", stageBadgeClass(status))}>{status}</Badge>
  );
}
