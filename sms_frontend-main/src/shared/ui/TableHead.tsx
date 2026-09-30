import type { HTMLAttributes } from "react";

export function TableHead({ className = "", ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={`bg-slate-50/80 border-b border-slate-200/80 ${className}`} {...props} />;
}
