import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api.js";
import "../styles/Home.css";

function ShareholderTaxDue() {
  const navigate = useNavigate();
  const [user_name, setUserName] = useState("");
  const [transfers, setTransfers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalTaxOwed, setTotalTaxOwed] = useState(0);

  useEffect(() => {
    getUserData();
    getMyTransfers();
  }, []);

  const getUserData = () => {
    api
      .get("/api/userdata/")
      .then((response) => response.data)
      .then((data) => setUserName(data.username))
      .catch((error) => alert(error));
  };

  const getMyTransfers = () => {
    api
      .get("/api/transfers/")
      .then((response) => response.data)
      .then((data) => {
        // Filter only completed transfers (where tax is owed)
        const completedTransfers = data.filter(
          (transfer) => transfer.status === "completed"
        );
        setTransfers(completedTransfers);

        // Calculate total tax owed
        const total = completedTransfers.reduce(
          (sum, transfer) => sum + (transfer.capital_gain_info?.tax_owed || 0),
          0
        );
        setTotalTaxOwed(total);
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
          ← A Inicio
        </button>
      </div>

      <div>
        <h2>📊 El resumen impositivo de {user_name}</h2>
        <p style={{ fontSize: "0.9em", color: "#666" }}>
          Ganancias de capital en transferencias confirmadas
        </p>
      </div>

      <div className="form-container">
        {isLoading ? (
          <p>LOADING....</p>
        ) : (
          <>
            {/* Total Tax Summary */}
            <div
              style={{
                backgroundColor: totalTaxOwed > 0 ? "#fff3cd" : "#d4edda",
                border:
                  totalTaxOwed > 0 ? "3px solid #ffc107" : "3px solid #28a745",
                padding: "25px",
                borderRadius: "10px",
                marginBottom: "30px",
                textAlign: "center",
              }}
            >
              <h2 style={{ margin: "0 0 10px 0" }}>💰 Impuesto debido</h2>
              <p
                style={{
                  fontSize: "2.5em",
                  fontWeight: "bold",
                  margin: "10px 0",
                  color: totalTaxOwed > 0 ? "#856404" : "#155724",
                }}
              >
                ${totalTaxOwed.toFixed(2)}
              </p>
              <p style={{ fontSize: "0.9em", color: "#666" }}>
                Based on {transfers.length} completed transfer
                {transfers.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Individual Transfers */}
            {transfers.length > 0 ? (
              <>
                <h3 style={{ marginBottom: "15px" }}>
                  Detalles de la Transferencia:
                </h3>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {transfers.map((transfer, index) => (
                    <li
                      key={transfer.id}
                      style={{
                        border: "2px solid #007bff",
                        padding: "20px",
                        marginBottom: "20px",
                        borderRadius: "10px",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      <h4 style={{ marginTop: 0, color: "#007bff" }}>
                        Transfer #{index + 1} - {transfer.company_name}
                      </h4>

                      {/* Transfer Info */}
                      <div style={{ marginBottom: "15px" }}>
                        <p>
                          <strong>Acción:</strong> #{transfer.share_number}
                        </p>
                        <p>
                          <strong>Vendida a:</strong>{" "}
                          {transfer.to_shareholder_name}
                        </p>
                        <p>
                          <strong>Date:</strong>{" "}
                          {new Date(
                            transfer.transfer_date
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Tax Calculation Breakdown */}
                      {transfer.capital_gain_info && (
                        <div
                          style={{
                            backgroundColor: "#e7f3ff",
                            padding: "15px",
                            borderRadius: "8px",
                            border: "1px solid #007bff",
                          }}
                        >
                          <h5 style={{ marginTop: 0, color: "#0056b3" }}>
                            📈 Cálculo de Impuesto:
                          </h5>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "10px",
                              marginBottom: "10px",
                            }}
                          >
                            <div>
                              <p style={{ margin: "5px 0", fontSize: "0.9em" }}>
                                <strong>Costo deducible:</strong>
                              </p>
                              <p style={{ margin: "5px 0", fontSize: "1.1em" }}>
                                $
                                {transfer.capital_gain_info.cost_basis.toFixed(
                                  2
                                )}
                              </p>
                            </div>

                            <div>
                              <p style={{ margin: "5px 0", fontSize: "0.9em" }}>
                                <strong>Precio de venta:</strong>
                              </p>
                              <p style={{ margin: "5px 0", fontSize: "1.1em" }}>
                                $
                                {transfer.capital_gain_info.sale_price.toFixed(
                                  2
                                )}
                              </p>
                            </div>
                          </div>

                          <div
                            style={{
                              borderTop: "1px solid #007bff",
                              paddingTop: "10px",
                            }}
                          >
                            <p style={{ margin: "5px 0" }}>
                              <strong>Ganancia de capital:</strong> $
                              {transfer.capital_gain_info.capital_gain.toFixed(
                                2
                              )}
                            </p>
                            <p style={{ margin: "5px 0" }}>
                              <strong>Base Impositiva:</strong> $
                              {transfer.capital_gain_info.taxable_amount.toFixed(
                                2
                              )}
                            </p>
                            <p style={{ margin: "5px 0" }}>
                              <strong>Tarifa:</strong>{" "}
                              {(
                                transfer.capital_gain_info.tax_rate * 100
                              ).toFixed(0)}
                              %
                            </p>
                          </div>

                          <div
                            style={{
                              borderTop: "2px solid #007bff",
                              marginTop: "10px",
                              paddingTop: "10px",
                            }}
                          >
                            <p
                              style={{
                                margin: "5px 0",
                                fontSize: "1.2em",
                                fontWeight: "bold",
                                color: "#0056b3",
                              }}
                            >
                              💵 Impuesto causado en la transferencia: $
                              {transfer.capital_gain_info.tax_owed.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  backgroundColor: "#d4edda",
                  borderRadius: "10px",
                  border: "2px solid #28a745",
                }}
              >
                <h3 style={{ color: "#155724" }}>✅ No Causó Impuesto !</h3>
                <p>No has transferido acción alguna.</p>
              </div>
            )}
          </>
        )}
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

export default ShareholderTaxDue;
