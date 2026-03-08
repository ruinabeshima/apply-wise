import Navbar from "../components/Navbar";

export default function UserResume() {
  return (
    <div className="w-full min-h-screen flex flex-col gap-5">
      <Navbar />
      <h1 className="font-bold text-5xl">Your Resume</h1>
    </div>
  );
}
