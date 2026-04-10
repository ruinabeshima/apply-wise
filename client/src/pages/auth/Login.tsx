import Navbar from "../../components/Navbar";
import LoginForm from "../../features/auth/LoginForm";

export default function Login() {
  return (
    <div className="flex min-h-screen flex-col gap-15 items-center">
      <div className="fixed inset-0 bg-linear-to-b from-base-200/85 via-base-200/70 to-base-200/90 -z-10" />
      <Navbar />
      <LoginForm />
    </div>
  );
}
