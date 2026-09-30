import type { ToastVariant } from "./toast-context";

interface ToastProps {
  title: string;
  description?: string;
  variant: ToastVariant;
  onDismiss: () => void;
}

const variantClasses: Record<ToastVariant, string> = {
  info: "border-slate-200 bg-slate-50 text-slate-900",
  success: "border-red-200 bg-red-50 text-red-900",
  danger: "border-red-200 bg-red-50 text-red-900",
};

export function Toast({ title, description, variant, onDismiss }: ToastProps) {
  return (
    <div
      role="status"
      className={[
        "w-80 rounded-md border p-4 shadow-md",
        variantClasses[variant],
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{title}</p>
          {description ? (
            <p className="mt-1 text-sm opacity-90">{description}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="text-sm opacity-60 hover:opacity-100"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
