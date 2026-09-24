import { useEffect, useState } from "react";

import BookDetails from "./components/BookDetails";
import Login from "./components/Login";
import Signup from "./components/Signup";
import MyLibrary from "./components/MyLibrary";
import AdminDashboard from "./components/AdminDashboard";

import "./App.css";

function App() {
  const [books, setBooks] = useState([]);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

 const filteredBooks = books.filter((book) => {
  const search = searchTerm.toLowerCase().trim();

  const matchesSearch =
    book.title.toLowerCase().includes(search) ||
    book.author.toLowerCase().includes(search);

  const matchesCategory =
    selectedCategory === "All" ||
    (book.category || "Other") === selectedCategory;

  return matchesSearch && matchesCategory;
});

  const [selectedBookId, setSelectedBookId] = useState(null);

  const [authPage, setAuthPage] = useState(null);

  const [currentPage, setCurrentPage] = useState("home");

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const handleOpenLogin = () => {
      setAuthPage("login");
    };

    window.addEventListener("open-login", handleOpenLogin);

    return () => {
      window.removeEventListener(
        "open-login",
        handleOpenLogin
      );
    };
  }, []);

  // =========================
  // FETCH BOOKS
  // =========================

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/books"
        );

        const data = await response.json();

        const booksData = data.books || [];

        setBooks(booksData);

        const ratingResults = await Promise.all(
          booksData.map(async (book) => {
            try {
              const ratingResponse = await fetch(
                `http://localhost:5000/api/reviews/rating/${book._id}`
              );

              const ratingData =
                await ratingResponse.json();

              return {
                bookId: book._id,
                averageRating:
                  ratingData.averageRating || 0,
                totalReviews:
                  ratingData.totalReviews || 0,
              };
            } catch (error) {
              console.error(
                "Rating fetch error:",
                error
              );

              return {
                bookId: book._id,
                averageRating: 0,
                totalReviews: 0,
              };
            }
          })
        );

        const ratingMap = {};

        ratingResults.forEach((item) => {
          ratingMap[item.bookId] = {
            averageRating: item.averageRating,
            totalReviews: item.totalReviews,
          };
        });

        setRatings(ratingMap);
      } catch (error) {
        console.error(
          "Error fetching books:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // =========================
  // LOGIN
  // =========================

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setAuthPage(null);

    if (selectedBookId) {
      setCurrentPage("home");
    } else {
      setCurrentPage("home");
    }
  };

  // =========================
  // SIGNUP
  // =========================

  const handleSignup = () => {
    setAuthPage("login");
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setCurrentPage("home");
    setSelectedBookId(null);
  };

  // =========================
  // LOGIN PAGE
  // =========================

  if (authPage === "login") {
    return (
      <div className="app">
        <Login
          onLogin={handleLogin}
          onSwitchToSignup={() =>
            setAuthPage("signup")
          }
        />
      </div>
    );
  }

  // =========================
  // SIGNUP PAGE
  // =========================

  if (authPage === "signup") {
    return (
      <div className="app">
        <Signup
          onSignup={handleSignup}
          onSwitchToLogin={() =>
            setAuthPage("login")
          }
        />
      </div>
    );
  }

  // =========================
  // MY LIBRARY
  // =========================

  if (currentPage === "library") {
    return (
      <div className="app">
        <MyLibrary
          onBack={() =>
            setCurrentPage("home")
          }
          onViewBook={(bookId) => {
            setSelectedBookId(bookId);
            setCurrentPage("home");
          }}
        />
      </div>
    );
  }

  // =========================
  // ADMIN DASHBOARD
  // =========================

  if (currentPage === "admin") {
    return (
      <div className="app">
        <AdminDashboard
          onBack={() =>
            setCurrentPage("home")
          }
        />
      </div>
    );
  }

  // =========================
  // BOOK DETAILS
  // =========================

  if (selectedBookId) {
    return (
      <div className="app">
        <BookDetails
          bookId={selectedBookId}
          onBack={() =>
            setSelectedBookId(null)
          }
        />
      </div>
    );
  }

  // =========================
  // HOME PAGE
  // =========================

  return (
    <div className="app">

      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="navbar">

        <div className="logo">
          <span>📚</span>
          E-Book Store
        </div>

        <div className="nav-links">

          <a href="#home">
            Home
          </a>

          <a href="#books">
            Books
          </a>

          <a
            href="#library"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage("library");
            }}
          >
            My Library
          </a>

          {/* Admin Button */}

          {user?.role === "admin" && (
            <button
              className="admin-nav-btn"
              onClick={() =>
                setCurrentPage("admin")
              }
            >
              Admin
            </button>
          )}

        </div>

        {/* Login / Logout */}

        {user ? (
          <button
            className="login-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <button
            className="login-btn"
            onClick={() =>
              setAuthPage("login")
            }
          >
            Login
          </button>
        )}

      </nav>

      {/* =========================
          HERO
      ========================= */}

      <main
        className="hero-section"
        id="home"
      >

        <div className="hero-content">

          <p className="eyebrow">
            YOUR DIGITAL LIBRARY
          </p>

          <h1>
            Discover your next
            <span> great read.</span>
          </h1>

          <p className="hero-text">
            Explore carefully selected e-books,
            purchase instantly, and keep your
            collection with you wherever you go.
          </p>

          <a href="#books">
            <button className="explore-btn">
              Explore Books →
            </button>
          </a>

        </div>

      </main>

      {/* =========================
          BOOKS
      ========================= */}

      <section
        className="books-section"
        id="books"
      >

        <div className="section-heading">

          <div>

            <p className="eyebrow">
              EXPLORE COLLECTION
            </p>

            <h2>
              Find your next
              <span> favorite book.</span>
            </h2>

          </div>

          <p className="section-description">
            Learn something new, improve your
            skills, and build your digital library.
          </p>

        </div>

        {loading ? (
          <p className="loading-text">
            Loading books...
          </p>
        ) : books.length === 0 ? (
          <p className="loading-text">
            No books available right now.
          </p>
        ) : (
          <>
            {/* =========================
                SEARCH
            ========================= */}

            <div className="search-container">
  <div className="search-input-wrapper">
    <span className="search-icon">⌕</span>

    <input
      type="text"
      placeholder="Search books by title or author..."
      value={searchTerm}
      onChange={(e) =>
        setSearchTerm(e.target.value)
      }
      className="book-search"
    />

    {searchTerm && (
      <button
        className="clear-search"
        onClick={() => setSearchTerm("")}
        type="button"
        aria-label="Clear search"
      >
        ×
      </button>
    )}
  </div>
</div>

<div className="category-filter">
  {[
    "All",
    "Programming",
    "Web Development",
    "Database",
    "AI & ML",
    "Notes",
    "Other",
  ].map((category) => (
    <button
      key={category}
      type="button"
      className={
        selectedCategory === category
          ? "category-btn active"
          : "category-btn"
      }
      onClick={() =>
        setSelectedCategory(category)
      }
    >
      {category}
    </button>
  ))}
</div>

            {/* =========================
                BOOK GRID
            ========================= */}

            {filteredBooks.length === 0 ? (
              <p className="loading-text">
                No books found for "{searchTerm}".
              </p>
            ) : (
              <div className="books-grid">

                {filteredBooks.map((book) => (
                  <article
                    className="book-card"
                    key={book._id}
                  >

                    <div className="book-cover">

                      <img
                        src={`http://localhost:5000/uploads/covers/${book.coverImage}`}
                        alt={book.title}
                      />

                    </div>

                    <div className="book-info">
                      {book.category && (
  <span className="book-category">
    {book.category}
  </span>
)}

                      <p className="book-author">
                        By {book.author}
                      </p>

                      {ratings[book._id]?.totalReviews > 0 && (
                        <div className="book-rating">

                          <span className="rating-stars">
                            {"★".repeat(
                              Math.round(
                                ratings[book._id].averageRating
                              )
                            )}
                          </span>

                          <span className="rating-number">
                            {ratings[book._id].averageRating}
                          </span>

                          <span className="rating-count">
                            ({ratings[book._id].totalReviews})
                          </span>

                        </div>
                      )}

                      <h3 className="book-title">
                        {book.title}
                      </h3>

                      <p className="book-description">
                        {book.description}
                      </p>

                      <div className="book-bottom">

                        <span className="book-price">
                          ₹{book.price}
                        </span>

                        <button
                          className="buy-btn"
                          onClick={() =>
                            setSelectedBookId(
                              book._id
                            )
                          }
                        >
                          View Book →
                        </button>

                      </div>

                    </div>

                  </article>
                ))}

              </div>
            )}

          </>
        )}

      </section>

    </div>
  );
}

export default App;