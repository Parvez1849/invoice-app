import React, { useRef, useState, useEffect } from "react";
import "./register.css";
import { Link, useNavigate } from "react-router-dom";
import { auth, storage, db } from "../../firebase";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";

const Register = () => {
  const fileInputRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const navigate = useNavigate();

  const onSelectFile = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImageUrl(URL.createObjectURL(selectedFile));
    }
  };

  const uploadFileAndGetURL = async (user) => {
    const date = new Date().getTime();
    const storageRef = ref(storage, `${displayName}_${date}`);

    const uploadTask = await uploadBytesResumable(storageRef, file);
    const downloadUrl = await getDownloadURL(uploadTask.ref);

    await updateProfile(user, {
      displayName,
      photoURL: downloadUrl,
    });

    return downloadUrl;
  };

  const saveUserData = async (user, photoURL) => {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      displayName,
      email,
      photoURL,
    });

    localStorage.setItem("cName", displayName);
    localStorage.setItem("photoURL", photoURL);
    localStorage.setItem("email", email);
    localStorage.setItem("uid", user.uid);
  };

  const checkEmailVerification = async () => {
    await auth.currentUser.reload();
    if (auth.currentUser.emailVerified) {
      setIsVerified(true);
      setErrorMessage("Email verified! You will be logged in automatically.");
      
      // Auto-login: navigate to the dashboard or any protected route
      setTimeout(() => {
        navigate("/dashboard"); // Redirect to dashboard after verification
      }, 2000); // Wait for 2 seconds before auto-login
    }
  };

  useEffect(() => {
    let interval;
    if (emailSent) {
      // Start polling to check email verification
      interval = setInterval(checkEmailVerification, 5000); // Check every 5 seconds
    }
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [emailSent]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const photoURL = await uploadFileAndGetURL(user);

      await saveUserData(user, photoURL);

      // Send verification email
      await sendEmailVerification(user);
      setEmailSent(true);

      setErrorMessage("Verification email sent. Please check your inbox.");
    } catch (error) {
      console.error("Registration failed:", error);

      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("This email is already registered. Please log in or use another email.");
      } else if (error.code === "auth/weak-password") {
        setErrorMessage("Password is too weak. Please use a stronger password.");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("Invalid email address. Please enter a valid email.");
      } else {
        setErrorMessage("Registration failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-boxes login-left"></div>
        <div className="login-boxes login-right">
          <h2 className="login-heading">Create Your Account</h2>

          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {emailSent && !isVerified && (
            <p className="success-message">
              A verification email has been sent to your email. Please verify your email to proceed.
            </p>
          )}
          {isVerified && (
            <p className="success-message">Verification complete! Logging you in now...</p>
          )}

          <form onSubmit={submitHandler}>
            <input
              required
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              type="text"
              placeholder="Email"
            />
            <input
              required
              onChange={(e) => setDisplayName(e.target.value)}
              className="login-input"
              type="text"
              placeholder="Company Name"
            />
            <input
              required
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              type="password"
              placeholder="Password (6 characters minimum)"
            />
            <input
              required
              onChange={onSelectFile}
              style={{ display: "none" }}
              type="file"
              ref={fileInputRef}
            />
            <input
              className="login-input"
              type="button"
              value="Select Your Logo"
              onClick={() => fileInputRef.current.click()}
            />
            {imageUrl && <img src={imageUrl} alt="Preview" className="image-preview" />}
            <button
              className="login-input login-btn"
              type="submit"
              disabled={isLoading || emailSent}
            >
              {isLoading ? <i className="fa fa-circle-notch fa-spin"></i> : "Submit"}
            </button>
          </form>

          {isVerified && (
            <Link to="/dashboard" className="register-link">
              Go to Dashboard
            </Link>
          )}
          <Link to="/login" className="register-link">Log In</Link>
          <p>OR</p>
          <Link to="/forgetpass" className="register-link">Forgot Password</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

