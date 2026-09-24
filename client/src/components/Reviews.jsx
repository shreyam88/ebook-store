import { useEffect, useState } from "react";

function Reviews({ bookId }) {
  const [reviews, setReviews] = useState([]);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/reviews/${bookId}`
      );

      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error("Reviews error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login to write a review.");
      return;
    }

    if (!comment.trim()) {
      setError("Please write a comment.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const response = await fetch(
        "http://localhost:5000/api/reviews",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookId,
            rating,
            comment,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to add review."
        );
        return;
      }

      setMessage("Review added successfully! ⭐");
      setComment("");
      setRating(5);

      await fetchReviews();
    } catch (error) {
      console.error("Add review error:", error);
      setError("Unable to connect to server.");
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, review) =>
              total + review.rating,
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="reviews-section">

      <div className="reviews-heading">
        <p className="eyebrow">
          COMMUNITY
        </p>

        <h2>
          Reader <span>Reviews</span>
        </h2>

        {!loading && reviews.length > 0 && (
          <div className="reviews-summary">
            <div className="average-rating">
              <span className="average-number">
                {averageRating}
              </span>

              <span className="average-stars">
                {"★".repeat(
                  Math.round(Number(averageRating))
                )}
                {"☆".repeat(
                  5 -
                    Math.round(
                      Number(averageRating)
                    )
                )}
              </span>
            </div>

            <p>
              Based on {reviews.length}{" "}
              {reviews.length === 1
                ? "review"
                : "reviews"}
            </p>
          </div>
        )}
      </div>

      {/* Add Review */}

      <div className="review-form-card">

        <h3>
          Share your experience
        </h3>

        <form onSubmit={handleSubmit}>

          <div className="rating-selector">

            <label>
              Rating
            </label>

            <select
              value={rating}
              onChange={(e) =>
                setRating(
                  Number(e.target.value)
                )
              }
            >
              <option value="5">
                ★★★★★ — 5
              </option>

              <option value="4">
                ★★★★☆ — 4
              </option>

              <option value="3">
                ★★★☆☆ — 3
              </option>

              <option value="2">
                ★★☆☆☆ — 2
              </option>

              <option value="1">
                ★☆☆☆☆ — 1
              </option>
            </select>

          </div>

          <textarea
            placeholder="Write your review..."
            value={comment}
            onChange={(e) =>
              setComment(e.target.value)
            }
            rows="4"
          />

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

          <button
            type="submit"
            className="purchase-btn"
            disabled={submitting}
          >
            {submitting
              ? "Submitting..."
              : "Submit Review →"}
          </button>

        </form>

      </div>

      {/* Reviews List */}

      <div className="reviews-list">

        {loading ? (
          <p className="loading-text">
            Loading reviews...
          </p>
        ) : reviews.length === 0 ? (
          <p className="loading-text">
            No reviews yet. Be the first to
            review this book!
          </p>
        ) : (
          reviews.map((review) => (
            <div
              className="review-card"
              key={review._id}
            >

              <div className="review-top">

                <div>
                  <h4>
                    {review.user?.name ||
                      "Reader"}
                  </h4>

                  <div className="review-stars">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(
                      5 - review.rating
                    )}
                  </div>
                </div>

                <span className="review-date">
                  {new Date(
                    review.createdAt
                  ).toLocaleDateString()}
                </span>

              </div>

              <p className="review-comment">
                {review.comment}
              </p>

            </div>
          ))
        )}

      </div>

    </div>
  );
}

export default Reviews;