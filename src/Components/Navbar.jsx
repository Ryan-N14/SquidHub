import React from "react";
import "../styles/Navbar.css";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Navbar = ({session}) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem("user_id");
  };

  return (
    <nav>
      <div className="logo-container">
        <h1 className="logo">SquidHub</h1>
      </div>

      <div className="navigation-container">
        <h1><Link className="login-link" to="/">Home</Link></h1>
        {session ? (
          <>
            <Link to="/create-post"><button className="account-button">Create post</button></Link>
          </>
        ) : (
            <Link to="/login">
            <button className="account-button">
              Login
            </button>
            </Link>
          
        )}
      </div>
    </nav>
  );
};

export default Navbar;
