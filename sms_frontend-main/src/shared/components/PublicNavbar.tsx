import { useNavigate } from "react-router";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/#products" },
  { name: "Integration", href: "/#integration" },
  { name: "API Docs", href: "/docs" },
  { name: "Pricing", href: "/#pricing" },
];

interface PublicNavbarProps {
  showAuthButtons?: boolean;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
}

export function PublicNavbar({
  showAuthButtons = true,
  onLoginClick,
  onSignupClick,
}: PublicNavbarProps) {
  const navigate = useNavigate();
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    if (href === "/") {
      navigate("/");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (href.startsWith("/#")) {
      // If on landing page, scroll to section
      if (window.location.pathname === "/") {
        const element = document.querySelector(href.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // If on another page, navigate to landing page with hash
        navigate(href);
      }
    } else {
      // External routes (like /docs)
      navigate(href);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-6 bg-white/95 px-6 py-5 backdrop-blur-sm lg:px-10">
      <a
        href="/"
        onClick={(e) => {
          e.preventDefault();
          navigate("/");
        }}
        className="flex items-center gap-1 text-2xl font-bold text-slate-900 hover:opacity-80 transition-opacity"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-[rgba(200,16,46)] text-lg text-[rgba(200,16,46)]">
          N
        </span>
        otify
      </a>

      <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 lg:flex">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            onClick={(e) => handleNavClick(e, link.href)}
            className="transition-colors hover:text-[rgba(200,16,46)]"
          >
            {link.name}
          </a>
        ))}
      </nav>

      {showAuthButtons && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onLoginClick}
            className="rounded-lg border border-[rgba(200,16,46)] px-5 py-2.5 text-sm font-semibold text-[rgba(200,16,46)] transition-colors hover:bg-red-50"
          >
            Log In
          </button>
          <button
            type="button"
            onClick={onSignupClick}
            className="rounded-lg bg-[rgba(200,16,46)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[rgba(180,14,41)]"
          >
            Sign Up
          </button>
        </div>
      )}
    </header>
  );
}
