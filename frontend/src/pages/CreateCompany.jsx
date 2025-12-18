import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import api from "../api.js";
import "../styles/Home.css";

function CreateCompany() {
  //To trigger a valid logout from home and
  const navigate = useNavigate();

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
      .get("/api/userdata/")
      .then((response) => response.data)
      .then((data) => {
        setUserName(data.username),
          setUserType(data.condition),
          console.log(data.condition);
      })
      .catch((error) => alert(error));
  };

  /*
        state variables to create a new company
    */
  const [name, setName] = useState("");
  const [registration_number, setRN] = useState("");
  const [equity, setEquity] = useState(0);
  const [total_shares, setShares] = useState(0);
  const [net_assets, setAssets] = useState(0);
  const [net_liabilities, setLiabilities] = useState(0);
  const [other_equity, setOthEquity] = useState(0);
  const [retained_earnings, setEarnings] = useState(0);
  const [contract_address, setCA] = useState("");
  const [wallet_address, setWA] = useState("");

  /*
        function to create companies
    */
  const createCompany = (e) => {
    e.preventDefault();
    api
      .post("/api/company/", {
        name,
        registration_number,
        equity,
        total_shares,
        net_assets,
        net_liabilities,
        other_equity,
        retained_earnings,
        contract_address,
        wallet_address,
      })
      .then((response) => {
        if (response.status === 201) {
          alert("Company created");
          const companyId = response.data.id;
          navigate(`/deploy-contract/${companyId}`);
          //navigate(`/createshares/${response.data.id}`);
        } else {
          alert("Failed to create a Company");
        }
      })
      .catch((error) => alert(error));
  };

  return (
    <div>
      <div className="form-container">
        <button onClick={() => navigate("/")} className="form-button">
          ← Vuelve a Inicio
        </button>
      </div>
      <div>
        <h2>Hola, {user_name} abajo puedes crear una compañía:</h2>
      </div>
      <div>
        <form onSubmit={createCompany}>
          <label htmlFor="name">Nombre</label>
          <br />
          <input
            type="text"
            id="name"
            name="name"
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
          <label htmlFor="registration_number">RUC</label>
          <br />
          <input
            type="text"
            id="registration_number"
            name="registration_number"
            onChange={(e) => setRN(e.target.value)}
            value={registration_number}
          />
          <label htmlFor="equity">Capital Social</label>
          <br />
          <input
            type="number"
            id="equity"
            name="equity"
            onChange={(e) => {
              setEquity(e.target.value), setShares(e.target.value);
            }}
            value={equity}
          />
          <label htmlFor="net_assets">Activos netos</label>
          <br />
          <input
            type="number"
            id="net_assets"
            name="net_assets"
            onChange={(e) => setAssets(e.target.value)}
            value={net_assets}
          />
          <label htmlFor="net_liabilities">Pasivos Netos</label>
          <br />
          <input
            type="number"
            id="net_liabilities"
            name="net_liabilities"
            onChange={(e) => setLiabilities(e.target.value)}
            value={net_liabilities}
          />
          <label htmlFor="other_equity">Otras cuentas de patrimonio</label>
          <br />
          <input
            type="number"
            id="other_equity"
            name="other_equity"
            onChange={(e) => setOthEquity(e.target.value)}
            value={other_equity}
          />
          <label htmlFor="retained_earnings">Utilidades no Distrib. </label>
          <br />
          <input
            type="number"
            id="retained_earnings"
            name="retained_earnings"
            onChange={(e) => setEarnings(e.target.value)}
            value={retained_earnings}
          />
          <label htmlFor="contract_address"> Address del Smart Contract</label>
          <br />
          <input
            type="text"
            id="contract_address"
            name="contract_address"
            onChange={(e) => setCA(e.target.value)}
            value={contract_address}
          />
          <label htmlFor="wallet_address">Wallet Address</label>
          <br />
          <input
            type="text"
            id="wallet_address"
            name="wallet_address"
            onChange={(e) => setWA(e.target.value)}
            value={wallet_address}
          />
          <input type="submit" value="Submit" />
        </form>
      </div>
      <div className="form-container">
        <button
          onClick={() => navigate("/shareholdercos")}
          className="form-button"
        >
          Ver mis cos
        </button>
        <button onClick={() => navigate("/logout")} className="form-button">
          Cierra Sesión
        </button>
      </div>
    </div>
  );
}

export default CreateCompany;
