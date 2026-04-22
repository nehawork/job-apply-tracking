import { ApplicationForm } from '@/components/application-form';
import { ApplicationList } from '@/components/application-list';
import { FilterBar } from '@/components/filter-bar';
import { listApplications } from '@/lib/db';
import type { Filters } from '@/lib/types';

function getFilterValue(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : '';
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const params = searchParams ?? {};
  const rawPage = Number(getFilterValue(params.page) || '1');
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const filters: Filters = {
    status: getFilterValue(params.status) || 'All',
    companyName: getFilterValue(params.companyName),
    createdAt: getFilterValue(params.createdAt),
  };

  const applications = await listApplications(filters, {
    page,
    pageSize: 10,
  });

  return (
    <main className='page-shell'>
      <section className='panel list-panel'>
        <div className='list-header'>
          <div>
            <h2 className='section-title'>Application pipeline</h2>
            <p className='section-copy'>
              Review applications, open full details, update outcomes, and
              filter by status, company, or creation date.
            </p>
          </div>
          <ApplicationForm />
        </div>

        <FilterBar filters={filters} />
        <ApplicationList
          applications={applications.items}
          currentPage={applications.page}
          totalPages={applications.totalPages}
          filters={filters}
        />
      </section>
    </main>
  );
}
