import type { ApplicationStatus } from "@/lib/types";

export type FormValues = {
  companyName: string;
  position: string;
  jobDescription: string;
  contactEmail: string;
  contactNo: string;
  address: string;
  status: ApplicationStatus;
  reason: string;
};

export type ValidationResult = {
  fieldErrors: Partial<Record<keyof FormValues, string>>;
  values: FormValues;
};

const REASON_REQUIRED_STATUSES = new Set<ApplicationStatus>(["Selected", "Rejected"]);

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function countWords(value: string) {
  if (!value.trim()) {
    return 0;
  }

  return value.trim().split(/\s+/).length;
}

export function validateStatusAndReason(status: ApplicationStatus, reason: string) {
  const fieldErrors: {
    status?: string;
    reason?: string;
  } = {};

  if (!["Applied", "Selected", "Rejected"].includes(status)) {
    fieldErrors.status = "Select a valid status.";
  }

  const wordCount = countWords(reason);
  if (REASON_REQUIRED_STATUSES.has(status) && !reason) {
    fieldErrors.reason = "Reason is required when the status is Selected or Rejected.";
  } else if (wordCount > 1000) {
    fieldErrors.reason = "Reason must be 1000 words or fewer.";
  }

  return fieldErrors;
}

export function validateApplicationForm(formData: FormData): ValidationResult {
  const values: FormValues = {
    companyName: normalizeText(formData.get("companyName")),
    position: normalizeText(formData.get("position")),
    jobDescription: normalizeText(formData.get("jobDescription")),
    contactEmail: normalizeText(formData.get("contactEmail")),
    contactNo: normalizeText(formData.get("contactNo")),
    address: normalizeText(formData.get("address")),
    status: (normalizeText(formData.get("status")) || "Applied") as ApplicationStatus,
    reason: normalizeText(formData.get("reason"))
  };

  const fieldErrors: ValidationResult["fieldErrors"] = {};

  if (!values.companyName) {
    fieldErrors.companyName = "Company name is required.";
  }

  if (!values.position) {
    fieldErrors.position = "Position is required.";
  }

  if (!values.jobDescription) {
    fieldErrors.jobDescription = "Job description is required.";
  }

  if (!values.contactEmail) {
    fieldErrors.contactEmail = "Contact email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail)) {
    fieldErrors.contactEmail = "Enter a valid email address.";
  }

  if (!values.contactNo) {
    fieldErrors.contactNo = "Contact number is required.";
  }

  if (!values.address) {
    fieldErrors.address = "Address is required.";
  }

  Object.assign(fieldErrors, validateStatusAndReason(values.status, values.reason));

  return {
    fieldErrors,
    values
  };
}
