import React, { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase"; // import Firebase auth instance
import "./forgetpass.css"; // Add your styles for this component

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setMessage("");

    try {
      // Send password reset email
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Please check your inbox.");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      if (error.code === "auth/user-not-found") {
        setErrorMessage("No account found with this email address.");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("Invalid email address. Please check and try again.");
      } else {
        setErrorMessage("Failed to send password reset email. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-wrapper">
      <div className="forgot-password-container">
        <div className="forgot-pass forgot-left">

        </div>
        <div className="forgot-pass forgot-right">
        <h2 className="forgot-password-heading">Reset Your Password</h2>
        {message && <p className="success-message">{message}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <form onSubmit={submitHandler}>
          <input
            type="email"
            className="forgot-password-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="forgot-password-input forgot-password-btn"
            disabled={isLoading}
          >
            {isLoading ? <i className="fa fa-circle-notch fa-spin"></i> : "Send Reset Link"}
          </button>
        </form>
        <Link to="/login" className="forgot-password-link">
          Back to Login Or Register
        </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
