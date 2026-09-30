import type { ReactNode } from "react";
import { Link } from "react-router";
import { Card } from "../../shared/ui/Card";

interface SummaryCardProps {
  title: string;
  value: ReactNode;
  linkTo?: string;
  linkLabel?: string;
  icon?: ReactNode;
  trend?: ReactNode;
}

export function SummaryCard({
  title,
  value,
  linkTo,
  linkLabel,
  icon,
  trend,
}: SummaryCardProps) {
  return (
    <Card className="flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {title}
        </p>
        {icon ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-900">
            {icon}
          </span>
        ) : null}
      </div>

      <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>

      <div className="flex items-center justify-between">
        {trend ? (
          <span className="flex items-center gap-1 text-xs font-medium text-slate-700">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 17l9.293-9.293M17 17V7H7" />
            </svg>
            {trend}
          </span>
        ) : <span />}

        {linkTo ? (
          <Link
            to={linkTo}
            className="text-xs font-medium text-red-600 hover:underline"
          >
            {linkLabel ?? "View"}
          </Link>
        ) : null}
      </div>
    </Card>
  );
}
