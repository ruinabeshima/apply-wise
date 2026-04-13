import { useState, useEffect, useCallback } from "react";
import type { NewResumeResponse, ResumeSuggestions } from "@apply-wise/shared";
import useApiClient from "../lib/useApiClient";
import { useNavigate } from "react-router-dom";

type ResumeSuggestionFlowProps = {
  sessionId: string;
  suggestions: ResumeSuggestions;
  onTailoringLoadingChange?: (loading: boolean) => void;
};

export default function useResumeSuggestionFlow({
  sessionId,
  suggestions,
  onTailoringLoadingChange,
}: ResumeSuggestionFlowProps) {
  const api = useApiClient();
  const navigate = useNavigate();

  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<string[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>(
    [],
  );
  const [submitted, setSubmitted] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [resumeName, setResumeName] = useState("");
  const [resumeNameSnapshot, setResumeNameSnapshot] = useState<string | null>(
    null,
  );

  const total =
    suggestions.miss.length +
    suggestions.improve.length +
    suggestions.add.length +
    suggestions.weak.length;
  const remaining = total - hidden.size;

  // Notify when there are no more suggestions
  useEffect(() => {
    if (total !== 0) return;
    onTailoringLoadingChange?.(false);
  }, [total, onTailoringLoadingChange]);

  // Submit suggestions
  useEffect(() => {
    if (submitted || loading || error) return;
    if (total === 0) return;
    if (remaining !== 0) return;

    const submitSuggestions = async () => {
      const normalizedResumeName = resumeName.trim();
      setResumeNameSnapshot(
        normalizedResumeName.length > 0 ? normalizedResumeName : null,
      );
      setLoading(true);
      try {
        await api.patch(`/feedback/update/${sessionId}`, {
          acceptedSuggestions,
          dismissedSuggestions,
        });
        setSubmitted(true);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to submit suggestions",
        );
        onTailoringLoadingChange?.(false);
      } finally {
        setLoading(false);
      }
    };

    submitSuggestions();
  }, [
    submitted,
    loading,
    error,
    total,
    remaining,
    resumeName,
    sessionId,
    acceptedSuggestions,
    dismissedSuggestions,
    onTailoringLoadingChange,
    api,
  ]);

  // Generate new resume
  useEffect(() => {
    if (!submitted || loading || error || generated) {
      return;
    }

    const getTailoredResume = async () => {
      setLoading(true);
      try {
        const data: NewResumeResponse = await api.post(
          `/feedback/generate/${sessionId}`,
          {
            resumeName: resumeNameSnapshot ?? null,
          },
        );

        setGenerated(true);
        onTailoringLoadingChange?.(false);
        navigate(
          `/applications/${data.applicationId}/tailored/${data.tailoredResumeId}`,
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to generate new resume",
        );
        onTailoringLoadingChange?.(false);
      } finally {
        setLoading(false);
      }
    };

    getTailoredResume();
  }, [
    submitted,
    loading,
    error,
    navigate,
    generated,
    resumeNameSnapshot,
    sessionId,
    onTailoringLoadingChange,
    api,
  ]);

  const handleAcceptSuggestion = useCallback(
    (key: string, event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      // States have to immutable
      setHidden((prev) => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });
      setAcceptedSuggestions((prev) => [...prev, key]);
    },
    [],
  );

  const handleRejectSuggestion = useCallback(
    (key: string, event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      // States have to be immutable
      setHidden((prev) => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });
      setDismissedSuggestions((prev) => [...prev, key]);
    },
    [],
  );

  const loadingLabel = submitted
    ? "Generating your tailored resume..."
    : "Saving your selections...";

  return {
    hidden,
    resumeName,
    setResumeName,
    loading,
    error,
    loadingLabel,
    total,
    remaining,
    acceptedCount: acceptedSuggestions.length,
    dismissedCount: dismissedSuggestions.length,
    handleAcceptSuggestion,
    handleRejectSuggestion,
  };
}
