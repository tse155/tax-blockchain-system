import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";

/* 
    function to protect routes -> verify whether the user is authenticated. 
    Wrapper -> verifies that we have a valid jwt to access the route
*/

function ProtectedRoute({ children }) {
  /* 
        Check whether the user is authenticated. If not:
        We redirect the user to the login page
    */

  //Ceation of state variables and state functions
  const [isAuthorized, setIsAuthorized] = useState(null);

  /* 
        useEffect function implementation
    */
  useEffect(() => {
    //we'll call the auth function to verify authentication first
    //since auth is async the loading effect will be triggered nonetheless since isAuthorized will be null during the execution
    auth().catch((error) => {
      //login details of the error
      console.error("Authentication failed:", error);
      //setting isAuthorized to false -> due to authentication error
      setIsAuthorized(false);
    });
  }, []);

  /* 
        Function to generate a refresh token
        It is called by auth -> whenever the refresh token expired. 

    */
  const refreshToken = async () => {
    //first: retrieve the refresh jwt token from local storage
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    try {
      //send a request to my backend with the refresh token to obtain a new valid token
      //including the reresh token as a payload
      //The header is determined by api constant so the following modifies the request's body- not the header request
      const response = await api.post("/api/token/refresh/", {
        refresh: refreshToken,
      });

      if (response.status === 200) {
        //all HTTP responses have a status attribute as well as a body-> in thsi case, its named data
        localStorage.setItem(ACCESS_TOKEN, response.data.access);
        //we set IsAuthorized to true
        setIsAuthorized(true);
      } else {
        //this will redirect the user to the /login endpoint of the api
        setIsAuthorized(false);
      }
    } catch (error) {
      console.log("Refresh error:", error);
      //this will trigger a rerender as well as navigation -> /login
      //user must authenticate
      setIsAuthorized(false);
      throw error; // ← Re-throw so auth() knows it failed
    }
  };

  /* Auth function 
        -> check if we have a valid jwt -> it expired or not?
        -> if it expired -> the jwt token will be automatically refreshed
        If refreshing the token is not possible or it expired for good -> 
                redirect to login
    */
  const auth = async () => {
    //1) Check whether we have an access token -> browser'2§w§§§§§22w§s localStorage
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      //if there is no token we will update the state variable and return

      setIsAuthorized(false);
      return;
    }
    //else: we have a token -> we have to decode it
    const decoded = jwtDecode(token);
    const tokenExpiration = decoded.exp;
    const now = Date.now() / 1000; //-> to get the date in seconds

    if (tokenExpiration < now) {
      //the token expiration was before now -> we need to refres
      await refreshToken();
    } else {
      // the token's expiration date is after now -> no refresh needed
      //Token is valid (for frontend purposes)
      setIsAuthorized(true);
    }
  };

  //Logic
  if (isAuthorized === null) {
    //Until the state variable changes -> and therefore triggers a rerender
    //We just return loading.
    //Since othe functions are a
    return <div>Loading ....</div>;
  }

  //Return the children -> if isAuthorized is True
  //Else: we sent the user to the login page
  if (isAuthorized) {
    return children;
  } else {
    //isAuthorized == false
    return <Navigate to="/login" />;
  }
}

export default ProtectedRoute;
