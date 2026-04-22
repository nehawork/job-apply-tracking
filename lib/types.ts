export type ApplicationStatus = "Created" | "Applied" | "Selected" | "Rejected";

export type JobApplication = {
  id: number;
  companyName: string;
  position: string;
  jobDescription: string;
  contactEmail: string;
  contactNo: string;
  address: string;
  status: ApplicationStatus;
  reason: string | null;
  createdAt: string;
};

export type Filters = {
  status: string;
  companyName: string;
  createdAt: string;
};
