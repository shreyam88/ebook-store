import { useState, useEffect } from "react";

function Navbar({
  currentPage,
  setCurrentPage,
  selectedBookId,
  setSelectedBookId,
  authPage,
  setAuthPage,
  user,
  onLogout,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile menu on window resize above 768px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleHomeClick = (e) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    setSelectedBookId(null);
    setAuthPage(null);
    setCurrentPage("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBooksClick = (e) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    setSelectedBookId(null);
    setAuthPage(null);

    if (currentPage !== "home") {
      setCurrentPage("home");
      setTimeout(() => {
        const booksEl = document.getElementById("books");
        if (booksEl) {
          booksEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const booksEl = document.getElementById("books");
      if (booksEl) {
        booksEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleLibraryClick = (e) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    setSelectedBookId(null);
    setAuthPage(null);
    setCurrentPage("library");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAdminClick = (e) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    setSelectedBookId(null);
    setAuthPage(null);
    setCurrentPage("admin");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoginClick = () => {
    setMobileMenuOpen(false);
    setSelectedBookId(null);
    setAuthPage("login");
  };

  const handleSignupClick = () => {
    setMobileMenuOpen(false);
    setSelectedBookId(null);
    setAuthPage("signup");
  };

  const handleLogoutClick = () => {
    setMobileMenuOpen(false);
    onLogout();
  };

  const isHomeActive = currentPage === "home" && !selectedBookId && !authPage;
  const isLibraryActive = currentPage === "library" && !selectedBookId && !authPage;
  const isAdminActive = currentPage === "admin" && !selectedBookId && !authPage;

  return (
    <header className="navbar-wrapper">
      <nav className="navbar" aria-label="Main Navigation">
        <div className="navbar-inner">
          {/* Brand Logo */}
          <a
            href="#home"
            className="logo"
            onClick={handleHomeClick}
            aria-label="E-Book Store Home"
          >
            <span className="logo-icon" role="img" aria-label="book">📚</span>
            <span className="logo-text">E-Book Store</span>
          </a>

          {/* Desktop Navigation Links */}
          <div className="nav-links">
            <a
              href="#home"
              className={isHomeActive ? "nav-link active" : "nav-link"}
              onClick={handleHomeClick}
            >
              Home
            </a>

            <a
              href="#books"
              className="nav-link"
              onClick={handleBooksClick}
            >
              Books
            </a>

            <a
              href="#library"
              className={isLibraryActive ? "nav-link active" : "nav-link"}
              onClick={handleLibraryClick}
            >
              My Library
            </a>

            {user?.role === "admin" && (
              <button
                type="button"
                className={`admin-nav-btn ${isAdminActive ? "active" : ""}`}
                onClick={handleAdminClick}
              >
                Admin
              </button>
            )}
          </div>

          {/* Navbar Actions (Right side) */}
          <div className="nav-actions">
            {user ? (
              <>
                {/* Desktop User Info & Logout */}
                <div className="nav-user-desktop">
                  {user.name && (
                    <span className="nav-user-name" title={user.email}>
                      👤 {user.name.split(" ")[0]}
                    </span>
                  )}
                  <button
                    type="button"
                    className="login-btn logout-btn"
                    onClick={handleLogoutClick}
                  >
                    Logout
                  </button>
                </div>

                {/* Mobile User Avatar Pill */}
                <div
                  className="nav-user-mobile-avatar"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  title={`${user.name || user.email} (Open Menu)`}
                >
                  {(user.name || user.email || "U")[0].toUpperCase()}
                </div>
              </>
            ) : (
              <button
                type="button"
                className="login-btn nav-quick-login"
                onClick={handleLoginClick}
              >
                Login
              </button>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              className={`hamburger-btn ${mobileMenuOpen ? "open" : ""}`}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-menu"
            >
              <span className="hamburger-line top"></span>
              <span className="hamburger-line mid"></span>
              <span className="hamburger-line bot"></span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div
          id="mobile-nav-menu"
          className={`mobile-menu-drawer ${mobileMenuOpen ? "open" : ""}`}
        >
          <div className="mobile-menu-links">
            <a
              href="#home"
              className={`mobile-nav-link ${isHomeActive ? "active" : ""}`}
              onClick={handleHomeClick}
            >
              <div className="mobile-nav-link-left">
                <span className="mobile-nav-icon">🏠</span>
                <span className="mobile-nav-text">Home</span>
              </div>
              <span className="mobile-nav-arrow">→</span>
            </a>

            <a
              href="#books"
              className="mobile-nav-link"
              onClick={handleBooksClick}
            >
              <div className="mobile-nav-link-left">
                <span className="mobile-nav-icon">📖</span>
                <span className="mobile-nav-text">Books</span>
              </div>
              <span className="mobile-nav-arrow">→</span>
            </a>

            <a
              href="#library"
              className={`mobile-nav-link ${isLibraryActive ? "active" : ""}`}
              onClick={handleLibraryClick}
            >
              <div className="mobile-nav-link-left">
                <span className="mobile-nav-icon">📚</span>
                <span className="mobile-nav-text">My Library</span>
              </div>
              <span className="mobile-nav-arrow">→</span>
            </a>

            {user?.role === "admin" && (
              <a
                href="#admin"
                className={`mobile-nav-link ${isAdminActive ? "active" : ""}`}
                onClick={handleAdminClick}
              >
                <div className="mobile-nav-link-left">
                  <span className="mobile-nav-icon">⚙️</span>
                  <span className="mobile-nav-text">Admin Dashboard</span>
                </div>
                <span className="mobile-nav-arrow">→</span>
              </a>
            )}
          </div>

          <div className="mobile-menu-divider"></div>

          {/* User profile / Auth in mobile drawer */}
          <div className="mobile-menu-footer">
            {user ? (
              <div className="mobile-user-profile">
                <div className="mobile-user-avatar">
                  {(user.name || user.email || "U")[0].toUpperCase()}
                </div>
                <div className="mobile-user-info">
                  <div className="mobile-user-name">
                    <span>{user.name || "Member"}</span>
                    {user.role === "admin" && (
                      <span className="mobile-role-pill">Admin</span>
                    )}
                  </div>
                  <div className="mobile-user-email">{user.email}</div>
                </div>
                <button
                  type="button"
                  className="mobile-logout-btn"
                  onClick={handleLogoutClick}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="mobile-auth-buttons">
                <button
                  type="button"
                  className="mobile-login-btn"
                  onClick={handleLoginClick}
                >
                  Login
                </button>
                <button
                  type="button"
                  className="mobile-signup-btn"
                  onClick={handleSignupClick}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Backdrop */}
        {mobileMenuOpen && (
          <div
            className="mobile-menu-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </nav>

      {/* Mobile Bottom Navigation Bar (Docked at bottom of phone screens) */}
      <div className="mobile-bottom-nav" aria-label="Mobile Navigation Bar">
        <button
          type="button"
          className={`mobile-bottom-item ${isHomeActive ? "active" : ""}`}
          onClick={handleHomeClick}
        >
          <span className="bottom-nav-icon">🏠</span>
          <span className="bottom-nav-label">Home</span>
        </button>

        <button
          type="button"
          className="mobile-bottom-item"
          onClick={handleBooksClick}
        >
          <span className="bottom-nav-icon">📖</span>
          <span className="bottom-nav-label">Books</span>
        </button>

        <button
          type="button"
          className={`mobile-bottom-item ${isLibraryActive ? "active" : ""}`}
          onClick={handleLibraryClick}
        >
          <span className="bottom-nav-icon">📚</span>
          <span className="bottom-nav-label">My Library</span>
        </button>

        {user?.role === "admin" ? (
          <button
            type="button"
            className={`mobile-bottom-item ${isAdminActive ? "active" : ""}`}
            onClick={handleAdminClick}
          >
            <span className="bottom-nav-icon">⚙️</span>
            <span className="bottom-nav-label">Admin</span>
          </button>
        ) : user ? (
          <button
            type="button"
            className="mobile-bottom-item"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            <span className="bottom-nav-avatar">
              {(user.name || user.email || "U")[0].toUpperCase()}
            </span>
            <span className="bottom-nav-label">{user.name ? user.name.split(" ")[0] : "Account"}</span>
          </button>
        ) : (
          <button
            type="button"
            className="mobile-bottom-item"
            onClick={handleLoginClick}
          >
            <span className="bottom-nav-icon">👤</span>
            <span className="bottom-nav-label">Login</span>
          </button>
        )}
      </div>
    </header>
  );
}

export default Navbar;
