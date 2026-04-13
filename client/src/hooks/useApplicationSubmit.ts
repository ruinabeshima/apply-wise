import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useApiClient from "../lib/useApiClient";

type ApplicationSubmitProps = {
  isEdit?: boolean;
  id?: string;
};

export default function useApplicationSubmit(props: ApplicationSubmitProps) {
  const api = useApiClient();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddSubmit = async (payload: object) => {
    setLoading(true);
    try {
      await api.post("/applications/add", payload);

      const { onboardingComplete } = await api.get<{
        onboardingComplete: boolean;
      }>("/auth/status");

      if (!onboardingComplete) {
        await api.patch("/auth/status");
      }

      navigate("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not create application",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (payload: object) => {
    setLoading(true);
    try {
      await api.put(`/applications/${props.id}`, payload);
      navigate(`/applications/${props.id}`);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not edit application",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent, payload: object) => {
    event.preventDefault();
    if (props.isEdit) {
      await handleEditSubmit(payload);
    } else {
      await handleAddSubmit(payload);
    }
  };

  return { loading, error, handleSubmit };
}
