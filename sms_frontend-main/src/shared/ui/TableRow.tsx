import type { HTMLAttributes } from "react";

export function TableRow({ className = "", ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`hover:bg-slate-50/70 transition-colors duration-150 ${className}`}
      {...props}
    />
  );
}
