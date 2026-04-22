import type { Filters } from "@/lib/types";

export function FilterBar({ filters }: { filters: Filters }) {
  return (
    <form className="filter-bar" method="get">
      <div className="filter-field">
        <label htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={filters.status}>
          <option value="All">All statuses</option>
          <option value="Applied">Applied</option>
          <option value="Selected">Selected</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="companyName">Company</label>
        <input
          id="companyName"
          name="companyName"
          placeholder="Search company"
          defaultValue={filters.companyName}
        />
      </div>

      <div className="filter-field">
        <label htmlFor="createdAt">Created at</label>
        <input id="createdAt" name="createdAt" type="date" defaultValue={filters.createdAt} />
      </div>

      <div className="filter-actions">
        <button id="applyFilters" className="filter-button" type="submit">
          Apply filters
        </button>
        <a id="resetFilters" className="ghost-button filter-link" href="/">
          Reset filters
        </a>
      </div>
    </form>
  );
}
