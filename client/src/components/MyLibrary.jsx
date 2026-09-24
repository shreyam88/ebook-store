import { useEffect, useState } from "react";

function MyLibrary({ onBack, onViewBook }) {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
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
          "http://localhost:5000/api/purchases/my",
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

  const handleDownload = async (bookId, pdfFile) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5000/api/purchases/download/${bookId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();

        setMessage(
          data.message || "Download failed."
        );

        return;
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = pdfFile;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);

      setMessage("Unable to download book.");
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
                    src={`http://localhost:5000/uploads/covers/${purchase.book.coverImage}`}
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
                      onClick={() =>
                        handleDownload(
                          purchase.book._id,
                          purchase.book.pdfFile
                        )
                      }
                    >
                      <span className="action-icon">
                        ↓
                      </span>

                      <span>
                        Download PDF
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