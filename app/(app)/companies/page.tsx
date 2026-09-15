import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Company } from "@/lib/types";
import { CreateCompanyDialog } from "@/components/companies/create-company-dialog";
import { CompaniesFilters } from "@/components/companies/companies-filters";
import { CompaniesTable } from "@/components/companies/companies-table";

type SearchParams = Promise<{
  q?: string;
  priority?: string;
  status?: string;
  sort?: string;
}>;

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("companies").select("*");

  if (params.q) {
    query = query.or(
      `name.ilike.%${params.q}%,category.ilike.%${params.q}%`
    );
  }
  if (params.priority) query = query.eq("priority", params.priority);
  if (params.status) query = query.eq("status", params.status);

  const sort = params.sort || "score_desc";
  if (sort === "name_asc") query = query.order("name", { ascending: true });
  else if (sort === "name_desc")
    query = query.order("name", { ascending: false });
  else if (sort === "score_asc")
    query = query.order("score", { ascending: true, nullsFirst: false });
  else if (sort === "priority_asc")
    query = query.order("priority", { ascending: true });
  else query = query.order("score", { ascending: false, nullsFirst: false });

  const { data, error } = await query;
  const companies = (data || []) as Company[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Companies
          </h1>
          <p className="text-sm text-muted-foreground">
            {companies.length} empresa{companies.length === 1 ? "" : "s"}
            {error ? ` · Error: ${error.message}` : ""}
          </p>
        </div>
        <CreateCompanyDialog />
      </div>
      <Suspense>
        <CompaniesFilters />
      </Suspense>
      <CompaniesTable companies={companies} />
    </div>
  );
}
