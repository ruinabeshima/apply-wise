import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import type { TypeResumeSuggestions } from "../components/resumes/ResumeSuggestions";

export default function useTailoredStatus(applicationId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [status, setStatus] = useState<null | string>(null);
  const [suggestions, setSuggestions] =
    useState<null | TypeResumeSuggestions>();
  const [tailoredKey, setTailoredKey] = useState<null | string>(null);
  const { getToken } = useAuth();
  const appUrl = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    const getTailoredStatus = async () => {
      try {
        const token = await getToken();
        const response = await fetch(
          `${appUrl}/tailored/status/${applicationId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message);
          return;
        }

        const data = await response.json();
        if (data.status === "NONE") {
          setStatus(data.status);
          return;
        }

        if (data.status === "PENDING" || data.status === "REVIEWED") {
          setStatus(data.status);
          setSuggestions(data.suggestions);
          return;
        }

        if (data.status === "TAILORED") {
          setStatus(data.status);
          setTailoredKey(data.key);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    getTailoredStatus();
  }, [appUrl, applicationId, getToken]);

  return { loading, error, status, suggestions, tailoredKey };
}
