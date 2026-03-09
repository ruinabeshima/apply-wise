import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import ApplicationForm from "../components/ApplicationForm";

export default function EditApplication() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="flex flex-col gap-5 min-h-screen w-full items-center">
      <Navbar />

      <section className="relative flex justify-center w-full px-8 py-4">
        <Link to={`/applications/${id}`} className="absolute left-8 top-0">
          <button className="btn">← Back</button>
        </Link>
        <ApplicationForm />
      </section>
    </div>
  );
}
