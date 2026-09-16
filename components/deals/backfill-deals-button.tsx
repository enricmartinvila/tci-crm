"use client";

import { useState } from "react";
import { toast } from "sonner";
import { backfillMissingDeals } from "@/lib/actions/crm";
import { Button } from "@/components/ui/button";

export function BackfillDealsButton({
  missingCount,
}: {
  missingCount: number;
}) {
  const [pending, setPending] = useState(false);

  if (missingCount <= 0) return null;

  async function onClick() {
    setPending(true);
    const result = await backfillMissingDeals();
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(
      result.created === 1
        ? "1 deal creado"
        : `${result.created} deals creados`
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={onClick}
    >
      {pending
        ? "Creando…"
        : `Crear deals faltantes (${missingCount})`}
    </Button>
  );
}
