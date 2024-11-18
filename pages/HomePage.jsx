import React, { useState, useEffect } from "react";
import { supabase } from "../src/supabaseClient";
import "../src/styles/HomePage.css";

const HomePage = () => {
  const [post, setPost] = useState([]);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch posts first
        const { data: postData, error: postError } = await supabase
          .from("post")
          .select("*");

        if (postError) {
          throw postError;
        }
        
        setPost(postData || []);

        // Then fetch user data
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        // If we have a user, fetch their username
        if (currentUser && sessionStorage.getItem("user_id")) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("username")
            .eq("user_id", sessionStorage.getItem("user_id"))
            .single();

          if (userError) {
            console.error("Error fetching username:", userError);
          } else if (userData) {
            setUsername(userData.username);
          }
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem("user_id");
    setUser(null);
    setUsername("");
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <main className="home-main">
      <div className="Post-container">
        <div className="postCard-container">
          {post.length > 0 ? (
            post.map((post) => (
              <div key={post.id} className="postCard">
                <h1 className="postTitle">{post.title}</h1>
                <p>11 Upvotes</p>
              </div>
            ))
          ) : (
            <p>No posts available</p>
          )}
        </div>

        {user && (
          <div className="user-container">
            <h2>Hello, {username}!</h2>
            <p>Likes: 20</p>
            <button className="SignoutBtn" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default HomePage;
