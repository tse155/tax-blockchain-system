import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api.js";
import "../styles/Home.css";

function CheckShares() {
  const navigate = useNavigate();
  const { company_id } = useParams();

  const [user_name, setUserName] = useState("");
  const [user_id, setUserID] = useState(null);
  const [company_name, setCoName] = useState(null);
  const [shares, setShares] = useState([]); // ← Array, not single object
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    if (user_id) {
      getCompany();
    }
  }, [user_id]);

  useEffect(() => {
    if (company_name) {
      getShares();
    }
  }, [company_name]);

  const getUserData = () => {
    api
      .get("/api/userdata/")
      .then((response) => response.data)
      .then((data) => {
        setUserName(data.username);
        setUserID(data.id);
      })
      .catch((error) => alert(error));
  };

  const getCompany = () => {
    api
      .get("/api/company/")
      .then((response) => response.data)
      .then((data) => {
        const company = data.find(
          (company) => company.id === Number(company_id)
        );
        setCoName(company.name);
      })
      .catch((error) => alert(error));
  };

  const getShares = () => {
    api
      .get("/api/shares/")
      .then((response) => response.data)
      .then((data) => {
        // ✅ Use filter() to get ALL shares
        const userShares = data.filter(
          (share) =>
            share.company === Number(company_id) &&
            share.shareholder === user_id
        );
        setShares(userShares);
        setIsLoading(false);
      })
      .catch((error) => {
        alert(error);
        setIsLoading(false);
      });
  };

  return (
    <div>
      <div className="form-container">
        <button onClick={() => navigate("/home")} className="form-button">
          ← Back to Home
        </button>
      </div>

      <div>
        <h2>
          Hey, {user_name}! Your shares in {company_name}
        </h2>
      </div>

      <div className="form-container">
        {isLoading ? (
          <p>LOADING....</p>
        ) : shares.length > 0 ? (
          <ul>
            {shares.map((share) => (
              <li key={share.id}>
                <strong>Share #{share.share_number}</strong>
                <p>VPP: ${share.share_vpp}</p>
                <p>Acquisition Price: ${share.acquisition_price}</p>
                <p>Tax Base: ${share.tax_deductible_base}</p>
                <button
                  onClick={() => navigate(`/sharetransfer/${share.id}`)}
                  className="delete-button"
                >
                  Transfer This Share
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No shares found for this company.</p>
        )}
      </div>

      <div className="form-container">
        <button
          onClick={() => navigate("/shareholdercos")}
          className="form-button"
        >
          View My Companies
        </button>
        <button onClick={() => navigate("/logout")} className="form-button">
          Logout
        </button>
      </div>
    </div>
  );
}

export default CheckShares;
