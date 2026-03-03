import NavBar from "./navbar";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

interface Application {
  role: string;
  company: string;
  status: string;
  appliedDate: string;
  notes: string | null;
  jobUrl: string | null;
}

export default function Dashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState("");
  const { getToken } = useAuth();

  useEffect(() => {
    const appUrl = import.meta.env.VITE_SERVER_URL;

    const getApplications = async () => {
      try {
        const token = await getToken();
        const response = await fetch(`${appUrl}/applications`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to retrieve applications",
          );
        }

        const data: Application[] = await response.json();
        console.log(data);
        setApplications(data);
      } catch (error: any) {
        console.error(error.message);
        setError(error.message);
      }
    };

    getApplications();
  }, [getToken]);

  return (
    <div className="flex min-h-screen flex-col gap-5 w-full">
      <NavBar />
    </div>
  );
}
