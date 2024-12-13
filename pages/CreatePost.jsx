import React, {useState} from "react";
import { supabase } from "../src/supabaseClient"; 
import "../src/styles/CreatePost.css";
import { useEffect } from "react";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState(null);





  useEffect(() => {
    // Fetch the authenticated user's ID
    const fetchUserId = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
      } else {
        console.log("createpost", user?.id)
        setUserId(user?.id);
      }
    };

    fetchUserId();
  }, []);



  const handlePost = async (e) => {
    e.preventDefault();
    if(!title || !content){
      alert("fill in all fields");
      return
    }


    try {
      const { data, error } = await supabase
        .from("post")
        .insert([{ title: title, content: content, user_id:userId}]);
      
      
      if (error) {
        console.error("Error creating post:", error.message);
      } else {
        console.log("Posted:", data);
        alert("success!");
      }


     

    }catch(error){
      console.error(error)

    }
  }


  return (
    <>
      <div className="CreatePost-container">
        <div className="Outside-form-container">
          <form className="post-container" action="">
            <input type="text" placeholder="Title" className="createTitle" onChange={(e) => setTitle(e.target.value)}/>
            <input type="text" placeholder="Content" className="createContent" onChange={(e) => setContent(e.target.value)}/>

            <button className="CreatePostBtn" onClick={handlePost}>Post</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreatePost;
