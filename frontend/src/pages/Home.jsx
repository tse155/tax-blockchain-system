import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import api from "../api.js";
import "../styles/Home.css";

function Home() {
  //To trigger a valid logout from home and
  const navigate = useNavigate();

  //functions and state variables to get an authorized request with all of the notes we already created

  //companies -> empty array since it will retrieve all companies from the authenticated user
  const [user_name, setUserName] = useState("");
  const [user_type, setUserType] = useState("");

  /*
        useEffect to get the companies
    */
  useEffect(() => {
    getUserData();
  }, []);

  /*
        function to get the companies
    */
  const getUserData = () => {
    //no need for ProtectedRoute usage since
    api
      .get("/api/userdata")
      .then((response) => response.data)
      .then((data) => {
        setUserName(data.username),
          setUserType(data.condition),
          console.log(data.condition);
      })
      .catch((error) => alert(error));
  };

  return (
    <div>
      <div className="form-container">
        <button onClick={() => navigate("/")} className="form-button">
          ← Volver al principal
        </button>
      </div>
      <div>
        <h2>Hola, {user_name}</h2>
      </div>
      <div className="form-container">
        {user_type === "shareholder" && (
          <div>
            <p>Selecciona entre las siguientes opciones</p>
            <button
              onClick={() => navigate("/shareholdercos")}
              className="form-button"
            >
              Revisa tus Cos.
            </button>
            <button
              onClick={() => navigate("/createco")}
              className="form-button"
            >
              Crea una Co.
            </button>
            <button
              onClick={() => navigate("/sharesowned")}
              className="form-button"
            >
              Revisa tus acciones
            </button>
            <button
              onClick={() => navigate("/shareholdertaxdue")}
              className="form-button"
            >
              Revisa los impuestos que adeudas
            </button>
          </div>
        )}
        {user_type === "authority" && (
          <div>
            <p>Selecciona entre las siguientes opciones</p>
            <button
              onClick={() => navigate("/authorityview")}
              className="form-button"
            >
              Transferencias y acciones
            </button>
            <button
              onClick={() => navigate("/authoritycompanies")}
              className="form-button"
            >
              Revisa cualquier Co.
            </button>
          </div>
        )}
      </div>

      <div className="form-container">
        <p>Cerrar sesión?</p>
        <button onClick={() => navigate("/logout")} className="form-button">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Home;
