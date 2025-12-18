import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api.js";
import "../styles/Home.css";

function CompanyLedger() {
  const navigate = useNavigate();
  const { company_id } = useParams();

  const [user_name, setUserName] = useState("");
  const [user_condition, setUserCondition] = useState("");
  const [company, setCompany] = useState(null);
  const [ledgerData, setLedgerData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    if (user_condition) {
      getCompanyLedger();
    }
  }, [user_condition]);

  const getUserData = () => {
    api
      .get("/api/userdata/")
      .then((response) => response.data)
      .then((data) => {
        setUserName(data.username);
        setUserCondition(data.condition);
      })
      .catch((error) => alert(error));
  };

  const getCompanyLedger = async () => {
    try {
      // Get company info
      const companyResponse = await api.get("/api/company/");
      const companyData = companyResponse.data.find(
        (c) => c.id === Number(company_id)
      );
      setCompany(companyData);

      // Get all shares for this company
      const sharesResponse = await api.get("/api/shares/");
      const companyShares = sharesResponse.data.filter(
        (share) => share.company === Number(company_id)
      );

      // Get all transfers for this company's shares
      const transfersResponse = await api.get("/api/transfers/");

      // Build ledger data for each share
      const ledger = companyShares.map((share) => {
        // Find the most recent completed transfer for this share
        const shareTransfers = transfersResponse.data
          .filter((t) => t.share === share.id && t.status === "completed")
          .sort(
            (a, b) => new Date(b.transfer_date) - new Date(a.transfer_date)
          );

        const lastTransfer = shareTransfers[0]; // Most recent

        return {
          share_number: share.share_number,
          share_id: share.id,
          // Current ownership
          current_owner: share.shareholder_name,
          current_owner_wallet: share.shareholder_wallet || "Not set",
          acquisition_date: share.acquisition_date,
          // Previous ownership (from last transfer)
          previous_owner: lastTransfer
            ? lastTransfer.from_shareholder_name
            : "Initial Issuance",
          previous_owner_wallet: lastTransfer ? "Not set" : "N/A",
          // Blockchain (empty for now)
          contract_tx_hash: share.minting_tx_hash || "Pending mint",
          transfer_tx_hash: lastTransfer
            ? lastTransfer.transfer_tx_hash || "Pending blockchain"
            : "N/A",
        };
      });

      // Sort by share number
      ledger.sort((a, b) => a.share_number - b.share_number);

      setLedgerData(ledger);
      setIsLoading(false);
    } catch (error) {
      alert("Error loading ledger: " + error.message);
      setIsLoading(false);
    }
  };

  // Check authorization
  const isAuthorized = true;

  if (!isAuthorized && !isLoading) {
    return (
      <div>
        <h2>⛔ Acceso Denegado</h2>
        <p>Solo el constituyente y la autoridad pueden revisar esta sección.</p>
        <button onClick={() => navigate("/")} className="form-button">
          Regresar a Inicio
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="form-container">
        <button onClick={() => navigate("/")} className="form-button">
          ← A Inicio
        </button>
      </div>

      <div>
        <h2>📒 Libro virtual de aciones: {company?.name}</h2>
        <p style={{ fontSize: "0.9em", color: "#666" }}>
          CRegistro completo de todas las acciones
        </p>
      </div>

      <div className="form-container">
        {isLoading ? (
          <p>LOADING LEDGER....</p>
        ) : (
          <>
            {/* Company Summary */}
            <div
              style={{
                backgroundColor: "#e3f2fd",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "20px",
                border: "2px solid #2196F3",
              }}
            >
              <h3>Info de la Co.</h3>
              <p>
                <strong>RUC:</strong> {company?.registration_number}
              </p>
              <p>
                <strong>Constituyente:</strong> {company?.incorporator_name}
              </p>
              <p>
                <strong>Acciones emitidas:</strong> {ledgerData.length}
              </p>
              <p>
                <strong> VPP Actual:</strong> ${company?.vpp?.toFixed(2)}
              </p>
            </div>

            {/* Ledger Table */}
            {ledgerData.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    backgroundColor: "white",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#2196F3", color: "white" }}>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          borderBottom: "2px solid #1976D2",
                        }}
                      >
                        Accion No #
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          borderBottom: "2px solid #1976D2",
                        }}
                      >
                        Mint TX Hash
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          borderBottom: "2px solid #1976D2",
                        }}
                      >
                        Dueño actual
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          borderBottom: "2px solid #1976D2",
                        }}
                      >
                        Dueño del Wallet
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          borderBottom: "2px solid #1976D2",
                        }}
                      >
                        Fecha de adquisición
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          borderBottom: "2px solid #1976D2",
                        }}
                      >
                        Transfer TX Hash
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          borderBottom: "2px solid #1976D2",
                        }}
                      >
                        Dueño anterior
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          borderBottom: "2px solid #1976D2",
                        }}
                      >
                        Wallet Anterior
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerData.map((entry, index) => (
                      <tr
                        key={entry.share_id}
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? "#f9f9f9" : "white",
                        }}
                      >
                        <td
                          style={{
                            padding: "10px",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          <strong>#{entry.share_number}</strong>
                        </td>
                        <td
                          style={{
                            padding: "10px",
                            borderBottom: "1px solid #ddd",
                            fontSize: "0.85em",
                            color:
                              entry.contract_tx_hash === "Pending mint"
                                ? "#ff9800"
                                : "#4CAF50",
                          }}
                        >
                          {entry.contract_tx_hash === "Pending mint" ? (
                            <span style={{ fontStyle: "italic" }}>
                              ⏳ {entry.contract_tx_hash}
                            </span>
                          ) : (
                            entry.contract_tx_hash
                          )}
                        </td>
                        <td
                          style={{
                            padding: "10px",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          <strong>{entry.current_owner}</strong>
                        </td>
                        <td
                          style={{
                            padding: "10px",
                            borderBottom: "1px solid #ddd",
                            fontSize: "0.85em",
                            color:
                              entry.current_owner_wallet === "Not set"
                                ? "#999"
                                : "#000",
                          }}
                        >
                          {entry.current_owner_wallet}
                        </td>
                        <td
                          style={{
                            padding: "10px",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          {new Date(
                            entry.acquisition_date
                          ).toLocaleDateString()}
                        </td>
                        <td
                          style={{
                            padding: "10px",
                            borderBottom: "1px solid #ddd",
                            fontSize: "0.85em",
                            color:
                              entry.transfer_tx_hash === "N/A"
                                ? "#999"
                                : entry.transfer_tx_hash ===
                                  "Pending blockchain"
                                ? "#ff9800"
                                : "#4CAF50",
                          }}
                        >
                          {entry.transfer_tx_hash === "N/A" ? (
                            <span style={{ fontStyle: "italic" }}>—</span>
                          ) : entry.transfer_tx_hash ===
                            "Pending blockchain" ? (
                            <span style={{ fontStyle: "italic" }}>
                              ⏳ {entry.transfer_tx_hash}
                            </span>
                          ) : (
                            entry.transfer_tx_hash
                          )}
                        </td>
                        <td
                          style={{
                            padding: "10px",
                            borderBottom: "1px solid #ddd",
                            color:
                              entry.previous_owner === "Initial Issuance"
                                ? "#999"
                                : "#000",
                          }}
                        >
                          {entry.previous_owner === "Initial Issuance" ? (
                            <span style={{ fontStyle: "italic" }}>
                              🏭 {entry.previous_owner}
                            </span>
                          ) : (
                            entry.previous_owner
                          )}
                        </td>
                        <td
                          style={{
                            padding: "10px",
                            borderBottom: "1px solid #ddd",
                            fontSize: "0.85em",
                            color: "#999",
                          }}
                        >
                          {entry.previous_owner_wallet}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No hay acciones emitidas, todavía.</p>
            )}

            {/* Legend */}
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                backgroundColor: "#fff3e0",
                borderRadius: "8px",
                border: "1px solid #ff9800",
              }}
            >
              <h4 style={{ marginTop: 0 }}>📝 Leyenda:</h4>
              <p style={{ margin: "5px 0" }}>
                <span style={{ color: "#ff9800" }}>⏳ Pending</span> - No se ha
                registrado la transacción blockchain
              </p>
              <p style={{ margin: "5px 0" }}>
                <span style={{ fontStyle: "italic" }}>🏭 Emisión inicial</span>{" "}
                - Acción minted, not transferida
              </p>
              <p style={{ margin: "5px 0" }}>
                <span style={{ fontStyle: "italic" }}>—</span> - Not applicable
              </p>
            </div>
          </>
        )}
      </div>

      <div className="form-container">
        <button
          onClick={() => navigate("/shareholdercos")}
          className="form-button"
        >
          Mis COs.
        </button>
        <button onClick={() => navigate("/logout")} className="form-button">
          Cerra Sesión
        </button>
      </div>
    </div>
  );
}

export default CompanyLedger;
