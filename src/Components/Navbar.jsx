import React from "react";
import "../styles/Navbar.css";
import { Link } from "react-router-dom";

const Navbar = ({ isLoggedIn, handleLogin, showLogin }) => {
  return (
    <nav>
      <div className="logo-container">
        <h1 className="logo">SquidHub</h1>
      </div>

      <div className="navigation-container">
        <h1 className={`Home ${showLogin ? "active" : "inactive"}`}><Link className="login-link" to="/">Home</Link></h1>
        {isLoggedIn ? (
          <>
            <Link><button className="account-button">Create post</button></Link>
          </>
        ) : (
          showLogin && (
            <button className="account-button" onClick={handleLogin}>
              Login
            </button>
          )
        )}
      </div>
    </nav>
  );
};

export default Navbar;
