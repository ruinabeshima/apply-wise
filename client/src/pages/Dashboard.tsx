import ApplicationList from "../components/ApplicationList";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col gap-5 w-full">
      <Navbar />
      <ApplicationList />
    </div>
  );
}
