import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

export default function useTailoredCount() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [count, setCount] = useState();
  const { getToken } = useAuth();
  const appUrl = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    const getTailoredCount = async () => {
      setError(false);
      setLoading(true);

      try {
        const token = await getToken();
        const response = await fetch(`${appUrl}/tailoring/count`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setError(true);
          return;
        }

        const data = await response.json();
        setCount(data.count);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    getTailoredCount();
  }, [getToken, appUrl]);

  return { count, loading, error };
}
