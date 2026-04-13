import { useState } from "react";
import useApiClient from "../lib/useApiClient";

export default function useStartTailoring(applicationId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const api = useApiClient();

  const startTailoring = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await api.post(`/feedback/${applicationId}`, {});
      return true;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to start tailoring session",
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { startTailoring, loading, error };
}
