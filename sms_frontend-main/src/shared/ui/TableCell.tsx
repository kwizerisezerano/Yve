import type { TdHTMLAttributes } from "react";

export function TableCell({ className = "", ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`px-6 py-4 text-sm text-slate-700 font-sans align-middle ${className}`}
      {...props}
    />
  );
}
