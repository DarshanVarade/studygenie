import React, { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// A placeholder for your main application dashboard
function Dashboard({ user, onLogout }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome, {user.fullName}!</h1>
      <p>You are now logged in.</p>
      <button
        onClick={onLogout}
        className="px-4 py-2 mt-4 text-white bg-red-600 rounded-md hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  // Check if the user is already logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    const userData = localStorage.getItem("user");
    setUser(JSON.parse(userData));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
    setShowLogin(true); // Go back to login page on logout
  };

  if (isLoggedIn) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div>
      {showLogin ? (
        <LoginPage
          onSwitchToRegister={() => setShowLogin(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : (
        <RegisterPage onSwitchToLogin={() => setShowLogin(true)} />
      )}
    </div>
  );
}

export default App;
