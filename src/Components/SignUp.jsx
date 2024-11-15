import React, { useState } from "react";
import Navbar from "./NavBar";
import supabase from "../supabaseClient";
import { useNavigate } from "react-router-dom";


const SignUp = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      let userID = data.user.id

      if(data.user){
        const {datas, error} = await supabase
        .from("users")
        .insert([
          {
            email: email,
            username: username,
            user_id: userID,
          },
        ])

        if (error) {
          console.error("Insert error:", error);
          throw new Error(error.message);
        } else{
          navigate("/");
        }
        console.log('User created and data inserted:', datas);
      }

   






      console.log("Succesful", data.user)
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  return (
    <div>
      <Navbar showLogin={false} />
      <div className="loginScreen-container">
        <h1>Create Account</h1>
        <div className="input-container">
          <form onSubmit={handleSignup} className="signupForm">
            <input
              type="text"
              placeholder="Email"
              className="email"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="Password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              className={`loginBtn ${isFormValid ? "active" : "inactive"}`}
              disabled={!isFormValid}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
