import Navbar from "../components/Navbar";
import ApplicationForm from "../components/ApplicationForm";

export default function AddApplication() {
  return (
    <div className="flex flex-col gap-10 items-center">
      <Navbar />
      <ApplicationForm />
    </div>
  );
}
