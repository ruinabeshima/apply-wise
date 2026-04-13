import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { OnboardingStatusResponse } from "@apply-wise/shared";
import useApiClient from "../lib/useApiClient";

type UseOnboardingStatusOptions = {
  redirectIfComplete?: boolean;
  redirectIfIncomplete?: boolean;
};

// Fetches user's onboarding status
export default function useOnboardingStatus({
  redirectIfComplete = false,
  redirectIfIncomplete = true,
}: UseOnboardingStatusOptions = {}) {
  const navigate = useNavigate();
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState(
    "Checking your onboarding status...",
  );
  const api = useApiClient();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      setLoading(true);

      try {
        const data: OnboardingStatusResponse = await api.get("/auth/status");
        if (!data.onboardingComplete && redirectIfIncomplete) {
          navigate("/onboarding");
        }

        if (data.onboardingComplete && redirectIfComplete) {
          navigate("/dashboard");
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to get onboarding status",
        );
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [navigate, api, redirectIfComplete, redirectIfIncomplete]);

  const updateOnboarding = async () => {
    setLoading(true);
    setLoadingMessage("Updating your onboarding status ...");

    try {
      await api.patch("/auth/status");
      navigate("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update onboarding status",
      );
    } finally {
      setLoading(false);
    }
  };

  return { updateOnboarding, loading, error, loadingMessage };
}
