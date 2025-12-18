import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api.js";
import "../styles/Home.css";

function CreateShares() {
  //retrieving the path's id
  const { company_id } = useParams();

  //To trigger a valid logout from home and
  const navigate = useNavigate();

  //companies -> empty array since it will retrieve all companies from the authenticated user
  const [user_name, setUserName] = useState(null);

  /*
        state variables to create new shares
    */
  const [quantity, setQuantity] = useState(null);
  const [share_vpp, setVpp] = useState(null);

  //other variables
  const nominal_value = 1.0;
  const acquisition_price = nominal_value;

  //UX variables and shares information
  const [loading, setLoading] = useState(true);
  const [shareInfo, setShareInfo] = useState("");

  /*
        useEffect to get the userdata
    */
  useEffect(() => {
    getUserData();
  }, []);

  /*
        useEffect to get number of shares
    */

  useEffect(() => {
    if (user_name) {
      getShares();
    }
  }, [user_name]);

  /*
        useEffect to get the vpp
    */

  useEffect(() => {
    if (quantity) {
      getVpp();
    }
  }, [quantity]);

  /*
        useEffect to create shares
    */

  useEffect(() => {
    if (share_vpp) {
      createShares();
    }
  }, [share_vpp]);

  /*
        function to get the companies
    */
  const getUserData = () => {
    //no need for ProtectedRoute usage since
    api
      .get("/api/userdata/")
      .then((response) => response.data)
      .then((data) => {
        setUserName(data.username);
      })
      .catch((error) => alert(error));
  };

  /*
        function to get the companies
    */
  const getShares = () => {
    api
      .get("/api/company/")
      .then((response) => response.data)
      .then((data) => {
        const createdCompany = data.find(
          (company) => company.id === Number(company_id)
        );
        setQuantity(createdCompany.total_shares);
      })
      .catch((error) => alert(error));
  };

  /*
        function to get the companies
    */
  const getVpp = () => {
    api
      .get(`/api/company/${company_id}/calculate-vpp/`)
      .then((response) => response.data)
      .then((data) => {
        console.log(data);
        setVpp(data.new_vpp);
      })
      .catch((error) => alert(error));
  };

  /*
        function to create shares
    */
  const createShares = () => {
    api
      .post("/api/shares/bulk-create/", {
        company_id,
        quantity,
        share_vpp,
        nominal_value,
        acquisition_price,
      })
      .then((response) => {
        if (response.status === 201) {
          setLoading(false);
          alert(
            `✅ ${response.data.message}\nRange: ${response.data.share_range}`
          );
          setShareInfo(response.data.share_range);
        } else {
          alert("Failed to create shares");
        }
      })
      .catch((error) => alert(error));
  };

  return (
    <div>
      <div className="form-container">
        <button onClick={() => navigate("/")} className="form-button">
          ← Inicio
        </button>
      </div>
      <div>
        <h2>
          Hola, {user_name} Tus acciones se generarán en unos pocos minutos:
        </h2>
      </div>
      <div className="form-container">
        {loading === true && <p>LOADING ....</p>}
        {loading === false && (
          <div>
            <p>{shareInfo}</p>
            <button
              onClick={() => navigate(`/mintshares/${company_id}`)}
              style={{
                backgroundColor: "#2196F3",
                color: "white",
                padding: "15px 30px",
                fontSize: "1.1em",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Next: Mint tus Acciones →
            </button>
          </div>
        )}
      </div>

      <div className="form-container">
        <button
          onClick={() => navigate("/shareholdercos")}
          className="form-button"
        >
          Ver mis COs.
        </button>
        <button onClick={() => navigate("/logout")} className="form-button">
          Logout
        </button>
      </div>
    </div>
  );
}

export default CreateShares;
