import { Link } from "react-router-dom";
import { useState } from "react";
import useAuthFlow from "../../hooks/useAuthFlow";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { loading, error, handleEmailRegister, handleGoogleRegister } =
    useAuthFlow();

  return (
    <form
      className="card w-full max-w-md bg-base-100 flex flex-col p-6 gap-5"
      onSubmit={(event) =>
        handleEmailRegister(event, email, password, confirmPassword)
      }
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
  );
}
