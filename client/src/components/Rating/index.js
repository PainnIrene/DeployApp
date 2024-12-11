import PropTypes from "prop-types";
import { useState } from "react";
import classNames from "classnames/bind";
import styles from "./Rating.module.scss";
import { Rate } from "antd";
import axios from "axios";
import Swal from "sweetalert2";

const cx = classNames.bind(styles);

function Rating({
  isOpen,
  onClose,
  productId,
  orderId,
  userData,
  onRatingSubmit,
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      console.log("Rating submission data:", {
        productId,
        orderId,
        rating,
        comment,
        userData,
      });

      if (!productId) {
        Swal.fire("Error", "Product ID is missing", "error");
        return;
      }

      if (!userData || !userData.name) {
        Swal.fire("Error", "User data not found", "error");
        return;
      }

      if (!rating) {
        Swal.fire("Error", "Please select a rating", "error");
        return;
      }
      if (!comment.trim()) {
        Swal.fire("Error", "Please write a review", "error");
        return;
      }

      const payload = {
        productId,
        orderId,
        rating,
        comment,
        userName: userData.name,
        userAvatar: userData.avtUrl,
      };

      console.log("Sending payload:", payload);

      const response = await axios.post(
        "http://localhost:3002/rating/create",
        payload,
        { withCredentials: true }
      );

      if (response.data.success) {
        Swal.fire("Success", "Thank you for your review!", "success");
        onRatingSubmit && onRatingSubmit(response.data.rating);
        onClose();
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to submit review",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={cx("overlay")} onClick={onClose}>
      <div className={cx("modal")} onClick={(e) => e.stopPropagation()}>
        <h2>Rate Product</h2>
        <form onSubmit={handleSubmit}>
          <div className={cx("rating-section")}>
            <label>Your Rating</label>
            <Rate value={rating} onChange={setRating} allowHalf={false} />
          </div>

          <div className={cx("comment-section")}>
            <label>Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your review here..."
              required
            />
          </div>

          <div className={cx("buttons")}>
            <button
              type="button"
              className={cx("cancel")}
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={cx("submit")}
              disabled={submitting || rating === 0}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

Rating.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  productId: PropTypes.string.isRequired,
  orderId: PropTypes.string.isRequired,
  userData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    avtUrl: PropTypes.string,
    avatarUrl: PropTypes.string,
  }).isRequired,
  onRatingSubmit: PropTypes.func,
};

export default Rating;
