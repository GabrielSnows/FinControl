import {
  CircleDollarSign,
  CreditCard,
  House,
  Settings,
  Target,
  Wallet,
} from "lucide-react";

import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-800 bg-slate-950 p-6 md:block">
      <h1 className="mb-10 text-2xl font-bold">
        FinControl
      </h1>

      <nav className="space-y-2">
        <MenuItem
          icon={<House size={20} />}
          text="Dashboard"
          to="/"
        />

        <MenuItem
          icon={<Wallet size={20} />}
          text="Movimentações"
          to="/transactions"
        />

        <MenuItem
          icon={<CreditCard size={20} />}
          text="Contas"
          to="/accounts"
        />

        <MenuItem
          icon={<CircleDollarSign size={20} />}
          text="Dívidas"
          to="/debts"
        />

        <MenuItem
          icon={<Target size={20} />}
          text="Objetivos"
          to="/goals"
        />

        <MenuItem
          icon={<Settings size={20} />}
          text="Configurações"
          to="/settings"
        />
      </nav>
    </aside>
  );
}

type MenuItemProps = {
  icon: React.ReactNode;
  text: string;
  to: string;
};

function MenuItem({
  icon,
  text,
  to,
}: MenuItemProps) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `flex w-full cursor-pointer items-center gap-3 rounded-xl p-3 transition ${
          isActive
            ? "bg-emerald-600 text-white"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`
      }
    >
      {icon}

      <span>{text}</span>
    </NavLink>
  );
}