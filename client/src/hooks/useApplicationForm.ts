import { useEffect, useState } from "react";

type ApplicationFormProps = {
  isEdit?: boolean;
  role?: string;
  company?: string;
  status?: string;
  appliedDate?: string;
  notes?: string | null;
  jobUrl?: string | null;
};

export default function useApplicationForm(props: ApplicationFormProps) {
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState("APPLIED");
  const [appliedDate, setAppliedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [link, setLink] = useState("");

  useEffect(() => {
    const handleEditApplication = () => {
      if (!props.isEdit) return;

      setRole(props.role ?? "");
      setCompany(props.company ?? "");
      setStatus(props.status ?? "APPLIED");
      setAppliedDate(
        props.appliedDate
          ? new Date(props.appliedDate).toISOString().slice(0, 16)
          : "",
      );
      setNotes(props.notes ?? "");
      setLink(props.jobUrl ?? "");
    };

    handleEditApplication();
  }, [
    props.isEdit,
    props.role,
    props.company,
    props.status,
    props.appliedDate,
    props.notes,
    props.jobUrl,
  ]);

  const buildPayload = () => {
    const normalizedAppliedDate = appliedDate
      ? new Date(appliedDate).toISOString()
      : undefined;
    const normalizedNotes = notes.trim() ? notes.trim() : undefined;
    const normalizedJobUrl = link.trim() ? link.trim() : undefined;

    return {
      role,
      company,
      status: status.toUpperCase(),
      ...(normalizedAppliedDate ? { appliedDate: normalizedAppliedDate } : {}),
      ...(normalizedNotes ? { notes: normalizedNotes } : {}),
      ...(normalizedJobUrl ? { jobUrl: normalizedJobUrl } : {}),
    };
  };

  return {
    fields: { role, company, status, appliedDate, notes, link },
    setters: {
      setRole,
      setCompany,
      setStatus,
      setAppliedDate,
      setNotes,
      setLink,
    },
    buildPayload,
  };
}
