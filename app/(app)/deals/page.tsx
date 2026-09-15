import { createClient } from "@/lib/supabase/server";
import type { Deal } from "@/lib/types";
import { DealsViews } from "@/components/deals/deals-views";

export default async function DealsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deals")
    .select("*, companies(id, name)")
    .order("updated_at", { ascending: false });

  const deals = (data || []) as Deal[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Deals</h1>
        <p className="text-sm text-muted-foreground">
          {deals.length} deal{deals.length === 1 ? "" : "s"}
          {error ? ` · Error: ${error.message}` : ""}
        </p>
      </div>
      <DealsViews deals={deals} />
    </div>
  );
}
