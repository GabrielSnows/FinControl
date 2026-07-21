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

import { FinToastProvider } from "../finui/Toast";

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
    <div className="relative flex min-h-screen overflow-hidden bg-black text-zinc-100">
      {/* Fundo somente para desktop */}
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        <div
          className="
            absolute
            left-1/2
            top-0
            h-225
            w-300
            -translate-x-1/2
            rounded-full
            opacity-80
            blur-3xl
          "
          style={{
            background:
              "radial-gradient(circle, rgba(39,39,42,0.45) 0%, rgba(24,24,27,0.18) 38%, rgba(0,0,0,0) 72%)",
          }}
        />
      </div>

      <Sidebar />

      <main className="relative z-10 min-w-0 flex-1 overflow-x-hidden bg-transparent px-4 pb-28 pt-5 sm:px-6 sm:pt-6 md:px-8 md:pb-8 md:pt-8">
        <div className="mx-auto w-full max-w-6xl">
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