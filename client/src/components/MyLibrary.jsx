import { useEffect, useState } from "react";
import { API_URL } from "../config";

function MyLibrary({ onBack, onViewBook }) {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPurchases = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Please login to access your library.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
  `${API_URL}/api/purchases/my`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

        const data = await response.json();

        if (!response.ok) {
          setMessage(
            data.message || "Unable to load library."
          );
          return;
        }

        setPurchases(data.purchases || []);
      } catch (error) {
        console.error("Library error:", error);
        setMessage("Unable to connect to server.");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  const handleDownload = async (bookId, pdfFile, bookTitle) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login to download books.");
      return;
    }

    try {
      setDownloadingId(bookId);
      setMessage("Downloading your book... ⏳");

      const response = await fetch(
        `${API_URL}/api/purchases/download/${bookId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        setMessage(
          data.message || "Download failed."
        );

        setDownloadingId(null);
        return;
      }

      // Determine filename from Content-Disposition header if present
      const disposition = response.headers.get("content-disposition");
      let filename = "";
      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, "").trim();
        }
      }
      if (!filename) {
        const safeTitle = (bookTitle || "ebook").replace(/[^a-zA-Z0-9_\-]/g, "_");
        filename = `${safeTitle}.pdf`;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Delay revocation so mobile and desktop browsers have time to process the download
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);

      setMessage("Book downloaded successfully! 🎉");
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      console.error("Download error:", error);
      setMessage("Unable to download book.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <section className="library-section">
      <button
        className="back-btn"
        onClick={onBack}
      >
        ← Back to Books
      </button>

      <div className="section-heading">
        <div>
          <p className="eyebrow">
            YOUR COLLECTION
          </p>

          <h2>
            My <span>Library.</span>
          </h2>
        </div>

        <p className="section-description">
          Your purchased e-books are available here.
        </p>
      </div>

      {loading ? (
        <p className="loading-text">
          Loading your library...
        </p>
      ) : message ? (
        <p className="loading-text">
          {message}
        </p>
      ) : purchases.length === 0 ? (
        <p className="loading-text">
          You haven't purchased any books yet.
        </p>
      ) : (
        <div className="books-grid">
          {purchases
            .filter((purchase) => purchase.book)
            .map((purchase) => (
              <article
                className="book-card"
                key={purchase._id}
              >
                <div className="book-cover">
                  <img
                    src={`${API_URL}/uploads/covers/${purchase.book.coverImage}`}
                    alt={purchase.book.title}
                  />
                </div>

                <div className="book-info">
                  <p className="book-author">
                    By {purchase.book.author}
                  </p>

                  <h3 className="book-title">
                    {purchase.book.title}
                  </h3>

                  <p className="book-description">
                    {purchase.book.description}
                  </p>

                  <div className="library-actions">
                    <button
                      className="library-action-btn view-book-btn"
                      onClick={() =>
                        onViewBook(
                          purchase.book._id
                        )
                      }
                    >
                      <span className="action-icon">
                        ♧
                      </span>

                      <span>
                        View Book
                      </span>

                      <span className="action-arrow">
                        →
                      </span>
                    </button>

                    <button
                      className="library-action-btn download-book-btn"
                      disabled={downloadingId === purchase.book?._id}
                      onClick={() =>
                        handleDownload(
                          purchase.book?._id,
                          purchase.book?.pdfFile,
                          purchase.book?.title
                        )
                      }
                    >
                      <span className="action-icon">
                        ↓
                      </span>

                      <span>
                        {downloadingId === purchase.book?._id
                          ? "Downloading..."
                          : "Download PDF"}
                      </span>

                      <span className="action-arrow">
                        →
                      </span>
                    </button>
                  </div>

                  <div className="library-purchased-badge">
                    <span>✓</span>
                    Purchased
                  </div>
                </div>
              </article>
            ))}
        </div>
      )}
    </section>
  );
}

export default MyLibrary;