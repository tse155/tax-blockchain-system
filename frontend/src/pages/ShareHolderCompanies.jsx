import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api.js";
import "../styles/Home.css";

/* 
  logout function -> deleting localstorage
*/
function ShareHolderCompanies() {
  //To trigger a valid logout from home and
  const navigate = useNavigate();
  //companies -> empty array since it will retrieve all companies from the authenticated user
  const [user_name, setUserName] = useState("");
  const [user_id, setUserID] = useState(null);
  const [filteredCompanies, setFilteredCompanies] = useState([]);

  /*
        useEffect to get the users
    */
  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    if (user_id) {
      getCompanies();
    }
  }, [user_id]);

  /*
        function to get the companies
    */
  const getUserData = () => {
    //no need for ProtectedRoute usage since
    api
      .get("/api/userdata/")
      .then((response) => response.data)
      .then((data) => {
        setUserName(data.username), setUserID(data.id);
      })
      .catch((error) => alert(error));
  };
  /*
        function to get the companies
    */
  const getCompanies = () => {
    api
      .get("/api/company/")
      .then((response) => response.data)
      .then((data) => {
        const userCompanies = data.filter(
          (company) => company.incorporator === user_id
        );
        setFilteredCompanies(userCompanies);
      })
      .catch((error) => alert(error));
  };

  /*
        function to delete the companies
    */
  const companyDelete = (id) => {
    api
      .delete(`/api/company/delete/${id}/`)
      .then((result) => {
        if (result.status === 204) {
          alert("Company was deleted");
          getCompanies();
        } else {
          alert("Failed to delete note");
        }
      })
      .catch((error) => alert(error));
  };

  return (
    <div>
      <div className="form-container">
        <button onClick={() => navigate("/")} className="form-button">
          ← A Inicio
        </button>
      </div>
      <div>
        <h2>Hola, {user_name} Estas son tus Compañías</h2>
      </div>
      <div className="form-container">
        {filteredCompanies.length > 0 ? (
          <ul>
            {filteredCompanies.map((company) => (
              <li key={company.id}>
                <strong>{company.name}</strong> (RUC:{" "}
                {company.registration_number})
                <button
                  onClick={() => navigate(`/checkshares/${company.id}`)}
                  className="delete-button"
                >
                  Revisa tus acciones
                </button>
                <button
                  onClick={() => navigate(`/company/${company.id}/ledger`)} // ← Add this
                  className="form-button"
                >
                  📒 Ver libro de acciones
                </button>
                <button
                  onClick={() => companyDelete(company.id)}
                  className="delete-button"
                >
                  Borrar!!!!
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No encontré acciones. Crea una!!!!</p>
        )}
      </div>
      <div className="form-container">
        <button onClick={() => navigate("/createco")} className="form-button">
          Create Nueva Co.
        </button>
        <button onClick={() => navigate("/logout")} className="form-button">
          Cierra sesión
        </button>
      </div>
    </div>
  );
}

export default ShareHolderCompanies;
