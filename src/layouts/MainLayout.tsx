import Sidebar from "../components/Sidebar/Sidebar";
import Home from "../pages/Home";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex">

      <Sidebar />

      <main className="flex-1 p-8">

        <Home />

      </main>

    </div>
  );
}