import type { ThHTMLAttributes } from "react";

export function TableHeaderCell({ className = "", ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 font-sans ${className}`}
      {...props}
    />
  );
}
