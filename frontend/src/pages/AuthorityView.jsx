import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api.js";
import "../styles/Home.css";

function AuthorityTransfers() {
  const navigate = useNavigate();
  const [user_name, setUserName] = useState("");
  const [transfers, setTransfers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUserData();
    getTransfers();
  }, []);

  const getUserData = () => {
    api
      .get("/api/userdata/")
      .then((response) => response.data)
      .then((data) => setUserName(data.username))
      .catch((error) => alert(error));
  };

  const getTransfers = () => {
    api
      .get("/api/transfers/")
      .then((response) => response.data)
      .then((data) => {
        setTransfers(data);
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
        <h2>Authority View: All Share Transfers</h2>
      </div>

      <div className="form-container">
        {isLoading ? (
          <p>LOADING....</p>
        ) : transfers.length > 0 ? (
          <ul>
            {transfers.map((transfer) => (
              <li
                key={transfer.id}
                style={{
                  border:
                    transfer.status === "completed"
                      ? "2px solid green"
                      : "2px solid orange",
                  padding: "15px",
                  marginBottom: "10px",
                  borderRadius: "5px",
                }}
              >
                <h4>
                  Transfer #{transfer.id} - {transfer.status.toUpperCase()}
                </h4>
                <p>
                  <strong>Company:</strong> {transfer.company_name}
                </p>
                <p>
                  <strong>Share:</strong> #{transfer.share_number}
                </p>
                <p>
                  <strong>From:</strong> {transfer.from_shareholder_name}
                </p>
                <p>
                  <strong>To:</strong> {transfer.to_shareholder_name}
                </p>
                <p>
                  <strong>Price:</strong> ${transfer.transfer_price}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(transfer.transfer_date).toLocaleDateString()}
                </p>

                {transfer.capital_gain_info && (
                  <div
                    style={{
                      marginTop: "10px",
                      backgroundColor: "#f0f0f0",
                      padding: "10px",
                    }}
                  >
                    <p>
                      <strong>Tax Owed:</strong> $
                      {transfer.capital_gain_info.tax_owed.toFixed(2)}
                    </p>
                    <p>
                      <strong>Capital Gain:</strong> $
                      {transfer.capital_gain_info.capital_gain.toFixed(2)}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No transfers found.</p>
        )}
      </div>

      <div className="form-container">
        <button onClick={() => navigate("/logout")} className="form-button">
          Logout
        </button>
      </div>
    </div>
  );
}

export default AuthorityTransfers;
