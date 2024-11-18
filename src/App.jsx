import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

import "./App.css";

import Navbar from "./Components/NavBar";
import HomePage from "../pages/HomePage";
import CreatePost from "../pages/CreatePost";
import LoginScreen from "./Components/LoginScreen";
import SignUp from "./Components/SignUp";

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

 

  return (
    <BrowserRouter>
      <Navbar session={session} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={!session ? <LoginScreen /> : <Navigate to="/" replace />}
        />

        <Route path="/create-post" element={<CreatePost />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
