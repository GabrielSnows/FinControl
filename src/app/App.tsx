import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Sidebar from "../components/Sidebar/Sidebar";

import Dashboard from "../pages/Dashboard";
import Transactions from "../pages/Transactions";
import Accounts from "../pages/Accounts";
import Debts from "../pages/Debts";
import Goals from "../pages/Goals";
import Settings from "../pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-900 text-white">
        <Sidebar />

        <main className="flex-1 p-8">
          <Routes>
            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/transactions"
              element={<Transactions />}
            />

            <Route
              path="/accounts"
              element={<Accounts />}
            />

            <Route
              path="/debts"
              element={<Debts />}
            />

            <Route
              path="/goals"
              element={<Goals />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}