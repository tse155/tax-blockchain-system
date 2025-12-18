// SharesOwned.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api.js";
import "../styles/Home.css";

function SharesOwned() {
  const navigate = useNavigate();

  const [user_name, setUserName] = useState("");
  const [user_id, setUserID] = useState(null);
  const [shares, setShares] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    if (user_id) {
      getShares();
    }
  }, [user_id]);

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

  const getShares = () => {
    api
      .get("/api/shares/")
      .then((response) => response.data)
      .then((data) => {
        const userShares = data.filter(
          (share) => share.shareholder === user_id
        );
        setShares(userShares);
        console.log(userShares);
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
        <button onClick={() => navigate("/")} className="form-button">
          ← Regresar a Inicio
        </button>
      </div>

      <div>
        <h2>📈 {user_name}'s Portafolio de acciones</h2>
        <p style={{ fontSize: "0.9em", color: "#666", marginTop: "5px" }}>
          Las acciones de las cuales es titular
        </p>
      </div>

      <div className="form-container">
        {isLoading ? (
          <p
            style={{ fontSize: "1.2em", textAlign: "center", padding: "40px" }}
          >
            LOADING....
          </p>
        ) : shares.length > 0 ? (
          <>
            {/* Portfolio Summary */}
            <div
              style={{
                backgroundColor: "#e8f5e9",
                border: "3px solid #4CAF50",
                padding: "25px",
                borderRadius: "10px",
                marginBottom: "30px",
                textAlign: "center",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", color: "#2E7D32" }}>
                Resumen de Portafolio
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "3em",
                      fontWeight: "bold",
                      margin: "10px 0",
                    }}
                  >
                    {shares.length}
                  </p>
                  <p style={{ fontSize: "0.9em", color: "#666" }}>
                    Total de Acciones{shares.length !== 1 ? "s" : ""} que le
                    pertenecen
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      fontSize: "3em",
                      fontWeight: "bold",
                      margin: "10px 0",
                    }}
                  >
                    {shares.filter((s) => s.minting_tx_hash).length}
                  </p>
                  <p style={{ fontSize: "0.9em", color: "#666" }}>
                    Acciones Minted en Blockchain
                  </p>
                </div>
              </div>
            </div>

            {/* Individual Shares */}
            <div
              style={{
                backgroundColor: "#fff3e0",
                padding: "20px",
                borderRadius: "10px",
                border: "2px solid #FF9800",
              }}
            >
              <h3 style={{ marginTop: 0 }}>Tus acciones</h3>

              {shares.map((share) => (
                <div
                  key={share.id}
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #ddd",
                    padding: "15px",
                    borderRadius: "8px",
                    marginBottom: "15px",
                  }}
                >
                  <p>
                    <strong>Acciones #{share.share_number}</strong>
                  </p>
                  <p>Compañía: {share.company_name}</p>
                  <p>Precio: ${share.acquisition_price}</p>

                  {share.minting_tx_hash ? (
                    <div>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${share.minting_tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#2196F3",
                          fontSize: "0.9em",
                          textDecoration: "none",
                        }}
                      >
                        🔗 Revisar Mint Transaction
                      </a>
                      <button
                        onClick={() => navigate(`/sharetransfer/${share.id}`)}
                        style={{
                          backgroundColor: "#FF9800",
                          color: "white",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "0.95em",
                        }}
                      >
                        🔄 Transferir
                      </button>
                    </div>
                  ) : (
                    <p style={{ fontSize: "0.85em", color: "#c62828" }}>
                      Not minted en Blockchain .. todavía
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p
            style={{
              textAlign: "center",
              padding: "30px",
              fontSize: "1.1em",
              color: "#666",
            }}
          >
            No eres titular de acciones.
          </p>
        )}
      </div>

      <div className="form-container">
        <button
          onClick={() => navigate("/shareholdercos")}
          className="form-button"
        >
          Mis compañías
        </button>
        <button onClick={() => navigate("/logout")} className="form-button">
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default SharesOwned;
