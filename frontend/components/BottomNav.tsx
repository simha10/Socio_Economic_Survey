"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { LogOut } from "lucide-react";

const navItems = [
  { href: "/surveyor/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/surveyor/slums", label: "Surveys", icon: "📝" },
  { href: "/surveyor/profile", label: "Profile", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 
        bg-slate-900 border-t border-slate-800 
        md:hidden z-40 
        backdrop-blur-sm
      `}
    >
      <div className="flex justify-between items-center h-20 px-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center 
                flex-1 h-20 py-2 px-2
                text-xs font-medium transition-all duration-200
                ${
                  isActive
                    ? "text-cyan-400 border-t-2 border-cyan-500 bg-slate-800/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/20"
                }
              `}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          );
        })}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center flex-1 h-20 py-2 px-2 text-xs font-medium text-slate-400 hover:text-red-400 transition-all duration-200 hover:bg-slate-800/20"
        >
          <LogOut className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
}
