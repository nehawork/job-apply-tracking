"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateApplicationStatus } from "@/app/actions";
import { Modal } from "@/components/modal";
import { initialStatusFormState } from "@/lib/status-form-state";
import type { JobApplication } from "@/lib/types";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="error">{message}</p>;
}

export function ApplicationStatusForm({
  application
}: {
  application: JobApplication;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useFormState(updateApplicationStatus, {
    ...initialStatusFormState,
    values: {
      applicationId: String(application.id),
      status: application.status,
      reason: application.reason ?? ""
    }
  });
  const [status, setStatus] = useState<JobApplication["status"]>(application.status);

  useEffect(() => {
    setStatus(state.values.status);
  }, [state.values.status]);

  useEffect(() => {
    if (state.success) {
      setIsOpen(false);
    }
  }, [state.success]);

  const reasonRequired = status === "Selected" || status === "Rejected";

  return (
    <>
      <button
        aria-label={`Update status for ${application.companyName}`}
        className="icon-button icon-button-accent"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <EditIcon />
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Update status for ${application.companyName}`}
        description="Change the current application outcome and capture a reason when required."
      >
        <form action={formAction} className="status-form">
          <input type="hidden" name="applicationId" value={application.id} />

          <div className="status-grid">
            <div className="field">
              <label htmlFor={`status-${application.id}`}>Status</label>
              <select
                id={`status-${application.id}`}
                name="status"
                value={status}
                onChange={(event) => setStatus(event.target.value as JobApplication["status"])}
              >
                <option value="Created">Created</option>
                <option value="Applied">Applied</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>
              <FieldError message={state.fieldErrors.status} />
            </div>

            <div className="field-full">
              <label htmlFor={`reason-${application.id}`}>
                Reason {reasonRequired ? "(required)" : "(optional)"}
              </label>
              <textarea
                id={`reason-${application.id}`}
                name="reason"
                defaultValue={state.values.reason}
                key={`${application.id}-${state.values.status}-${state.values.reason}`}
              />
              <p className="hint">Maximum 1000 words.</p>
              <FieldError message={state.fieldErrors.reason} />
            </div>
          </div>

          <div className="actions">
            <UpdateButton />
          </div>

          {state.message ? <p className="feedback">{state.message}</p> : null}
        </form>
      </Modal>
    </>
  );
}

function UpdateButton() {
  const { pending } = useFormStatus();

  return (
    <button className="secondary-button" type="submit" disabled={pending}>
      {pending ? "Updating..." : "Save status"}
    </button>
  );
}

function EditIcon() {
  return (
    <svg aria-hidden="true" className="action-icon" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 20h4l10-10-4-4L4 16v4Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="m13 7 4 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
