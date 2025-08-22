import axios from "axios";

// Create an Axios instance with a base URL
const api = axios.create({
  baseURL: "http://localhost:3570/api/v1", // Your backend server URL
  withCredentials: true, // This is important for sending cookies
});

// --- User Authentication API Calls ---

export const registerUser = (userData) => {
  return api.post("/users/register", userData);
};

export const loginUser = (credentials) => {
  return api.post("/users/login", credentials);
};

export const getCurrentUser = () => {
  // We need to add the auth token to the headers for protected routes
  const token = localStorage.getItem("accessToken");
  return api.get("/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export default api;
