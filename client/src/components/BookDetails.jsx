import { useEffect, useState } from "react";
import Reviews from "./Reviews";

function BookDetails({ bookId, onBack }) {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  const [message, setMessage] = useState("");

  // =========================
  // FETCH BOOK
  // =========================

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/books/${bookId}`
        );

        const data = await response.json();

        setBook(data.book);
      } catch (error) {
        console.error("Error fetching book:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  // =========================
  // CHECK PURCHASE ACCESS
  // =========================

  useEffect(() => {
    const checkAccess = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setCheckingAccess(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/purchases/access/${bookId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok && data.hasAccess) {
          setHasAccess(true);
        }
      } catch (error) {
        console.error("Access check error:", error);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAccess();
  }, [bookId]);

  // =========================
  // PURCHASE BOOK
  // =========================

  const handlePurchase = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
     window.dispatchEvent(new Event("open-login"));
      return;
    }

    try {
      setMessage("Creating payment...");

      // 1. Create Razorpay order
      const response = await fetch(
        "http://localhost:5000/api/payments/create-order",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            bookId: book._id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Unable to create payment."
        );
        return;
      }

      // 2. Razorpay Checkout Options
      const options = {
        key: data.keyId,

        amount: data.order.amount,

        currency: data.order.currency,

        name: "E-Book Store",

        description: book.title,

        order_id: data.order.id,

        prefill: {
          name:
            JSON.parse(localStorage.getItem("user"))?.name || "",

          email:
            JSON.parse(localStorage.getItem("user"))?.email || "",
        },

        theme: {
          color: "#7c3aed",
        },

        // 3. Payment Successful
        handler: async function (paymentResponse) {
          try {
            setMessage("Verifying payment...");

            const verifyResponse = await fetch(
              "http://localhost:5000/api/payments/verify",
              {
                method: "POST",

                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },

                body: JSON.stringify({
                  razorpay_order_id:
                    paymentResponse.razorpay_order_id,

                  razorpay_payment_id:
                    paymentResponse.razorpay_payment_id,

                  razorpay_signature:
                    paymentResponse.razorpay_signature,

                  bookId: book._id,
                }),
              }
            );

            const verifyData =
              await verifyResponse.json();

            if (!verifyResponse.ok) {
              setMessage(
                verifyData.message ||
                  "Payment verification failed."
              );

              return;
            }

            // Payment verified
            setHasAccess(true);

            setMessage(
              "Payment verified successfully! 🎉"
            );
          } catch (error) {
            console.error(
              "Payment verification error:",
              error
            );

            setMessage(
              "Payment verification failed."
            );
          }
        },
      };

      // 4. Check Razorpay Script
      if (!window.Razorpay) {
        setMessage(
          "Razorpay Checkout failed to load. Please refresh the page."
        );

        return;
      }

      // 5. Create Razorpay Instance
      const razorpay = new window.Razorpay(options);

      // Payment Failed
      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Payment failed:",
            response.error
          );

          setMessage(
            response.error?.description ||
              "Payment failed."
          );
        }
      );

      // 6. Open Razorpay
      razorpay.open();

    } catch (error) {
      console.error("Payment error:", error);

      setMessage(
        "Unable to start payment."
      );
    }
  };

  // =========================
  // DOWNLOAD BOOK
  // =========================

  const handleDownload = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

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

      link.download = book.pdfFile;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(
        "Download error:",
        error
      );

      setMessage(
        "Unable to download book."
      );
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <section className="book-details-section">

        <p className="loading-text">
          Loading book...
        </p>

      </section>
    );
  }

  // =========================
  // BOOK NOT FOUND
  // =========================

  if (!book) {
    return (
      <section className="book-details-section">

        <p className="loading-text">
          Book not found.
        </p>

        <button
          className="back-btn"
          onClick={onBack}
        >
          ← Back to Books
        </button>

      </section>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <section className="book-details-section">

      {/* Back Button */}

      <button
        className="back-btn"
        onClick={onBack}
      >
        ← Back to Books
      </button>

      {/* Book Details */}

      <div className="book-details-card">

        {/* Cover */}

        <div className="details-cover">
  <img
    src={`http://localhost:5000/uploads/covers/${book.coverImage}`}
    alt={book.title}
  />
</div>
        {/* Content */}

        <div className="details-content">

          <p className="eyebrow">
            E-BOOK
          </p>

          <h1>
            {book.title}
          </h1>

          <p className="details-author">
            By {book.author}
          </p>

          <p className="details-description">
            {book.description}
          </p>

          <div className="details-price">
            ₹{book.price}
          </div>

          {/* Purchase / Download */}

          {!checkingAccess && hasAccess && (
  <p className="owned-badge">
    ✓ You already own this book
  </p>
)}

{checkingAccess ? (
  <p className="purchase-message">
    Checking your access...
  </p>
) : hasAccess ? (
  <>
    <p className="owned-badge">
      ✓ You already own this book
    </p>

    <button
      className="purchase-btn"
      onClick={handleDownload}
    >
      Download PDF ↓
    </button>
  </>
) : (
  <button
    className="purchase-btn"
    onClick={handlePurchase}
  >
    Purchase Book →
  </button>
)}

          {/* Payment Message */}

          {message && (
            <p className="purchase-message">
              {message}
            </p>
          )}

        </div>

      </div>

      {/* Reviews */}

      <Reviews
        bookId={bookId}
      />

    </section>
  );
}

export default BookDetails;