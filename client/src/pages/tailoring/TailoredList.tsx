import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import Navbar from "../../components/navbar/Navbar";

export default function TailoredList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { getToken } = useAuth();
  const appUrl = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    const getTailoredResumes = async () => {
      try {
        const token = await getToken();
        const response = await fetch(`${appUrl}/resumes/tailored`, {
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
        console.log(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    getTailoredResumes();
  }, [getToken, appUrl]);

  return (
    <div className="flex flex-col gap-5 min-h-screen w-full">
      <Navbar />

      <main className="flex flex-col items-center gap-10">
        {loading ? (
          <span className="loading loading-spinner loading-xl"></span>
        ) : error ? (
          <div role="alert" className="alert alert-error w-4/5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>An error occured.</span>
          </div>
        ) : (
          <h1>Hello World</h1>
        )}
      </main>
    </div>
  );
}
