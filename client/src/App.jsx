import { useEffect, useState } from "react";

import BookDetails from "./components/BookDetails";
import Login from "./components/Login";
import Signup from "./components/Signup";
import MyLibrary from "./components/MyLibrary";
import AdminDashboard from "./components/AdminDashboard";
import Navbar from "./components/Navbar";
import { API_URL } from "./config";

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

  const [booksError, setBooksError] = useState("");

  // =========================
  // FETCH BOOKS
  // =========================

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setBooksError("");
        const response = await fetch(
          `${API_URL}/api/books`
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          setBooksError(errData.error || errData.message || "Failed to load books from server");
          setBooks([]);
          return;
        }

        const data = await response.json();

        const booksData = data.books || [];

        setBooks(booksData);

        const ratingResults = await Promise.all(
          booksData.map(async (book) => {
            try {
              const ratingResponse = await fetch(
                `${API_URL}/api/reviews/rating/${book._id}`
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
        setBooksError("Cannot connect to server. Check server status and network.");
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
  // RENDER APP
  // =========================

  return (
    <div className="app">

      {/* Global Responsive Navbar */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        selectedBookId={selectedBookId}
        setSelectedBookId={setSelectedBookId}
        authPage={authPage}
        setAuthPage={setAuthPage}
        user={user}
        onLogout={handleLogout}
      />

      {authPage === "login" ? (
        <Login
          onLogin={handleLogin}
          onSwitchToSignup={() => setAuthPage("signup")}
          onBack={() => setAuthPage(null)}
        />
      ) : authPage === "signup" ? (
        <Signup
          onSignup={handleSignup}
          onSwitchToLogin={() => setAuthPage("login")}
          onBack={() => setAuthPage(null)}
        />
      ) : selectedBookId ? (
        <BookDetails
          bookId={selectedBookId}
          onBack={() => setSelectedBookId(null)}
        />
      ) : currentPage === "library" ? (
        <MyLibrary
          onBack={() => setCurrentPage("home")}
          onViewBook={(bookId) => {
            setSelectedBookId(bookId);
            setCurrentPage("home");
          }}
        />
      ) : currentPage === "admin" ? (
        <AdminDashboard
          onBack={() => setCurrentPage("home")}
        />
      ) : (
        <>
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
        ) : booksError ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p className="loading-text" style={{ color: "#ef4444" }}>
              ⚠️ {booksError}
            </p>
            <p style={{ color: "#9ca3af", fontSize: "0.9rem", marginTop: "0.5rem" }}>
              Ensure your MongoDB database is connected and MONGO_URI is configured.
            </p>
          </div>
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
                        src={`${API_URL}/uploads/covers/${book.coverImage}`}
                        alt={book.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600";
                        }}
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
        </>
      )}

    </div>
  );
}

export default App;