"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteApplication } from "@/app/actions";
import { ApplicationStatusForm } from "@/components/application-status-form";
import { Modal } from "@/components/modal";
import type { Filters, JobApplication } from "@/lib/types";

function getBadgeClass(status: JobApplication["status"]) {
  switch (status) {
    case "Selected":
      return "badge badge-selected";
    case "Rejected":
      return "badge badge-rejected";
    default:
      return "badge badge-applied";
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function ApplicationList({
  applications,
  currentPage,
  totalPages,
  filters
}: {
  applications: JobApplication[];
  currentPage: number;
  totalPages: number;
  filters: Filters;
}) {
  const [activeApplication, setActiveApplication] = useState<JobApplication | null>(null);

  if (applications.length === 0) {
    return <div className="empty">No applications match the current filters.</div>;
  }

  return (
    <>
      <div className="cards">
        {applications.map((application) => (
          <article className="card" key={application.id}>
            <div className="card-top">
              <div>
                <h3>{application.companyName}</h3>
                <p>{application.position}</p>
              </div>
              <span className={getBadgeClass(application.status)}>{application.status}</span>
            </div>

            <div className="meta">
              <div>
                <strong>Email:</strong> {application.contactEmail}
              </div>
              <div>
                <strong>Contact no:</strong> {application.contactNo}
              </div>
              <div>
                <strong>Created:</strong> {formatDate(application.createdAt)}
              </div>
            </div>

            <div className="card-footer">
              <button
                aria-label={`View details for ${application.companyName}`}
                className="icon-button"
                type="button"
                onClick={() => setActiveApplication(application)}
              >
                <ViewIcon />
              </button>
              <ApplicationStatusForm application={application} />
              <DeleteApplicationButton applicationId={application.id} />
            </div>
          </article>
        ))}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} filters={filters} />

      <ApplicationDetailsModal
        application={activeApplication}
        onClose={() => setActiveApplication(null)}
      />
    </>
  );
}

function Pagination({
  currentPage,
  totalPages,
  filters
}: {
  currentPage: number;
  totalPages: number;
  filters: Filters;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="Application pagination" className="pagination">
      <PaginationLink
        className="ghost-button"
        disabled={currentPage <= 1}
        filters={filters}
        page={currentPage - 1}
      >
        Previous
      </PaginationLink>
      <span className="pagination-label">
        Page {currentPage} of {totalPages}
      </span>
      <PaginationLink
        className="ghost-button"
        disabled={currentPage >= totalPages}
        filters={filters}
        page={currentPage + 1}
      >
        Next
      </PaginationLink>
    </nav>
  );
}

function PaginationLink({
  page,
  filters,
  disabled,
  className,
  children
}: {
  page: number;
  filters: Filters;
  disabled: boolean;
  className: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span aria-disabled="true" className={`${className} pagination-disabled`}>
        {children}
      </span>
    );
  }

  const searchParams = new URLSearchParams();

  if (filters.status && filters.status !== "All") {
    searchParams.set("status", filters.status);
  }

  if (filters.companyName) {
    searchParams.set("companyName", filters.companyName);
  }

  if (filters.createdAt) {
    searchParams.set("createdAt", filters.createdAt);
  }

  searchParams.set("page", String(page));

  return (
    <a className={className} href={`/?${searchParams.toString()}`}>
      {children}
    </a>
  );
}

function ApplicationDetailsModal({
  application,
  onClose
}: {
  application: JobApplication | null;
  onClose: () => void;
}) {
  return (
    <Modal
      isOpen={Boolean(application)}
      onClose={onClose}
      title={application ? `${application.companyName} application` : "Application details"}
      description={application ? `${application.position} • ${application.status}` : undefined}
    >
      {application ? (
        <div className="details-grid">
          <div>
            <strong>Company name:</strong> {application.companyName}
          </div>
          <div>
            <strong>Position:</strong> {application.position}
          </div>
          <div>
            <strong>Status:</strong> {application.status}
          </div>
          <div>
            <strong>Contact email:</strong> {application.contactEmail}
          </div>
          <div>
            <strong>Contact no:</strong> {application.contactNo}
          </div>
          <div>
            <strong>Created:</strong> {formatDate(application.createdAt)}
          </div>
          <div className="detail-full">
            <strong>Address:</strong> {application.address}
          </div>
          <div className="detail-full">
            <strong>Job description:</strong> {application.jobDescription}
          </div>
          {application.reason ? (
            <div className="detail-full">
              <strong>Reason:</strong> {application.reason}
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}

function DeleteApplicationButton({ applicationId }: { applicationId: number }) {
  return (
    <form action={deleteApplication}>
      <input type="hidden" name="applicationId" value={applicationId} />
      <DeleteButton />
    </form>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      aria-label={pending ? "Deleting application" : "Delete application"}
      className="icon-button icon-button-danger"
      type="submit"
      disabled={pending}
    >
      <DeleteIcon />
    </button>
  );
}

function ViewIcon() {
  return (
    <svg aria-hidden="true" className="action-icon" viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg aria-hidden="true" className="action-icon" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7h16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M9 7V5h6v2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M7 7l1 12h8l1-12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M10 11v4M14 11v4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
