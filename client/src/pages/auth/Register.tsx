import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      const token = await cred.user.getIdToken();
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/sync`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Sync failed");

      navigate("/onboarding");
    } catch {
      setError("Registration failed. Try a stronger password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);

      const token = await cred.user.getIdToken();
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/sync`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Sync failed");

      navigate("/onboarding");
    } catch {
      setError("Google sign-up failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col gap-15 items-center">
      <div className="fixed inset-0 bg-linear-to-b from-base-200/85 via-base-200/70 to-base-200/90 -z-10" />
      <Navbar />
      <form
        className="card w-full max-w-md bg-base-100 flex flex-col p-6 gap-5"
        onSubmit={handleEmailRegister}
      >
        <h2 className="text-xl font-semibold">Create your account</h2>

        <section>
          <input
            className="input input-bordered w-full mt-4"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            className="input input-bordered w-full mt-3"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <input
            className="input input-bordered w-full mt-3"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </section>

        <section className="flex flex-col gap-6">
          <button className="btn btn-primary mt-4" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>

          <div className="flex items-center gap-3">
            <hr className="flex-1 border-[#e5e5e5]" />
            <span className="text-sm text-gray-400">or</span>
            <hr className="flex-1 border-[#e5e5e5]" />
          </div>

          <button
            type="button"
            className="btn bg-white text-black border-[#e5e5e5]"
            onClick={handleGoogleRegister}
            disabled={loading}
          >
            <svg
              aria-label="Google logo"
              width="16"
              height="16"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <g>
                <path d="m0 0H512V512H0" fill="#fff"></path>
                <path
                  fill="#34a853"
                  d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
                ></path>
                <path
                  fill="#4285f4"
                  d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
                ></path>
                <path
                  fill="#fbbc02"
                  d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
                ></path>
                <path
                  fill="#ea4335"
                  d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
                ></path>
              </g>
            </svg>
            Register with Google
          </button>
        </section>
        {error && <p className="text-sm text-error mt-2">{error}</p>}
        <p className="text-sm mt-3">
          Already have an account?{" "}
          <Link className="link" to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
