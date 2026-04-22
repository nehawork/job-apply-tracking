import type { FormValues } from "@/lib/validation";

export type FormState = {
  success: boolean;
  message: string;
  fieldErrors: Partial<Record<keyof FormValues, string>>;
  values: FormValues;
};

export const initialFormValues: FormValues = {
  companyName: "",
  position: "",
  jobDescription: "",
  contactEmail: "",
  contactNo: "",
  address: "",
  status: "Created",
  reason: ""
};

export const initialFormState: FormState = {
  success: false,
  message: "",
  fieldErrors: {},
  values: initialFormValues
};
