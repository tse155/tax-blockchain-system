import { createContext, useState, useEffect } from "react";
import api from "../api";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({ username: "", condition: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/userdata")
      .then((response) => {
        setUser({
          username: response.data.username,
          condition: response.data.condition,
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};
