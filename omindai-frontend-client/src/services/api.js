import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

export const login = async (username, password) => {
  return api.post("/login", { username, password });
};

export const signup = async (username, password) => {
  return api.post("/signup", { username, password });
};

export const logout = async () => {
  return api.post("/logout");
};

export const getProfile = async () => {
  return api.get("/profile");
};
