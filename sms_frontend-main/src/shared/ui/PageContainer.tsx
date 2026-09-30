import type { HTMLAttributes } from "react";

export function PageContainer({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["px-8 py-8", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
