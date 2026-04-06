import React, { useState, useRef, useEffect } from "react";
import { auth, db } from "../../firebase"; // storage ko hata diya
import { updateProfile, updateEmail, updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import "./setting.css";

const Setting = () => {
  const fileInputRef = useRef(null);

  // Loading state
  const [isLoading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false); // Uploading state

  // Edit state handlers
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
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Update Company Name
  const updateCompanyName = async () => {
    try {
      await updateProfile(auth.currentUser, { displayName });
      localStorage.setItem("cName", displayName);
      await updateDoc(doc(db, "users", localStorage.getItem("uid")), { displayName });
      setIsEditingName(false);
    } catch (error) {
      console.error("Error updating company name:", error.message);
    }
  };

  // File selection handler
  const onSelectFile = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  // --- 🔥 LOGIC CHANGED: Firebase Storage ki jagah Cloudinary use kiya ---
  const updateLogo = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      // 1. Cloudinary upload call
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.secure_url) {
        const newPhotoURL = data.secure_url;

        // 2. Auth profile update
        await updateProfile(auth.currentUser, { photoURL: newPhotoURL });

        // 3. Firestore update
        await updateDoc(doc(db, "users", localStorage.getItem("uid")), {
          photoURL: newPhotoURL
        });

        // 4. Local Storage update
        localStorage.setItem("photoURL", newPhotoURL);
        
        alert("Logo updated successfully!");
        setIsEditingLogo(false);
        setFile(null);
        window.location.reload(); 
      } else {
        alert("Upload failed: " + (data.error?.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      alert("Something went wrong!");
    } finally {
      setIsUploading(false);
    }
  };

  const cancelLogoEdit = () => {
    setFile(null);
    setIsEditingLogo(false);
    window.location.reload();
  };

  const handleEditLogoClick = () => {
    setIsEditingLogo(true);
    fileInputRef.current.click();
  };

  const updateEmailHandler = () => {
    updateEmail(auth.currentUser, email)
      .then(() => {
        localStorage.setItem("email", email);
        alert("Email updated successfully!");
        setIsEditingEmail(false);
      })
      .catch((error) => {
        alert("Error updating email: " + error.message);
      });
  };

  const updatePasswordHandler = () => {
    updatePassword(auth.currentUser, password)
      .then(() => {
        alert("Password updated successfully!");
        setIsEditingPassword(false);
      })
      .catch((error) => {
        alert("Error updating password: " + error.message);
      });
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <i style={{ fontSize: "24px" }} className="fa-solid fa-spinner fa-spin"></i> Loading....
      </div>
    );
  }

  return (
    <div className="settings-container">
      <h1>Settings</h1>
      <div className="settings-wrapper">
        <div className="profile-section">
          <img
            onClick={handleEditLogoClick}
            className="profile-pic"
            alt="profile-pic"
            src={imageUrl}
          />
          <input
            onChange={onSelectFile}
            style={{ display: "none" }}
            type="file"
            ref={fileInputRef}
            accept="image/*"
          />
          {isEditingLogo && file && (
            <div>
              <button className="update-btn" onClick={updateLogo} disabled={isUploading}>
                {isUploading ? "Saving..." : "Save"}
              </button>
              <button className="cancel-btn" onClick={cancelLogoEdit} disabled={isUploading}>
                Cancel
              </button>
            </div>
          )}
          {!file && (
            <button className="edit-btn" onClick={handleEditLogoClick}>
              {isEditingLogo ? "Select logo" : "Edit Profile Logo"}
            </button>
          )}
        </div>

        <div className="input-group">
          <label>Company Name</label>
          {isEditingName ? (
            <>
              <input
                onChange={(e) => setDisplayName(e.target.value)}
                type="text"
                value={displayName}
              />
              <button className="update-btn" onClick={updateCompanyName}>Save</button>
              <button className="cancel-btn" onClick={() => setIsEditingName(false)}>Cancel</button>
            </>
          ) : (
            <>
              <p>{displayName}</p>
              <button className="edit-btn" onClick={() => setIsEditingName(true)}>Edit</button>
            </>
          )}
        </div>

        <div className="input-group">
          <label>Email</label>
          {isEditingEmail ? (
            <>
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                value={email}
              />
              <button className="update-btn" onClick={updateEmailHandler}>Save</button>
              <button className="cancel-btn" onClick={() => setIsEditingEmail(false)}>Cancel</button>
            </>
          ) : (
            <>
              <p>{email}</p>
              <button className="edit-btn" onClick={() => setIsEditingEmail(true)}>Edit</button>
            </>
          )}
        </div>

        <div className="input-group">
          <label>New Password</label>
          {isEditingPassword ? (
            <>
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                value={password}
              />
              <button className="update-btn" onClick={updatePasswordHandler}>Save</button>
              <button className="cancel-btn" onClick={() => setIsEditingPassword(false)}>Cancel</button>
            </>
          ) : (
            <>
              <p>********</p>
              <button className="edit-btn" onClick={() => setIsEditingPassword(true)}>Edit</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Setting;




