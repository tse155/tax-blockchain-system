// BlockchainTransfer.jsx
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import api from "../api.js";
import CompanySharesArtifact from "../contracts/CompanyShares.json";
import "../styles/Home.css";

function BlockchainTransfer() {
  const navigate = useNavigate();
  const { transfer_id } = useParams();

  const [transfer, setTransfer] = useState(null);
  const [share, setShare] = useState(null);
  const [company, setCompany] = useState(null);
  const [fromUser, setFromUser] = useState(null);
  const [toUser, setToUser] = useState(null);
  const [userWallet, setUserWallet] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    loadTransferData();
    checkWallet();
  }, []);

  const loadTransferData = async () => {
    try {
      const transferResponse = await api.get("/api/transfers/");
      const transferData = transferResponse.data.find(
        (t) => t.id === Number(transfer_id)
      );
      console.log(transferData);
      setTransfer(transferData);

      if (transferData.blockchain_tx_hash) {
        setTxHash(transferData.blockchain_tx_hash);
        setComplete(true);
      }

      const shareResponse = await api.get("/api/shares/special/");
      console.log(shareResponse);
      const shareData = shareResponse.data.find(
        (s) => s.id === transferData.share
      );
      console.log(shareData);
      setShare(shareData);

      const companyResponse = await api.get("/api/company/");
      const companyData = companyResponse.data.find(
        (c) => c.id === shareData.company
      );
      setCompany(companyData);

      const usersResponse = await api.get("/api/alluserdata/");
      const from = usersResponse.data.find(
        (u) => u.id === transferData.from_shareholder
      );
      const to = usersResponse.data.find(
        (u) => u.id === transferData.to_shareholder
      );
      setFromUser(from);
      setToUser(to);
    } catch (err) {
      setError("Failed to load transfer data: " + err.message);
    }
  };

  const checkWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setError("⚠️ MetaMask not installed");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setUserWallet(accounts[0]);

      const network = await provider.getNetwork();
      if (network.chainId !== 11155111n) {
        setError("Please switch to Sepolia Testnet");
      }
    } catch (err) {
      setError("Failed to connect wallet: " + err.message);
    }
  };

  const executeBlockchainTransfer = async () => {
    setIsTransferring(true);
    setError("");

    try {
      console.log("🚀 Starting blockchain transfer...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      console.log("Signer:", signerAddress);

      const network = await provider.getNetwork();
      if (network.chainId !== 11155111n) {
        throw new Error("Please switch to Sepolia Testnet");
      }

      const contract = new ethers.Contract(
        company.contract_address,
        CompanySharesArtifact.abi,
        signer
      );
      console.log("Connected to contract:", company.contract_address);

      const toAddress = toUser.wallet_address || userWallet;
      const tokenId = share.token_id;
      const priceCents = Math.round(parseFloat(transfer.transfer_price) * 100);

      console.log("Transfer params:", {
        to: toAddress,
        tokenId: tokenId,
        priceCents: priceCents,
      });

      const currentOwner = await contract.ownerOf(tokenId);
      console.log("Current owner:", currentOwner);
      console.log("Your address:", signerAddress);

      //if (currentOwner.toLowerCase() !== signerAddress.toLowerCase()) {
      //throw new Error("You don't own this share on the blockchain!");
      // }

      console.log("Calling transferWithPrice...");
      const tx = await contract.transferWithPrice(
        toAddress,
        tokenId,
        priceCents
      );
      setTxHash(tx.hash);
      console.log("Transaction sent:", tx.hash);

      console.log("Waiting for confirmation...");
      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed!");

      const block = await provider.getBlock(receipt.blockNumber);
      const timestamp = block.timestamp;

      console.log("Updating database...");
      await api.patch(`/api/transfers/${transfer_id}/update/`, {
        blockchain_tx_hash: tx.hash,
        blockchain_timestamp: timestamp,
      });

      setComplete(true);
      setIsTransferring(false);
      alert("✅ Blockchain transfer completed!");
    } catch (err) {
      console.error("Transfer error:", err);

      if (err.code === "ACTION_REJECTED") {
        setError("Transaction rejected in MetaMask");
      } else {
        setError(err.message);
      }

      setIsTransferring(false);
    }
  };

  return (
    <div>
      <div className="form-container">
        <button onClick={() => navigate("/")} className="form-button">
          ← Regresar a Inicio
        </button>
      </div>

      <div>
        <h2>🔗 Blockchain Transferencia</h2>
        <p style={{ fontSize: "0.9em", color: "#666" }}>
          Registrar transferencia en la Sepolia blockchain
        </p>
      </div>

      <div className="form-container">
        {/* Transfer Info */}
        {transfer && share && company && (
          <div
            style={{
              backgroundColor: "#e3f2fd",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "20px",
              border: "2px solid #2196F3",
            }}
          >
            <h3 style={{ marginTop: 0 }}>📋 Transfer Details</h3>
            <p>
              <strong>Compañía:</strong> {company.name}
            </p>
            <p>
              <strong>Acción:</strong> #{share.share_number} (Token #
              {share.token_id})
            </p>
            <p>
              <strong>De:</strong> {fromUser?.username}
            </p>
            <p>
              <strong>Para:</strong> {toUser?.username}
            </p>
            <p>
              <strong>Precio:</strong> ${transfer.transfer_price}
            </p>
            <p style={{ fontSize: "0.85em", color: "#666", marginTop: "10px" }}>
              <strong> Smart Contract:</strong>
              <br />
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.9em",
                  wordBreak: "break-all",
                }}
              >
                {company.contract_address}
              </span>
            </p>
          </div>
        )}

        {/* Wallet Info */}
        <div
          style={{
            backgroundColor: userWallet ? "#e8f5e9" : "#ffebee",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "20px",
            border: userWallet ? "2px solid #4CAF50" : "2px solid #f44336",
          }}
        >
          <h3 style={{ marginTop: 0 }}>🦊 Wallet Status</h3>
          <p>
            <strong>Tu Wallet:</strong>{" "}
            {userWallet
              ? `${userWallet.slice(0, 6)}...${userWallet.slice(-4)}`
              : "Not connected"}
          </p>
          {toUser && (
            <p>
              <strong>Transferir A:</strong>{" "}
              {toUser.wallet_address
                ? `${toUser.wallet_address.slice(
                    0,
                    6
                  )}...${toUser.wallet_address.slice(-4)}`
                : `${userWallet.slice(0, 6)}...${userWallet.slice(
                    -4
                  )} (fallback)`}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              backgroundColor: "#ffebee",
              color: "#c62828",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "20px",
              border: "2px solid #f44336",
            }}
          >
            <strong>⚠️ Error:</strong> {error}
          </div>
        )}

        {/* Transfer Button */}
        {!complete && (
          <button
            onClick={executeBlockchainTransfer}
            disabled={isTransferring || !userWallet}
            style={{
              backgroundColor: isTransferring ? "#9e9e9e" : "#4CAF50",
              color: "white",
              padding: "20px 40px",
              fontSize: "1.2em",
              border: "none",
              borderRadius: "10px",
              cursor: isTransferring || !userWallet ? "not-allowed" : "pointer",
              width: "100%",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            {isTransferring
              ? "⏳ Transferring on Blockchain..."
              : "🔗 Execute Blockchain Transfer"}
          </button>
        )}

        {/* In Progress */}
        {txHash && !complete && (
          <div
            style={{
              backgroundColor: "#fff3e0",
              padding: "20px",
              borderRadius: "10px",
              border: "2px solid #FF9800",
            }}
          >
            <h3 style={{ marginTop: 0 }}>⏳ Transfer en Proceso...</h3>
            <p>
              <strong>Transaction Hash:</strong>
            </p>
            <p
              style={{
                fontSize: "0.85em",
                fontFamily: "monospace",
                wordBreak: "break-all",
              }}
            >
              {txHash}
            </p>

            {/* ✅ FIXED <a> tag */}
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#2196F3", fontWeight: "bold" }}
            >
              🔗 Revisar en Etherscan →
            </a>
          </div>
        )}

        {/* Complete */}
        {complete && (
          <div
            style={{
              backgroundColor: "#e8f5e9",
              border: "3px solid #4CAF50",
              padding: "30px",
              borderRadius: "10px",
              textAlign: "center",
            }}
          >
            <h2 style={{ marginTop: 0, color: "#2E7D32" }}>
              🎉 Blockchain Transfer Completada!
            </h2>
            <p>Titularidad de la acción se transfirió en Sepolia!</p>
            {txHash && (
              <>
                <p
                  style={{
                    fontSize: "0.85em",
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                    margin: "15px 0",
                  }}
                >
                  {txHash}
                </p>

                {/* ✅ FIXED <a> tag */}
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#2196F3",
                    fontWeight: "bold",
                    display: "block",
                    marginBottom: "20px",
                  }}
                >
                  🔗 Ver en Etherscan →
                </a>
              </>
            )}
            <button
              onClick={() => navigate("/myshares")}
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
              Ver mis acciones →
            </button>
          </div>
        )}
      </div>

      <div className="form-container">
        <button
          onClick={() => navigate("/shareholdercos")}
          className="form-button"
        >
          Mis Compañías
        </button>
        <button onClick={() => navigate("/logout")} className="form-button">
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default BlockchainTransfer;
