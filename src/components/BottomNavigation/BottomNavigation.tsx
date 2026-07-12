import {
  CircleDollarSign,
  CreditCard,
  House,
  Settings,
  Target,
  Wallet,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const navigationItems = [
  {
    text: "Início",
    to: "/",
    icon: House,
  },
  {
    text: "Movimentos",
    to: "/transactions",
    icon: Wallet,
  },
  {
    text: "Contas",
    to: "/accounts",
    icon: CreditCard,
  },
  {
    text: "Dívidas",
    to: "/debts",
    icon: CircleDollarSign,
  },
  {
    text: "Objetivos",
    to: "/goals",
    icon: Target,
  },
  {
    text: "Ajustes",
    to: "/settings",
    icon: Settings,
  },
];

export default function BottomNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-6">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-3 text-[10px] transition ${
                  isActive
                    ? "text-emerald-400"
                    : "text-slate-400 hover:text-white"
                }`
              }
            >
              <Icon size={20} />

              <span className="w-full truncate text-center">
                {item.text}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}