import {
  House,
  Wallet,
  CreditCard,
  Target,
  Settings,
} from "lucide-react";

import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 p-6">
      <h1 className="text-2xl font-bold mb-10">FinControl</h1>

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

function MenuItem({ icon, text, to }: MenuItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex w-full items-center gap-3 rounded-xl p-3 transition ${
          isActive
            ? "bg-blue-600 text-white"
            : "hover:bg-slate-800"
        }`
      }
    >
      {icon}
      <span>{text}</span>
    </NavLink>
  );
}