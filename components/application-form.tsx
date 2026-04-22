"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { submitApplication } from "@/app/actions";
import { initialFormState } from "@/lib/form-state";
import { Modal } from "@/components/modal";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="error">{message}</p>;
}

export function ApplicationForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useFormState(submitApplication, initialFormState);
  const [status, setStatus] = useState(initialFormState.values.status);

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
      <button className="submit-button" type="button" onClick={() => setIsOpen(true)}>
        Add application
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add application"
        description="Create a job application entry and capture the current hiring status."
      >
        <form action={formAction} className="modal-form">
          <div className="form-grid">
            <div className="field">
              <label htmlFor="companyName">Company name</label>
              <input id="companyName" name="companyName" defaultValue={state.values.companyName} />
              <FieldError message={state.fieldErrors.companyName} />
            </div>

            <div className="field">
              <label htmlFor="position">Position</label>
              <input id="position" name="position" defaultValue={state.values.position} />
              <FieldError message={state.fieldErrors.position} />
            </div>

            <div className="field-full">
              <label htmlFor="jobDescription">Job description</label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                defaultValue={state.values.jobDescription}
              />
              <FieldError message={state.fieldErrors.jobDescription} />
            </div>

            <div className="field">
              <label htmlFor="contactEmail">Contact email</label>
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                defaultValue={state.values.contactEmail}
              />
              <FieldError message={state.fieldErrors.contactEmail} />
            </div>

            <div className="field">
              <label htmlFor="contactNo">Contact no</label>
              <input id="contactNo" name="contactNo" defaultValue={state.values.contactNo} />
              <FieldError message={state.fieldErrors.contactNo} />
            </div>

            <div className="field-full">
              <label htmlFor="address">Address</label>
              <textarea id="address" name="address" defaultValue={state.values.address} />
              <FieldError message={state.fieldErrors.address} />
            </div>

            <div className="field">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={status}
                onChange={(event) => setStatus(event.target.value as typeof status)}
              >
                <option value="Applied">Applied</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>
              <FieldError message={state.fieldErrors.status} />
            </div>

            <div className="field-full">
              <label htmlFor="reason">
                Reason {reasonRequired ? "(required for Selected/Rejected)" : "(optional)"}
              </label>
              <textarea id="reason" name="reason" defaultValue={state.values.reason} />
              <p className="hint">Maximum 1000 words.</p>
              <FieldError message={state.fieldErrors.reason} />
            </div>
          </div>

          <div className="actions">
            <SubmitButton />
          </div>

          {state.message ? <p className="feedback">{state.message}</p> : null}
        </form>
      </Modal>
    </>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="submit-button" type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save application"}
    </button>
  );
}
