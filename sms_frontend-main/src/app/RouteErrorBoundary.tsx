import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router";

export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = "Something went wrong";
  let message = "An unexpected error occurred. Please try again.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "Page not found";
      message = "The page you're looking for doesn't exist or has been moved.";
    } else if (error.status === 403) {
      title = "Access denied";
      message = "You don't have permission to view this page.";
    } else if (error.status === 401) {
      title = "Session expired";
      message = "Please log in again to continue.";
    } else {
      message = error.data?.message ?? message;
    }
  } else if (error instanceof Error) {
    // Don't expose raw stack traces to users — just show a friendly message
    console.error("[RouteErrorBoundary]", error);
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-8 text-center">
      {/* Icon */}
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <svg
          className="h-7 w-7 text-slate-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
        </svg>
      </div>

      <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">{message}</p>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Go back
        </button>
        <button
          type="button"
          onClick={() => navigate("/app")}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
