import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import BottomNavigation from "../components/BottomNavigation/BottomNavigation";
import Sidebar from "../components/Sidebar/Sidebar";

import Accounts from "../pages/Accounts";
import Dashboard from "../pages/Dashboard";
import Debts from "../pages/Debts";
import Goals from "../pages/Goals";
import Playground from "../pages/Playground";
import Settings from "../pages/Settings";
import Transactions from "../pages/Transactions";

import {
  FinToastProvider,
} from "../finui/Toast";

export default function App() {
  return (
    <FinToastProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/playground"
            element={<Playground />}
          />

          <Route
            path="*"
            element={<FinControlLayout />}
          />
        </Routes>
      </BrowserRouter>
    </FinToastProvider>
  );
}

function FinControlLayout() {
  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-x-hidden px-4 pb-28 pt-5 sm:px-6 md:p-8">
        <div className="mx-auto w-full max-w-7xl">
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
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}