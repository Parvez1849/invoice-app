import React, { useState, useRef, useEffect } from "react";
import { storage, auth, db } from "../../firebase";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { updateProfile, updateEmail, updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import "./setting.css";

const Setting = () => {
  const fileInputRef = useRef(null);

  // Loading state
  const [isLoading, setLoading] = useState(true); // Initially true to show spinner on load

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

  // Simulate data fetching or other setup before loading is complete
  useEffect(() => {
    // Simulate async data fetching or other setup
    setTimeout(() => {
      setLoading(false); // Simulate that the page has loaded
    }, 1000); // Adjust delay as per the actual loading time
  }, []);

  // Update Company Name
  const updateCompanyName = async () => {
    try {
      await updateProfile(auth.currentUser, { displayName });
      localStorage.setItem("cName", displayName);
      await updateDoc(doc(db, "users", localStorage.getItem("uid")), { displayName });
      setIsEditingName(false); // Exit editing mode
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

  // Update Logo/Profile Picture
  const updateLogo = async () => {
    if (!file) return; // Ensure a file is selected

    const fileRef = ref(storage, `logos/${auth.currentUser.uid}/${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      "state_changed",
      null,
      (error) => console.error("Error uploading file:", error),
      async () => {
        const downloadedUrl = await getDownloadURL(fileRef);
        await updateProfile(auth.currentUser, { photoURL: downloadedUrl });
        localStorage.setItem("photoURL", downloadedUrl);
        setIsEditingLogo(false); // Exit editing mode
        window.location.reload(); // Reload after successful update
      }
    );
  };

  // Cancel Logo Editing and reload the page
  const cancelLogoEdit = () => {
    setFile(null);
    setIsEditingLogo(false); // Exit editing mode
    window.location.reload(); // Reload the page
  };

  // Handle clicking "Edit Profile Picture" to automatically open file input
  const handleEditLogoClick = () => {
    setIsEditingLogo(true);
    fileInputRef.current.click(); // Open file input dialog automatically
  };

  // Update Email
  const updateEmailHandler = () => {
    updateEmail(auth.currentUser, email)
      .then(() => {
        localStorage.setItem("email", email);
        alert("Email updated successfully!");
        setIsEditingEmail(false); // Exit editing mode
      })
      .catch((error) => {
        alert("Error updating email: " + error.message);
      });
  };

  // Update Password
  const updatePasswordHandler = () => {
    updatePassword(auth.currentUser, password)
      .then(() => {
        alert("Password updated successfully!");
        setIsEditingPassword(false); // Exit editing mode
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
        {/* Profile Picture Section */}
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
          />
          {isEditingLogo && file && (
            <div>
              <button className="update-btn" onClick={updateLogo}>
                Save
              </button>
              <button className="cancel-btn" onClick={cancelLogoEdit}>
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

        {/* Company Name */}
        <div className="input-group">
          <label>Company Name</label>
          {isEditingName ? (
            <>
              <input
                onChange={(e) => setDisplayName(e.target.value)}
                type="text"
                placeholder="Company Name"
                value={displayName}
              />
              <button className="update-btn" onClick={updateCompanyName}>
                Save
              </button>
              <button className="cancel-btn" onClick={() => setIsEditingName(false)}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <p>{displayName}</p>
              <button className="edit-btn" onClick={() => setIsEditingName(true)}>
                Edit
              </button>
            </>
          )}
        </div>

        {/* Update Email */}
        <div className="input-group">
          <label>Email</label>
          {isEditingEmail ? (
            <>
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email"
                value={email}
              />
              <button className="update-btn" onClick={updateEmailHandler}>
                Save
              </button>
              <button className="cancel-btn" onClick={() => setIsEditingEmail(false)}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <p>{email}</p>
              <button className="edit-btn" onClick={() => setIsEditingEmail(true)}>
                Edit
              </button>
            </>
          )}
        </div>

        {/* Update Password */}
        <div className="input-group">
          <label>New Password</label>
          {isEditingPassword ? (
            <>
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="New Password"
                value={password}
              />
              <button className="update-btn" onClick={updatePasswordHandler}>
                Save
              </button>
              <button className="cancel-btn" onClick={() => setIsEditingPassword(false)}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <p>********</p>
              <button className="edit-btn" onClick={() => setIsEditingPassword(true)}>
                Edit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Setting;


