"use server";

import { revalidatePath } from "next/cache";
import {
  createApplication,
  deleteApplication as deleteApplicationRecord,
  updateApplicationStatus as updateApplicationStatusRecord
} from "@/lib/db";
import { initialFormState, type FormState } from "@/lib/form-state";
import {
  initialStatusFormState,
  type StatusFormState
} from "@/lib/status-form-state";
import { validateApplicationForm, validateStatusAndReason } from "@/lib/validation";

export async function submitApplication(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { fieldErrors, values } = validateApplicationForm(formData);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors,
      values
    };
  }

  await createApplication({
    ...values,
    reason: values.reason || null
  });

  revalidatePath("/");

  return {
    ...initialFormState,
    success: true,
    message: "Application saved."
  };
}

export async function updateApplicationStatus(
  _prevState: StatusFormState,
  formData: FormData
): Promise<StatusFormState> {
  const applicationId = String(formData.get("applicationId") ?? "").trim();
  const status = String(formData.get("status") ?? "Applied").trim() as StatusFormState["values"]["status"];
  const reason = String(formData.get("reason") ?? "").trim();
  const fieldErrors = validateStatusAndReason(status, reason);

  if (!applicationId) {
    return {
      ...initialStatusFormState,
      message: "Application id is missing.",
      fieldErrors,
      values: {
        applicationId,
        status,
        reason
      }
    };
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      message: "Please correct the status form.",
      fieldErrors,
      values: {
        applicationId,
        status,
        reason
      }
    };
  }

  await updateApplicationStatusRecord({
    id: Number(applicationId),
    status,
    reason: reason || null
  });

  revalidatePath("/");

  return {
    ...initialStatusFormState,
    success: true,
    message: "Status updated.",
    values: {
      applicationId,
      status,
      reason: reason || ""
    }
  };
}

export async function deleteApplication(formData: FormData) {
  const applicationId = String(formData.get("applicationId") ?? "").trim();

  if (!applicationId) {
    return;
  }

  await deleteApplicationRecord(Number(applicationId));
  revalidatePath("/");
}
