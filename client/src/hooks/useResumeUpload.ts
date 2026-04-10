import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useApiClient from "../lib/useApiClient";

type ResumeUploadProps = {
  isUpdate?: boolean;
  onSuccess?: () => void;
};

export default function useResumeUpload(props: ResumeUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [file, setFile] = useState<File | null>(null);
  const api = useApiClient();
  const navigate = useNavigate();

  const uploadFile = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file!);

      await api.post("/resumes/upload", formData);

      props.onSuccess?.();

      if (props.isUpdate) {
        navigate("/dashboard");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to upload file",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    if (selectedFile && selectedFile.type !== "application/pdf") {
      return;
    }
    setFile(selectedFile);
  };

  const handleFileRemove = () => {
    setFile(null);
  };

  return {
    file,
    loading,
    error,
    uploadFile,
    handleFileChange,
    handleFileRemove,
  };
}
