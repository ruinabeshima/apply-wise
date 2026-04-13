export type ApplicationResponse = {
  id: string;
  role: string;
  company: string;
  status: "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
  appliedDate: Date;
  notes: string | null;
  jobUrl: string | null;
};

export type ApplicationsResponse = ApplicationResponse[];

export type FullApplicationResponse = {
  id: string;
  role: string;
  company: string;
  status: "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
  appliedDate: Date;
  notes: string | null;
  jobUrl: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthSyncResponse = {
  ok: boolean;
};

export type OnboardingStatusResponse = {
  onboardingComplete: boolean;
};

export type ResumeUrlResponse = {
  url: string;
};

export type TailoredResumeItem = {
  id: string;
  name: string;
  applicationId: string;
  createdAt: Date;
};

export type TailoredResumesResponse = {
  resumes: TailoredResumeItem[];
};

export type ResumeSuggestions = {
  miss: string[];
  improve: string[];
  add: string[];
  weak: string[];
};

export type TailoringStatusNoneResponse = {
  status: "NONE";
  message: string;
};

export type TailoringStatusPendingResponse = {
  status: "PENDING" | "REVIEWED";
  sessionId: string;
  suggestions: ResumeSuggestions;
};

export type TailoringStatusTailoredResponse = {
  status: "TAILORED";
  sessionId: string;
  tailoredResumeId: string;
};

export type TailoringStatusResponse =
  | TailoringStatusNoneResponse
  | TailoringStatusPendingResponse
  | TailoringStatusTailoredResponse;

export type RetrieveFeedbackResponse = {
  sessionId: string;
  suggestions: ResumeSuggestions;
  status: "PENDING";
};

export type SuggestionsUpdatedResponse = {
  message: string;
  status: string;
};

export type NewResumeResponse = {
  message: string;
  applicationId: string;
  tailoredResumeId: string;
  status: "TAILORED";
};

export type TailoringCountResponse = {
  count: number;
};
