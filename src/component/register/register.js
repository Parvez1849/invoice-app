import React, { useRef, useState, useEffect, useCallback } from "react"; // useCallback add kiya
import "./register.css";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase"; 
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
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

  // Cloudinary Details
  const CLOUD_NAME = "dhvdlw4s6";
  const UPLOAD_PRESET = "invoice-app";

  const onSelectFile = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImageUrl(URL.createObjectURL(selectedFile));
    }
  };

  const uploadToCloudinary = async (user) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.secure_url) {
        throw new Error(data.error?.message || "Upload failed");
      }

      await updateProfile(user, {
        displayName,
        photoURL: data.secure_url,
      });

      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary Error:", error);
      throw error;
    }
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

  // Fixed: Wrapped in useCallback to prevent re-creation and fix dependency warning
  const checkEmailVerification = useCallback(async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    if (auth.currentUser.emailVerified) {
      setIsVerified(true);
      setErrorMessage("Email verified! Redirecting...");
      
      setTimeout(() => {
        navigate("/dashboard/home"); // Aapke path ke hisaab se adjust karein
      }, 2000);
    }
  }, [navigate]);

  useEffect(() => {
    let interval;
    if (emailSent && !isVerified) {
      interval = setInterval(checkEmailVerification, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [emailSent, isVerified, checkEmailVerification]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    if (!file) {
        setErrorMessage("Please select a logo first.");
        setLoading(false);
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const photoURL = await uploadToCloudinary(user);
      await saveUserData(user, photoURL);
      await sendEmailVerification(user);
      
      setEmailSent(true);
      setErrorMessage("Verification email sent. Please check your inbox.");
    } catch (error) {
      console.error("Registration failed:", error);
      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("This email is already registered.");
      } else {
        setErrorMessage(error.message || "Registration failed. Try again.");
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
              A verification email has been sent. Please verify to proceed.
            </p>
          )}

          <form onSubmit={submitHandler}>
            <input
              required
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              type="email"
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
              placeholder="Password (6 characters min)"
            />
            <input
              onChange={onSelectFile}
              style={{ display: "none" }}
              type="file"
              ref={fileInputRef}
              accept="image/*"
            />
            <input
              className="login-input"
              type="button"
              value={file ? "Logo Selected" : "Select Your Logo"}
              onClick={() => fileInputRef.current.click()}
            />
            {imageUrl && <img src={imageUrl} alt="Preview" className="image-preview" style={{width: '100px', margin: '10px 0', borderRadius: '5px'}} />}
            
            <button
              className="login-input login-btn"
              type="submit"
              disabled={isLoading || (emailSent && !isVerified)}
            >
              {isLoading ? "Processing..." : "Submit"}
            </button>
          </form>

          <Link to="/login" className="register-link">Already have an account? Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

