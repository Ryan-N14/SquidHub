import React, {useState} from "react";
import { Link } from "react-router-dom";
import "../styles/LoginScreen.css"
import supabase from "../supabaseClient";



const LoginScreen = ({closeLogin, handleLoginSucess}) => {
    const [Email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [passwordStatus, setPasswordStatus] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        console.log("logging")


        try{
            const {error: loginError} = await supabase.auth.signInWithPassword({
                email: Email,
                password,
            })


            if(loginError){
                setError("Invalid email or password")
                setPasswordStatus(true);
                console.error("Login error:", loginError.message);
            }else{
                handleLoginSucess();
                console.log("Successful login")
            }
        }catch(error){
            console.error("Unexpected error:", error.message);
        }finally{
            setLoading(false)
        }

    }

    const isFormValid = Email.trim() !== "" && password.trim() !== "";

    return(
        <div className="loginScreen-container">
            <div className="cancel-container">
                <img src="/images/cancel.png" alt="" className="cancelBtn" onClick={closeLogin} />
            </div>
            <div className="input-container">
                <form onSubmit={handleLogin}>
                    <input type="text" placeholder="Email" className="Email" required value={Email} onChange={(e) => setEmail(e.target.value)}/>
                    <input type="password" placeholder="password" className="Password" required value={password} onChange={(e) => setPassword(e.target.value)}/>

                    {passwordStatus && (
                        <p className="incorrecCred">Email or Password is incorrect</p>
                    )}

                    <p className="createAcc">Don't have an Account? <Link className="signup-link" to="/signup">Sign up</Link></p>
                    <button className={`loginBtn ${isFormValid ? "active" : "inactive"}`} disabled={!isFormValid}>{loading ? "Logging in..." : "Login"}</button>
                </form>
            </div>

        </div>
    )
}

export default LoginScreen