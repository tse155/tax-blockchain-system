import { Navigate } from "react-router-dom";

/* 
  logout function -> deleting localstorage
*/
function Logout() {
  //clearing localstorage -> tokens should be cleared since previous authentication should not be valid
  localStorage.clear();
  return <Navigate to="/login" />;
}

export default Logout;
