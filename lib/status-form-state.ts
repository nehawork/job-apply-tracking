import type { ApplicationStatus } from "@/lib/types";

export type StatusFormState = {
  success: boolean;
  message: string;
  fieldErrors: {
    status?: string;
    reason?: string;
  };
  values: {
    applicationId: string;
    status: ApplicationStatus;
    reason: string;
  };
};

export const initialStatusFormState: StatusFormState = {
  success: false,
  message: "",
  fieldErrors: {},
  values: {
    applicationId: "",
    status: "Created",
    reason: ""
  }
};
