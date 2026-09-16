import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Deal } from "@/lib/types";
import { DealsViews } from "@/components/deals/deals-views";
import { DealsFilters } from "@/components/deals/deals-filters";
import { BackfillDealsButton } from "@/components/deals/backfill-deals-button";

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
  if (params.stage) query = query.eq("stage", params.stage);

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

  const [{ data, error }, { data: allCompanies }, { data: dealCompanyIds }] =
    await Promise.all([
      query,
      supabase.from("companies").select("id"),
      supabase.from("deals").select("company_id"),
    ]);

  let deals = (data || []) as Deal[];

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

  const withDeal = new Set(
    (dealCompanyIds || []).map((d) => d.company_id).filter(Boolean)
  );
  const missingDeals = (allCompanies || []).filter(
    (c) => !withDeal.has(c.id)
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Deals
          </h1>
          <p className="text-sm text-muted-foreground">
            {deals.length} deal{deals.length === 1 ? "" : "s"}
            {missingDeals > 0
              ? ` · ${missingDeals} empresa${missingDeals === 1 ? "" : "s"} sin deal`
              : ""}
            {error ? ` · Error: ${error.message}` : ""}
          </p>
        </div>
        <BackfillDealsButton missingCount={missingDeals} />
      </div>
      <Suspense>
        <DealsFilters />
      </Suspense>
      <DealsViews deals={deals} />
    </div>
  );
}
