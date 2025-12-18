// ShareTransfer.jsx
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api.js";
import "../styles/Home.css";

function ShareTransfer() {
  const navigate = useNavigate();
  const { share } = useParams(); // share ID from URL

  const [user_name, setUserName] = useState("");
  const [user_id, setUserID] = useState(null);
  const [all_shareholders, setAllShareHolders] = useState([]);
  const [transfer_price, setTransferPrice] = useState("");
  const [to_shareholder, setSelectedShareholderId] = useState("");
  const [transfer_id, setTransferID] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transferComplete, setTransferComplete] = useState(false);
  const [taxInfo, setTaxInfo] = useState(null);

  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    if (user_id) {
      getAllShareHolders();
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

  const getAllShareHolders = () => {
    api
      .get("/api/alluserdata/")
      .then((response) => response.data)
      .then((data) => {
        const shareholders = data.filter(
          (shareholder) => shareholder.condition === "shareholder"
        );
        setAllShareHolders(shareholders);
        setLoading(false);
      })
      .catch((error) => alert(error));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create transfer
      const createResponse = await api.post("/api/transfers/create/", {
        share: Number(share),
        to_shareholder: Number(to_shareholder),
        transfer_price: parseFloat(transfer_price),
      });

      console.log("Transfer created:", createResponse.data);
      const transferId = createResponse.data.id;
      setTransferID(transferId);

      // 2. Complete transfer (updates ownership in database)
      const completeResponse = await api.post(
        `/api/transfers/${transferId}/complete/`
      );

      console.log("Transfer completed:", completeResponse.data);

      // Extract tax calculation
      setTaxInfo(completeResponse.data.tax_calculation);
      setTransferComplete(true);
      setLoading(false);

      alert("✅ Database transfer completed! Now record on blockchain.");
    } catch (error) {
      alert("Failed to complete transfer: " + error.message);
      console.error("Error:", error.response?.data);
      setLoading(false);
    }
  };

  const goToBlockchain = () => {
    navigate(`/blockchain-transfer/${transfer_id}`);
  };

  return (
    <div>
      <div className="form-container">
        <button onClick={() => navigate("/")} className="form-button">
          ← Regresa a Inicio
        </button>
      </div>

      <div>
        <h2>🔄 Transferencia de la acción #{share}</h2>
        <p style={{ fontSize: "0.9em", color: "#666" }}>
          Hola, {user_name}! transfiere tu acción
        </p>
      </div>

      {!transferComplete ? (
        <div className="form-container">
          <form onSubmit={handleSubmit} className="form-container">
            <label htmlFor="shareholder">Transfiere A (Shareholder)</label>
            <select
              id="shareholder"
              value={to_shareholder}
              onChange={(e) => setSelectedShareholderId(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">-- Selecciona al accionista --</option>
              {all_shareholders.map((shareholder) => (
                <option key={shareholder.id} value={shareholder.id}>
                  {shareholder.username}
                </option>
              ))}
            </select>

            <label htmlFor="price">Precio de venta (USD)</label>
            <input
              type="number"
              step="0.01"
              id="price"
              value={transfer_price}
              onChange={(e) => setTransferPrice(e.target.value)}
              required
              disabled={loading}
              placeholder="15.50"
            />

            <button
              type="submit"
              disabled={loading}
              className="form-button"
              style={{
                backgroundColor: loading ? "#9e9e9e" : "#4CAF50",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "⏳ Processing..." : "Complete Transfer"}
            </button>
          </form>
        </div>
      ) : (
        <div className="form-container">
          {/* Success Message */}
          <div
            style={{
              backgroundColor: "#e8f5e9",
              border: "3px solid #4CAF50",
              padding: "25px",
              borderRadius: "10px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#2E7D32" }}>
              ✅ transferencia en la base de datos lista!
            </h3>
            <p style={{ color: "#666" }}>
              Titularidad actualizada en base de datos.
            </p>
          </div>

          {/* Tax Calculation */}
          {taxInfo && (
            <div
              style={{
                backgroundColor: "#e3f2fd",
                border: "2px solid #2196F3",
                padding: "20px",
                marginBottom: "20px",
                borderRadius: "10px",
              }}
            >
              <h3 style={{ marginTop: 0, color: "#1976D2" }}>
                📊 Cálculo del Impuesto (Ecuadorian Law)
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "5px 0",
                      fontSize: "0.9em",
                      color: "#666",
                    }}
                  >
                    Costo deducible
                  </p>
                  <p
                    style={{
                      margin: "5px 0",
                      fontSize: "1.3em",
                      fontWeight: "bold",
                    }}
                  >
                    ${taxInfo.cost_basis.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      margin: "5px 0",
                      fontSize: "0.9em",
                      color: "#666",
                    }}
                  >
                    Precio
                  </p>
                  <p
                    style={{
                      margin: "5px 0",
                      fontSize: "1.3em",
                      fontWeight: "bold",
                    }}
                  >
                    ${taxInfo.sale_price.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      margin: "5px 0",
                      fontSize: "0.9em",
                      color: "#666",
                    }}
                  >
                    Ganancia de Capital
                  </p>
                  <p
                    style={{
                      margin: "5px 0",
                      fontSize: "1.3em",
                      fontWeight: "bold",
                      color: taxInfo.capital_gain > 0 ? "#4CAF50" : "#f44336",
                    }}
                  >
                    ${taxInfo.capital_gain.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      margin: "5px 0",
                      fontSize: "0.9em",
                      color: "#666",
                    }}
                  >
                    Base Impositiva
                  </p>
                  <p
                    style={{
                      margin: "5px 0",
                      fontSize: "1.3em",
                      fontWeight: "bold",
                    }}
                  >
                    ${taxInfo.taxable_amount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  backgroundColor: "#fff3e0",
                  borderRadius: "8px",
                  border: "2px solid #FF9800",
                }}
              >
                <p
                  style={{
                    margin: "0 0 5px 0",
                    fontSize: "0.9em",
                    color: "#666",
                  }}
                >
                  Tarifa: {(taxInfo.tax_rate * 100).toFixed(0)}%
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "1.5em",
                    fontWeight: "bold",
                    color: "#E65100",
                  }}
                >
                  💰 Impuesto causado: ${taxInfo.tax_owed.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Blockchain Next Step */}
          <div
            style={{
              backgroundColor: "#fff3e0",
              border: "2px solid #FF9800",
              padding: "25px",
              borderRadius: "10px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#E65100" }}>
              🔗 Siguiente paso: Blockchain
            </h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Transfiere esta acción en la Blockchain de Sepolia para garantizar
              su inmutabilidad .
            </p>
            <button
              onClick={goToBlockchain}
              style={{
                backgroundColor: "#FF9800",
                color: "white",
                padding: "15px 30px",
                fontSize: "1.1em",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              🔗 Registra en Blockchain →
            </button>
          </div>

          {/* Skip Option */}
          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => navigate("/shareholdercos")}
              className="form-button"
              style={{
                backgroundColor: "#9e9e9e",
              }}
            >
              Salta el paso de Blockchain (No recomendable !!)
            </button>
          </div>
        </div>
      )}

      <div className="form-container">
        <button onClick={() => navigate("/logout")} className="form-button">
          Cierra Cesión
        </button>
      </div>
    </div>
  );
}

export default ShareTransfer;
