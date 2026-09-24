import { useEffect, useState } from "react";

function AdminDashboard({ onBack }) {
  const [books, setBooks] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [editingBook, setEditingBook] = useState(null);

  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const [coverPreview, setCoverPreview] = useState("");

  // =========================
  // ADMIN STATS
  // =========================

  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    totalPurchases: 0,
    totalRevenue: 0,
  });

  // =========================
  // FORM DATA
  // =========================

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    price: "",
    category: "Other",
  });

  // =========================
  // FETCH BOOKS
  // =========================

  const fetchBooks = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/books"
      );

      const data = await response.json();

      if (response.ok) {
        setBooks(data.books || []);
      }
    } catch (error) {
      console.error("Fetch books error:", error);
      setError("Unable to load books.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH ADMIN STATS
  // =========================

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/admin/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStats({
          totalBooks: data.totalBooks || 0,
          totalUsers: data.totalUsers || 0,
          totalPurchases: data.totalPurchases || 0,
          totalRevenue: data.totalRevenue || 0,
        });
      } else {
        console.error(
          "Fetch stats error:",
          data.message
        );
      }
    } catch (error) {
      console.error(
        "Fetch stats error:",
        error
      );
    }
  };

  // =========================
  // FETCH ADMIN PURCHASES
  // =========================

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/admin/purchases",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setPurchases(data.purchases || []);
      } else {
        console.error(
          "Fetch purchases error:",
          data.message
        );
      }
    } catch (error) {
      console.error(
        "Fetch purchases error:",
        error
      );
    }
  };

  // =========================
  // FETCH ADMIN USERS
  // =========================

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/admin/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
      } else {
        console.error(
          "Fetch users error:",
          data.message
        );
      }
    } catch (error) {
      console.error(
        "Fetch users error:",
        error
      );
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchBooks();
    fetchStats();
    fetchPurchases();
    fetchUsers();
  }, []);

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // PDF CHANGE
  // =========================

  const handlePdfChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setPdfFile(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Please select a PDF file.");

      e.target.value = "";
      setPdfFile(null);

      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError(
        "PDF size must be less than 100 MB."
      );

      e.target.value = "";
      setPdfFile(null);

      return;
    }

    setError("");
    setPdfFile(file);
  };

  // =========================
  // COVER CHANGE
  // =========================

  const handleCoverChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setCoverFile(null);

      setCoverPreview(
        editingBook
          ? `http://localhost:5000/uploads/covers/${editingBook.coverImage}`
          : ""
      );

      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Cover must be JPG, PNG or WEBP."
      );

      e.target.value = "";
      setCoverFile(null);

      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        "Cover image must be less than 10 MB."
      );

      e.target.value = "";
      setCoverFile(null);

      return;
    }

    setError("");
    setCoverFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setCoverPreview(previewUrl);
  };

  // =========================
  // SUBMIT FORM
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token =
      localStorage.getItem("token");

    if (!token) {
      setError("Please login as admin.");
      return;
    }

    setMessage("");
    setError("");

    // New book requires both files
    if (!editingBook) {
      if (!pdfFile) {
        setError(
          "Please select a PDF file."
        );

        return;
      }

      if (!coverFile) {
        setError(
          "Please select a cover image."
        );

        return;
      }
    }

    try {
      // =========================
      // CREATE BOOK
      // =========================

      if (!editingBook) {
        const form = new FormData();

        form.append(
          "title",
          formData.title
        );

        form.append(
          "author",
          formData.author
        );

        form.append(
          "description",
          formData.description
        );

        form.append(
          "price",
          formData.price
        );

        form.append(
          "category",
          formData.category
        );

        form.append(
          "pdf",
          pdfFile
        );

        form.append(
          "cover",
          coverFile
        );

        const response = await fetch(
          "http://localhost:5000/api/books",
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            body: form,
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Unable to add book."
          );

          return;
        }

        setMessage(
          "Book added successfully! ✅"
        );
      }

      // =========================
      // UPDATE BOOK
      // =========================

      else {
        const form = new FormData();

        form.append(
          "title",
          formData.title
        );

        form.append(
          "author",
          formData.author
        );

        form.append(
          "description",
          formData.description
        );

        form.append(
          "price",
          formData.price
        );

        form.append(
          "category",
          formData.category
        );

        // PDF optional during edit
        if (pdfFile) {
          form.append(
            "pdf",
            pdfFile
          );
        }

        // Cover optional during edit
        if (coverFile) {
          form.append(
            "cover",
            coverFile
          );
        }

        const response = await fetch(
          `http://localhost:5000/api/books/${editingBook._id}`,
          {
            method: "PUT",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            body: form,
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Unable to update book."
          );

          return;
        }

        setMessage(
          "Book updated successfully! ✅"
        );
      }

      // =========================
      // RESET FORM
      // =========================

      setFormData({
        title: "",
        author: "",
        description: "",
        price: "",
        category: "Other",
      });

      setPdfFile(null);
      setCoverFile(null);
      setEditingBook(null);
      setCoverPreview("");

      const pdfInput =
        document.getElementById(
          "book-pdf"
        );

      const coverInput =
        document.getElementById(
          "book-cover"
        );

      if (pdfInput) {
        pdfInput.value = "";
      }

      if (coverInput) {
        coverInput.value = "";
      }

      await fetchBooks();
      await fetchStats();
      await fetchPurchases();
      await fetchUsers();

    } catch (error) {
      console.error(
        "Save book error:",
        error
      );

      setError(
        "Unable to connect to server."
      );
    }
  };

  // =========================
  // EDIT BOOK
  // =========================

  const handleEdit = (book) => {
    setEditingBook(book);

    setFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      price: book.price,
      category: book.category || "Other",
    });

    setPdfFile(null);
    setCoverFile(null);

    setCoverPreview(
      `http://localhost:5000/uploads/covers/${book.coverImage}`
    );

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const handleCancelEdit = () => {
    setEditingBook(null);

    setFormData({
      title: "",
      author: "",
      description: "",
      price: "",
      category: "Other",
    });

    setPdfFile(null);
    setCoverFile(null);
    setCoverPreview("");

    setMessage("");
    setError("");

    const pdfInput =
      document.getElementById(
        "book-pdf"
      );

    const coverInput =
      document.getElementById(
        "book-cover"
      );

    if (pdfInput) {
      pdfInput.value = "";
    }

    if (coverInput) {
      coverInput.value = "";
    }
  };

  // =========================
  // DELETE BOOK
  // =========================

  const handleDelete = async (bookId) => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      setError(
        "Please login as admin."
      );

      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this book?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const response =
        await fetch(
          `http://localhost:5000/api/books/${bookId}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to delete book."
        );

        return;
      }

      setMessage(
        "Book deleted successfully! 🗑️"
      );

      await fetchBooks();
      await fetchStats();
      await fetchPurchases();
      await fetchUsers();

    } catch (error) {
      console.error(
        "Delete book error:",
        error
      );

      setError(
        "Unable to connect to server."
      );
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <section className="admin-section">

      {/* BACK BUTTON */}

      <button
        className="back-btn"
        onClick={onBack}
      >
        ← Back to Store
      </button>

      {/* HEADING */}

      <div className="section-heading admin-heading">

        <div>

          <p className="eyebrow">
            ADMIN PANEL
          </p>

          <h2>
            Manage <span>Books.</span>
          </h2>

        </div>

        <p className="section-description">
          Add, update and remove books
          from your store.
        </p>

      </div>

      {/* =========================
          STATISTICS
      ========================= */}

      <div className="admin-stats-grid">

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            📚
          </div>

          <div>

            <p>Total Books</p>

            <h3>
              {stats.totalBooks}
            </h3>

          </div>

        </div>

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            👤
          </div>

          <div>

            <p>Total Users</p>

            <h3>
              {stats.totalUsers}
            </h3>

          </div>

        </div>

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            🛒
          </div>

          <div>

            <p>Purchases</p>

            <h3>
              {stats.totalPurchases}
            </h3>

          </div>

        </div>

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            ₹
          </div>

          <div>

            <p>Total Revenue</p>

            <h3>
              ₹{stats.totalRevenue}
            </h3>

          </div>

        </div>

      </div>

      {/* =========================
          FORM
      ========================= */}

      <div className="admin-form-card">

        <div className="admin-form-header">

          <h3>
            {editingBook
              ? "Update Book"
              : "Add New Book"}
          </h3>

          {editingBook && (
            <button
              type="button"
              className="admin-cancel-btn"
              onClick={
                handleCancelEdit
              }
            >
              Cancel Edit
            </button>
          )}

        </div>

        <form
          className="admin-form"
          onSubmit={handleSubmit}
        >

          {/* BASIC INFO */}

          <div className="admin-form-grid">

            <div className="form-group">

              <label>
                Book Title
              </label>

              <input
                type="text"
                name="title"
                placeholder="Enter book title"
                value={formData.title}
                onChange={
                  handleChange
                }
                required
              />

            </div>

            <div className="form-group">

              <label>
                Author
              </label>

              <input
                type="text"
                name="author"
                placeholder="Enter author name"
                value={formData.author}
                onChange={
                  handleChange
                }
                required
              />

            </div>

            <div className="form-group">

              <label>
                Price (₹)
              </label>

              <input
                type="number"
                name="price"
                placeholder="299"
                min="0"
                value={formData.price}
                onChange={
                  handleChange
                }
                required
              />

            </div>

            {/* CATEGORY */}

            <div className="form-group">

              <label>
                Category
              </label>

              <select
                name="category"
                value={
                  formData.category
                }
                onChange={
                  handleChange
                }
              >

                <option value="Programming">
                  Programming
                </option>

                <option value="Web Development">
                  Web Development
                </option>

                <option value="Database">
                  Database
                </option>

                <option value="AI & ML">
                  AI & ML
                </option>

                <option value="Notes">
                  Notes
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>

          </div>

          {/* DESCRIPTION */}

          <div className="form-group">

            <label>
              Description
            </label>

            <textarea
              name="description"
              placeholder="Write a short description..."
              rows="5"
              value={
                formData.description
              }
              onChange={
                handleChange
              }
              required
            />

          </div>

          {/* COVER */}

          <div className="form-group">

            <label>
              Cover Image
            </label>

            <input
              id="book-cover"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={
                handleCoverChange
              }
              required={!editingBook}
            />

            {coverPreview && (
              <div className="admin-cover-preview">

                <img
                  src={coverPreview}
                  alt="Cover preview"
                />

                <div>

                  <p>
                    Cover Preview
                  </p>

                  {coverFile && (
                    <span>
                      {coverFile.name}
                    </span>
                  )}

                </div>

              </div>
            )}

            {!coverPreview &&
              coverFile && (
                <p className="pdf-selected">
                  Selected cover:{" "}
                  {coverFile.name}
                </p>
              )}

            {editingBook && (
              <p className="pdf-help">
                Leave empty to keep the
                existing cover.
              </p>
            )}

          </div>

          {/* PDF */}

          <div className="form-group">

            <label>
              PDF File
            </label>

            <input
              id="book-pdf"
              type="file"
              accept=".pdf,application/pdf"
              onChange={
                handlePdfChange
              }
              required={!editingBook}
            />

            {pdfFile && (
              <p className="pdf-selected">
                Selected PDF:{" "}
                {pdfFile.name}
              </p>
            )}

            {editingBook && (
              <p className="pdf-help">
                Leave empty to keep the
                existing PDF.
              </p>
            )}

          </div>

          {/* MESSAGES */}

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          {message && (
            <p className="auth-success">
              {message}
            </p>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            className="auth-submit-btn"
          >
            {editingBook
              ? "Update Book →"
              : "Upload & Add Book →"}
          </button>

        </form>

      </div>

      {/* =========================
          RECENT PURCHASES
      ========================= */}

      <div className="admin-purchases">

        <div className="admin-books-header">

          <div>

            <p className="eyebrow">
              SALES
            </p>

            <h3>
              Recent Purchases
            </h3>

          </div>

          <span className="admin-count">
            {purchases.length} Purchases
          </span>

        </div>

        {purchases.length === 0 ? (

          <p className="loading-text">
            No purchases yet.
          </p>

        ) : (

          <div className="admin-purchase-list">

            {purchases
              .slice(0, 10)
              .map((purchase) => (

                <div
                  className="admin-purchase-row"
                  key={purchase._id}
                >

                  <div className="admin-purchase-info">

                    <div className="admin-purchase-icon">
                      🛒
                    </div>

                    <div>

                      <h4>
                        {purchase.book?.title ||
                          "Book unavailable"}
                      </h4>

                      <p>
                        {purchase.user?.name ||
                          "Unknown User"}
                      </p>

                      <span>
                        {purchase.user?.email ||
                          "No email"}
                      </span>

                    </div>

                  </div>

                  <div className="admin-purchase-meta">

                    <strong>
                      ₹{purchase.amount}
                    </strong>

                    <span className="admin-paid-badge">
                      Paid
                    </span>

                  </div>

                </div>

              ))}

          </div>

        )}

      </div>

      {/* =========================
          USERS
      ========================= */}

      <div className="admin-users">

        <div className="admin-books-header">

          <div>

            <p className="eyebrow">
              CUSTOMERS
            </p>

            <h3>
              Users
            </h3>

          </div>

          <span className="admin-count">
            {users.length} Users
          </span>

        </div>

        {users.length === 0 ? (

          <p className="loading-text">
            No users found.
          </p>

        ) : (

          <div className="admin-user-list">

            {users.map((user) => (

              <div
                className="admin-user-row"
                key={user._id}
              >

                <div className="admin-user-avatar">
                  {user.name
                    ? user.name
                        .charAt(0)
                        .toUpperCase()
                    : "U"}
                </div>

                <div className="admin-user-info">

                  <h4>
                    {user.name ||
                      "Unknown User"}
                  </h4>

                  <p>
                    {user.email}
                  </p>

                </div>

                <span
                  className={
                    user.role === "admin"
                      ? "admin-role-badge"
                      : "user-role-badge"
                  }
                >
                  {user.role}
                </span>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* =========================
          ALL BOOKS
      ========================= */}

      <div className="admin-books">

        <div className="admin-books-header">

          <div>

            <p className="eyebrow">
              COLLECTION
            </p>

            <h3>
              All Books
            </h3>

          </div>

          <span className="admin-count">
            {books.length} Books
          </span>

        </div>

        {loading ? (

          <p className="loading-text">
            Loading books...
          </p>

        ) : books.length === 0 ? (

          <p className="loading-text">
            No books available.
          </p>

        ) : (

          <div className="admin-book-list">

            {books.map((book) => (

              <div
                className="admin-book-row"
                key={book._id}
              >

                <div className="admin-book-info">

                  <div className="admin-book-icon">

                    <img
                      src={`http://localhost:5000/uploads/covers/${book.coverImage}`}
                      alt={book.title}
                    />

                  </div>

                  <div>

                    <h4>
                      {book.title}
                    </h4>

                    <p>
                      By {book.author}
                    </p>

                    <span className="admin-book-category">
                      {book.category ||
                        "Other"}
                    </span>

                    <span>
                      ₹{book.price}
                    </span>

                  </div>

                </div>

                <div className="admin-book-actions">

                  <button
                    className="admin-edit-btn"
                    onClick={() =>
                      handleEdit(book)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="admin-delete-btn"
                    onClick={() =>
                      handleDelete(
                        book._id
                      )
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </section>
  );
}

export default AdminDashboard;