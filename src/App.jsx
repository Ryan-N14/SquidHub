import {useState} from 'react'
import "./App.css";

import Navbar from "./Components/NavBar";
import LoginScreen from './Components/LoginScreen';


function App() {
  const [isLoggedIn, setLogout] = useState(false);
  const [showLoginScreen, setLoginScreen] = useState(false);

  const handleLogin = () =>{
    setLoginScreen(true)
  }

  const closeLogin = () => {
    setLoginScreen(false);
  }

  const loginSuccess = () => {
    setLogout(true)
    setLoginScreen(false);
  }


  return (
    <div>
      <Navbar isLoggedIn={isLoggedIn} handleLogin={handleLogin} showLogin={true}/>

      {showLoginScreen && (
        <LoginScreen closeLogin={closeLogin} handleLoginSucess={loginSuccess}/>
      )}
    </div>
  );
}

export default App;
