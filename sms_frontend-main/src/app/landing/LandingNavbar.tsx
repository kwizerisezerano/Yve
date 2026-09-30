const navLinks = [
  { name: "Home", href: "#" },
  { name: "Products", href: "#products" },
  { name: "Integration", href: "#integration" },
  { name: "Resources", href: "#resources" },
  { name: "Solution", href: "#solution" },
  { name: "Pricing", href: "#pricing" },
];

interface LandingNavbarProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export function LandingNavbar({
  onLoginClick,
  onSignupClick,
}: LandingNavbarProps) {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === "#") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    if (href.startsWith("#")) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-6 bg-white/95 px-6 py-5 backdrop-blur-sm lg:px-10">
      <div className="flex items-center gap-1 text-2xl font-bold text-slate-900">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-[rgba(200,16,46)] text-lg text-[rgba(200,16,46)]">
          IN
        </span>
        Message
      </div>

      <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 lg:flex">
        {navLinks.map((link, index) => (
          <a
            key={link.name}
            href={link.href}
            onClick={(e) => handleNavClick(e, link.href)}
            className={
              index === 0
                ? "text-[rgba(200,16,46)]"
                : "transition-colors hover:text-[rgba(200,16,46)]"
            }
          >
            {link.name}
          </a>
        ))}
      </nav>

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
    </header>
  );
}
