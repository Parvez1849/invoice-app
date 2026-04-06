import React, { useState, useRef, useEffect, useCallback } from "react";
import { auth, db } from "../../firebase";
import { updateProfile, updateEmail, updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import "./setting.css";

const Setting = () => {
  const fileInputRef = useRef(null);

  // States
  const [isLoading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingLogo, setIsEditingLogo] = useState(false);

  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState(null);
  const [displayName, setDisplayName] = useState(localStorage.getItem("cName") || "");
  const [imageUrl, setImageUrl] = useState(localStorage.getItem("photoURL") || "");

  // Cloudinary Details
  const CLOUD_NAME = "dhvdlw4s6";
  const UPLOAD_PRESET = "invoice-app";

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Update Company Name
  const updateCompanyName = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await updateProfile(user, { displayName });
        localStorage.setItem("cName", displayName);
        await updateDoc(doc(db, "users", localStorage.getItem("uid")), { displayName });
        setIsEditingName(false);
        alert("Company name updated!");
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  // File selection
  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setImageUrl(URL.createObjectURL(selectedFile));
      setIsEditingLogo(true);
    }
  };

  // Update Logo to Cloudinary
  const updateLogo = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.secure_url) {
        const newPhotoURL = data.secure_url;
        await updateProfile(auth.currentUser, { photoURL: newPhotoURL });
        await updateDoc(doc(db, "users", localStorage.getItem("uid")), {
          photoURL: newPhotoURL
        });

        localStorage.setItem("photoURL", newPhotoURL);
        alert("Logo updated successfully!");
        setIsEditingLogo(false);
        setFile(null);
        // Page reload to sync all components
        window.location.reload(); 
      } else {
        alert("Upload failed: " + (data.error?.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Cloudinary Error:", error);
      alert("Something went wrong!");
    } finally {
      setIsUploading(false);
    }
  };

  const cancelLogoEdit = useCallback(() => {
    setFile(null);
    setIsEditingLogo(false);
    setImageUrl(localStorage.getItem("photoURL") || "");
  }, []);

  const handleEditLogoClick = () => {
    fileInputRef.current.click();
  };

  const updateEmailHandler = () => {
    updateEmail(auth.currentUser, email)
      .then(() => {
        localStorage.setItem("email", email);
        alert("Email updated! Please re-login if required.");
        setIsEditingEmail(false);
      })
      .catch((error) => alert(error.message));
  };

  const updatePasswordHandler = () => {
    if (password.length < 6) {
        alert("Password should be at least 6 characters");
        return;
    }
    updatePassword(auth.currentUser, password)
      .then(() => {
        alert("Password updated successfully!");
        setIsEditingPassword(false);
        setPassword("");
      })
      .catch((error) => alert(error.message));
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "24px", marginRight: "10px" }}></i> 
        Loading Settings...
      </div>
    );
  }

  return (
    <div className="settings-container">
      <h1>Account Settings</h1>
      <div className="settings-wrapper">
        
        {/* Profile Image Section */}
        <div className="profile-section">
          <div className="img-container">
            <img
              onClick={handleEditLogoClick}
              className="profile-pic"
              alt="profile-pic"
              src={imageUrl}
            />
            {isUploading && <div className="loader-overlay"><i className="fa-solid fa-spinner fa-spin"></i></div>}
          </div>
          
          <input
            onChange={onSelectFile}
            style={{ display: "none" }}
            type="file"
            ref={fileInputRef}
            accept="image/*"
          />

          {isEditingLogo && file ? (
            <div className="action-btns">
              <button className="update-btn" onClick={updateLogo} disabled={isUploading}>
                {isUploading ? "Uploading..." : "Save Logo"}
              </button>
              <button className="cancel-btn" onClick={cancelLogoEdit} disabled={isUploading}>
                Cancel
              </button>
            </div>
          ) : (
            <button className="edit-btn" onClick={handleEditLogoClick}>
              Change Business Logo
            </button>
          )}
        </div>

        {/* Company Name */}
        <div className="input-group">
          <label>Business / Company Name</label>
          {isEditingName ? (
            <div className="edit-mode">
              <input
                onChange={(e) => setDisplayName(e.target.value)}
                type="text"
                value={displayName}
                autoFocus
              />
              <button className="update-btn" onClick={updateCompanyName}>Save</button>
              <button className="cancel-btn" onClick={() => setIsEditingName(false)}>Cancel</button>
            </div>
          ) : (
            <div className="view-mode">
              <p>{displayName || "Not Set"}</p>
              <button className="edit-btn" onClick={() => setIsEditingName(true)}>Edit</button>
            </div>
          )}
        </div>

        {/* Email */}
        <div className="input-group">
          <label>Email Address</label>
          {isEditingEmail ? (
            <div className="edit-mode">
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                value={email}
              />
              <button className="update-btn" onClick={updateEmailHandler}>Save</button>
              <button className="cancel-btn" onClick={() => setIsEditingEmail(false)}>Cancel</button>
            </div>
          ) : (
            <div className="view-mode">
              <p>{email}</p>
              <button className="edit-btn" onClick={() => setIsEditingEmail(true)}>Edit</button>
            </div>
          )}
        </div>

        {/* Password */}
        <div className="input-group">
          <label>Update Password</label>
          {isEditingPassword ? (
            <div className="edit-mode">
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter new password"
                value={password}
              />
              <button className="update-btn" onClick={updatePasswordHandler}>Update</button>
              <button className="cancel-btn" onClick={() => setIsEditingPassword(false)}>Cancel</button>
            </div>
          ) : (
            <div className="view-mode">
              <p>••••••••</p>
              <button className="edit-btn" onClick={() => setIsEditingPassword(true)}>Edit</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Setting;




