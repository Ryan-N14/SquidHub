import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../src/supabaseClient";
import "../src/styles/ContentPage.css";

const ContentPage = () => {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(null);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [user, setUser] = useState(null);
  const [usernames, setUsernames] = useState({});

  //States for editing and deleting post
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  //states for comments
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const getPost = async () => {
      try {
        const numericId = parseInt(id); // Convert to number

        // Get current user
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        setUser(currentUser);

        //getting post content
        const { data: postData, error: postError } = await supabase
          .from("post")
          .select("*")
          .eq("id", numericId); // Use numeric ID

        if (postError) {
          console.error(postError);
        } else {
          console.log(postData[0]);
          setContent(postData[0]);
          setUpvoteCount(postData[0].upvotes || 0);
          setIsOwner(currentUser?.id === postData[0].user_id);
          console.log("successfully grabbed data", postData[0]);
        }

        if (currentUser) {
          const { data: upvoteData, error: upvoteError } = await supabase
            .from("upvotes")
            .select("*")
            .eq("post_id", numericId) // Use numeric ID
            .eq("user_id", currentUser.id);

          if (upvoteError && upvoteError.code !== "PGRST116") {
            console.error(upvoteError);
          } else {
            setHasUpvoted(upvoteData.length > 0);
          }
        }

        //Grabbign comments
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select(
            `
          id,
          content,
          created_at,
          user_id
        `
          )
          .eq("post_id", numericId)
          .order("created_at", { ascending: false });
        if (commentsError) {
          console.error("Error fetching comments:", commentsError);
        } else {
          setComments(commentsData);

          // Fetch usernames for all unique user IDs
          const uniqueUserIds = [
            ...new Set(commentsData.map((comment) => comment.user_id)),
          ];
          if (postData[0]?.user_id) {
            uniqueUserIds.push(postData[0].user_id);
          }
          await fetchUsernames(uniqueUserIds);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    getPost();
  }, [id, navigate]);

  // New function to fetch usernames
  const fetchUsernames = async (userIds) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, username")
        .in("id", userIds);

      if (error) throw error;

      const usernameMap = {};
      data.forEach((user) => {
        usernameMap[user.id] = user.username;
      });

      setUsernames(usernameMap);
    } catch (err) {
      console.error("Error fetching usernames:", err);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      alert("You must be logged in to upvote.");
      return;
    }

    if (hasUpvoted) {
      alert("You've already upvoted this post.");
      return;
    }

    try {
      const numericId = parseInt(id);

      // First get the current post data
      const { data: currentPost, error: fetchError } = await supabase
        .from("post")
        .select("upvotes")
        .eq("id", numericId);

      if (fetchError || !currentPost || currentPost.length === 0) {
        console.error("Error fetching post:", fetchError);
        return;
      }

      // Update the post
      const { data: updatedPost, error: upvoteError } = await supabase
        .from("post")
        .update({
          upvotes: (currentPost[0].upvotes || 0) + 1,
        })
        .eq("id", numericId)
        .select();

      if (upvoteError) {
        console.error("Error updating post:", upvoteError);
        return;
      }

      // Insert upvote record
      const { error: userUpvoteError } = await supabase.from("upvotes").insert({
        post_id: numericId,
        user_id: user.id,
      });

      if (userUpvoteError) {
        console.error("Error tracking user upvote:", userUpvoteError);
        return;
      }

      // Update local state
      setUpvoteCount((prev) => prev + 1);
      setHasUpvoted(true);
    } catch (err) {
      console.error("Error upvoting the post:", err);
    }
  };

  //Handle post update
  const handleUpdatePost = async (e) => {
    e.preventDefault();

    if (!user || !isOwner) {
      alert("You don't have permission to edit this post.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("post")
        .update({
          title: editedTitle || content.title,
          content: editedContent || content.content,
        })
        .eq("id", parseInt(id))
        .select()
        .single();

      if (error) throw error;

      setContent(data);
      setIsEditing(false);
      alert("Post updated successfully!");
    } catch (err) {
      console.error("Error updating post:", error);
      alert("Failed to update post. Please try again.");
    }
  };

  //handle delete post
  const handleDeletePost = async () => {
    if (!user || !isOwner) {
      alert("You don't have permission to delete this post.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("post")
        .delete()
        .eq("id", parseInt(id));

      if (error) throw error;

      navigate("/"); // Navigate back to home page after deletion
      alert("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  // Comment submission handler
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to comment.");
      return;
    }

    if (!newComment.trim()) {
      alert("Comment cannot be empty.");
      return;
    }

    setSubmittingComment(true);

    try {
      const { data: comment, error } = await supabase
        .from("comments")
        .insert([
          {
            content: newComment.trim(),
            post_id: parseInt(id),
            user_id: user.id,
          },
        ])
        .select(
          `
          id,
          content,
          created_at,
          user_id
        `
        )
        .single();

      if (error) throw error;

      if (!usernames[user.id]) {
        await fetchUsernames([user.id]);
      }

      setComments([comment, ...comments]);
      setNewComment("");
    } catch (error) {
      console.error("Error inserting comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) return <p>Loading content...</p>;
  if (!content) return <p>Post not found</p>;

  return (
    <main className="content-container">
      <div className="postContent-container">
        {isEditing ? (
          <form onSubmit={handleUpdatePost} className="edit-form">
            <div className="form-group">
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="edit-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="content">Content:</label>
              <textarea
                id="content"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="edit-textarea"
              />
            </div>
            <div className="edit-buttons">
              <button type="submit" className="save-btn">
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="post-header">
              <div className="title-container">
                <h1>{content.title}</h1>
              </div>
            </div>
            <div className="content-container">
              <p>{content.content}</p>
            </div>
          </>
        )}

        <div className="upvote-container">
          <p>{upvoteCount} upvotes</p>
          <button
            onClick={handleUpvote}
            disabled={hasUpvoted}
            className="upvoteBtn"
          >
            {hasUpvoted ? "Upvoted" : "Upvote"}
          </button>
        </div>

        <div className="EditBtn-container">
          {isOwner && (
            <div className="post-actions">
              <button onClick={() => setIsEditing(true)} className="edit-btn">
                Edit Post
              </button>
              <button onClick={handleDeletePost} className="delete-btn">
                Delete Post
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="comment-container">
        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            disabled={!user || submittingComment}
            className="comment-input"
          />
          <button
            type="submit"
            disabled={!user || submittingComment || !newComment.trim()}
            className="comment-submit-btn"
          >
            {submittingComment ? "Posting..." : "Post Comment"}
          </button>
        </form>

        {/* Comments List */}
        <div className="comments-list">
          {comments.length === 0 ? (
            <p>No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-author">
                    {comment.user_id === user?.id
                      ? "You "
                      : usernames[comment.user_id] ||
                        `User ${comment.user_id.slice(0, 8)}`}
                  </span>
                  <span className="comment-date">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="comment-content">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default ContentPage;
