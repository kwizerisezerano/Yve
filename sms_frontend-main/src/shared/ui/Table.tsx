import type { TableHTMLAttributes } from "react";

export function Table({ className = "", ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-sm font-sans antialiased">
      <table className={`w-full border-collapse text-left text-sm ${className}`} {...props} />
    </div>
  );
}
