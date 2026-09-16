import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Deal } from "@/lib/types";
import { normalizeDealStage } from "@/lib/constants";
import { DealsViews } from "@/components/deals/deals-views";
import { DealsFilters } from "@/components/deals/deals-filters";

type SearchParams = Promise<{
  q?: string;
  stage?: string;
  priority?: string;
  sort?: string;
}>;

export default async function DealsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("deals").select("*, companies(id, name)");

  if (params.priority) query = query.eq("priority", params.priority);

  const sort = params.sort || "updated_desc";
  if (sort === "name_asc") query = query.order("name", { ascending: true });
  else if (sort === "name_desc")
    query = query.order("name", { ascending: false });
  else if (sort === "priority_asc")
    query = query.order("priority", { ascending: true });
  else if (sort === "value_desc")
    query = query.order("value", { ascending: false, nullsFirst: false });
  else if (sort === "followup_asc")
    query = query.order("next_followup", {
      ascending: true,
      nullsFirst: false,
    });
  else query = query.order("updated_at", { ascending: false });

  const { data, error } = await query;
  let deals = (data || []) as Deal[];

  if (params.stage) {
    deals = deals.filter(
      (d) => normalizeDealStage(d.stage) === params.stage
    );
  }

  if (params.q) {
    const q = params.q.trim().toLowerCase();
    deals = deals.filter((d) => {
      const company = Array.isArray(d.companies)
        ? d.companies[0]
        : d.companies;
      return (
        d.name.toLowerCase().includes(q) ||
        (company?.name || "").toLowerCase().includes(q) ||
        (d.next_action || "").toLowerCase().includes(q)
      );
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          Deals
        </h1>
        <p className="text-sm text-muted-foreground">
          {deals.length} deal{deals.length === 1 ? "" : "s"}
          {error ? ` · Error: ${error.message}` : ""}
        </p>
      </div>
      <Suspense>
        <DealsFilters />
      </Suspense>
      <DealsViews deals={deals} />
    </div>
  );
}
