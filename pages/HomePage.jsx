import React, { useState, useEffect } from "react";
import { supabase } from "../src/supabaseClient";
import { useNavigate } from "react-router-dom";
import "../src/styles/HomePage.css";

const HomePage = () => {
  const [post, setPost] = useState([]);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortByUpvotes, setSortByUpvotes] = useState(false);
  const [sortByTime, setSortByTime] = useState(false);

  const navigate = useNavigate();

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
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        setUser(currentUser);

        // If we have a user, fetch their username
        if (currentUser) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("username")
            .eq("user_id", currentUser.id)
            .single();

          if (userError) {
            console.error("Error fetching username:", userError);
          } else if (userData) {
            console.log("data", userData);
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

  useEffect(() => {
    // Filter posts based on the search query
    let results = post.filter(post =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortByUpvotes) {
      results = results.sort((a, b) => b.upvotes - a.upvotes);
    }else if (sortByTime) {
      results = results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    setFilteredPosts(results);
  }, [searchQuery, post, sortByUpvotes, sortByTime]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleSortByUpvotes = () => {
    setSortByUpvotes(prev => !prev);
  };

  const toggleSortByTime = () => {
    setSortByTime(prev => !prev);
    setSortByUpvotes(false); // Disable upvotes sorting when time sorting is enabled
  };

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

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  const timeSince = (timestamp) => {
    const now = new Date();
    const createdAt = new Date(timestamp);
    const seconds = Math.floor((now - createdAt) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} year${interval > 1 ? "s" : ""} ago`;

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} month${interval > 1 ? "s" : ""} ago`;

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval > 1 ? "s" : ""} ago`;

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval > 1 ? "s" : ""} ago`;

    interval = Math.floor(seconds / 60);
    if (interval >= 1)
      return `${interval} minute${interval > 1 ? "s" : ""} ago`;

    return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
  };

  return (
    <main className="home-main">
      <div className="searchbar-container">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="searchbar"
        ></input>
      </div>
      <button onClick={toggleSortByUpvotes} className="sortUpvote">
        {sortByUpvotes ? "Sort by Default" : "Sort by Upvotes"}
      </button>
      <button onClick={toggleSortByTime} className="sortTime">
        {sortByTime ? "Sort by Default" : "Sort by Time"}
      </button>
      <div className="Post-container">
        <div className="postCard-container">
          {post.length > 0 ? (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className="postCard"
                onClick={() => handlePostClick(post.id)}
              >
                <p>{timeSince(post.created_at)}</p>
                <h1 className="postTitle">{post.title}</h1>
                <p className="upvotes-para">{post.upvotes} Upvotes</p>
              </div>
            ))
          ) : (
            <p>No posts available</p>
          )}
        </div>

        {user && (
          <div className="user-container">
            <h2>Hello, {username}!</h2>
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
