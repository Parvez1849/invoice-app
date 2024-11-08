import React, { useState } from "react";
import "./login.css";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(""); // State to store error messages

    const navigate = useNavigate();

    const submitHandler = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(""); // Reset error message before submitting

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log(user);
                localStorage.setItem("cName", user.displayName);
                localStorage.setItem("photoURL", user.photoURL);
                localStorage.setItem("email", user.email);
                localStorage.setItem("uid", user.uid);
                navigate("/dashboard");
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
                
                switch (error.code) {
                    case "auth/user-not-found":
                        setError("Gmail is not registered.");
                        break;
                    case "auth/wrong-password":
                        setError("Incorrect password.");
                        break;
                    case "auth/invalid-email":
                        setError("Invalid Gmail address.");
                        break;
                    default:
                        setError("An unknown error occurred. Please enter a correct password or Gmail.");
                        break;
                }
                console.log(error);
            });
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <div className="login-boxes login-left"></div>
                <div className="login-boxes login-right">
                    <h2 className="login-heading">Login</h2>
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
                            onChange={(e) => setPassword(e.target.value)}
                            className="login-input"
                            type="password"
                            placeholder="Password"
                        />
                        <button
                            className="login-input login-btn"
                            type="submit"
                        >
                            {isLoading && (
                                <i className="fa-solid fa-circle-notch fa-spin"></i>
                            )}
                            Submit
                        </button>
                    </form>
                    {error && <p className="error-message">{error}</p>}
                    <Link to="/register" className="register-link">
                        Create an Account
                    </Link>
                    <p>OR</p>
                    <Link to="/forgetpass" className="register-link">
                        Forgot Password
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
