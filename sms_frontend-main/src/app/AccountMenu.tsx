import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useLogout } from "../features/auth/hooks/useLogout";

function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return initials || "U";
}

export function AccountMenu({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const logout = useLogout();

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 hover:bg-slate-50"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
          {getInitials(userName)}
        </span>
        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium text-slate-900">{userName}</p>
          <p className="flex items-center gap-1 text-xs text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Available
          </p>
        </div>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute top-full right-0 z-20 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-2 shadow-lg"
        >
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-semibold text-slate-900">
              Account
            </span>
            <Link
              to="/app/account"
              onClick={() => setOpen(false)}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Open
            </Link>
          </div>

          <div className="my-1 border-t border-slate-100" />

          <Link
            to="/app/account"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <svg
              className="h-4 w-4 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" />
              <path strokeLinecap="round" d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
            </svg>
            Profile & Settings
          </Link>

          <div className="my-1 border-t border-slate-100" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
