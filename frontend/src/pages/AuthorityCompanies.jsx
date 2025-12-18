import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api.js";
import "../styles/Home.css";

function AuthorityCompanies() {
  const navigate = useNavigate();
  const [user_name, setUserName] = useState("");
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUserData();
    getAllCompanies();
  }, []);

  const getUserData = () => {
    api
      .get("/api/userdata/")
      .then((response) => response.data)
      .then((data) => setUserName(data.username))
      .catch((error) => alert(error));
  };

  const getAllCompanies = () => {
    api
      .get("/api/company/")
      .then((response) => response.data)
      .then((data) => {
        setCompanies(data);
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
        <h2>Authority View: All Companies</h2>
        <p>Viewing as: {user_name}</p>
      </div>

      <div className="form-container">
        {isLoading ? (
          <p>LOADING....</p>
        ) : companies.length > 0 ? (
          <ul>
            {companies.map((company) => (
              <li
                key={company.id}
                style={{
                  border: "2px solid #4CAF50",
                  padding: "15px",
                  marginBottom: "15px",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <h3>{company.name}</h3>

                <div style={{ marginTop: "10px" }}>
                  <p>
                    <strong>RUC:</strong> {company.registration_number}
                  </p>
                  <p>
                    <strong>Incorporator:</strong> {company.incorporator_name}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(company.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px",
                    backgroundColor: "#e8f5e9",
                    borderRadius: "5px",
                  }}
                >
                  <h4>📊 Financial Information</h4>
                  <p>
                    <strong>Total Shares Authorized:</strong>{" "}
                    {company.total_shares}
                  </p>
                  <p>
                    <strong>Shares Issued:</strong>{" "}
                    {company.total_shares_issued}
                  </p>
                  <p>
                    <strong>Current VPP:</strong> $
                    {company.vpp ? company.vpp.toFixed(2) : "N/A"}
                  </p>
                  <p>
                    <strong>Equity:</strong> ${company.equity.toLocaleString()}
                  </p>
                  <p>
                    <strong>Net Assets:</strong> $
                    {company.net_assets.toLocaleString()}
                  </p>
                  <p>
                    <strong>Net Liabilities:</strong> $
                    {company.net_liabilities.toLocaleString()}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px",
                    backgroundColor: "#fff3e0",
                    borderRadius: "5px",
                  }}
                >
                  <h4>🔗 Blockchain Info</h4>
                  <p>
                    <strong>Contract Address:</strong>{" "}
                    {company.contract_address || "Not deployed"}
                  </p>
                  <p>
                    <strong>Wallet Address:</strong>{" "}
                    {company.wallet_address || "Not set"}
                  </p>
                </div>

                <button
                  onClick={() =>
                    navigate(`/authority/company/${company.id}/shares`)
                  }
                  className="form-button"
                  style={{ marginTop: "10px" }}
                >
                  View All Shares
                </button>
                <button
                  onClick={() => navigate(`/company/${company.id}/ledger`)}
                  className="form-button"
                >
                  📒 View Share Ledger
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No companies found.</p>
        )}
      </div>

      <div className="form-container">
        <button
          onClick={() => navigate("/authorityview")}
          className="form-button"
        >
          View All Transfers
        </button>
        <button onClick={() => navigate("/logout")} className="form-button">
          Logout
        </button>
      </div>
    </div>
  );
}

export default AuthorityCompanies;
