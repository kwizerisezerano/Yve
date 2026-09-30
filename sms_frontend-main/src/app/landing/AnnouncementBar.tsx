export function AnnouncementBar() {
  return (
    <div className="flex items-center justify-between gap-4 bg-red-50 px-6 py-2.5 text-sm text-slate-700 lg:px-10">
      <div className="hidden items-center gap-6 md:flex">
        <span className="flex items-center gap-2">
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          +123 456 7890
        </span>
        <span className="flex items-center gap-2">
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-10 5L2 7" />
          </svg>
          Support@ingoga.com
        </span>
      </div>
      <p className="mx-auto text-center font-medium text-slate-800">
        Get free Access <span className="text-[rgba(180,14,41)]">Sandbox</span> On Sign
        Up
      </p>
      <div className="hidden items-center gap-6 md:flex">
        <a href="#about" className="hover:text-slate-900">
          About Us
        </a>
        <a href="#contact" className="hover:text-slate-900">
          Contact Us
        </a>
      </div>
    </div>
  );
}
