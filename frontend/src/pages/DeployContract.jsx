// DeployContract.jsx
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import api from "../api.js";
import CompanySharesArtifact from "../contracts/CompanyShares.json";
import "../styles/Home.css";

function DeployContract() {
  const navigate = useNavigate();
  const { company_id } = useParams();

  const [company, setCompany] = useState(null);
  const [userWallet, setUserWallet] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState("");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [networkName, setNetworkName] = useState("");

  useEffect(() => {
    getCompany();
    checkWallet();
  }, []);

  const getCompany = async () => {
    try {
      const response = await api.get("/api/company/");
      const companyData = response.data.find(
        (c) => c.id === Number(company_id)
      );
      setCompany(companyData);

      if (companyData.contract_address) {
        setDeployedAddress(companyData.contract_address);
      }
    } catch (err) {
      alert("Failed to load company: " + err.message);
    }
  };

  const checkWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setError(
        "⚠️ MetaMask not installed. Please install MetaMask to continue."
      );
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setUserWallet(accounts[0]);

      const network = await provider.getNetwork();
      if (network.chainId === 11155111n) {
        setNetworkName("Sepolia Testnet ✅");
      } else {
        setNetworkName(`⚠️ Wrong Network (Chain ID: ${network.chainId})`);
        setError("Please switch to Sepolia Testnet in MetaMask");
      }
    } catch (err) {
      setError("Failed to connect wallet: " + err.message);
    }
  };

  const deployContract = async () => {
    setIsDeploying(true);
    setError("");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      if (network.chainId !== 11155111n) {
        throw new Error("Please switch to Sepolia Testnet in MetaMask");
      }

      const signer = await provider.getSigner();
      console.log("Deploying from:", await signer.getAddress());

      const factory = new ethers.ContractFactory(
        CompanySharesArtifact.abi,
        CompanySharesArtifact.bytecode,
        signer
      );

      console.log("Sending deployment transaction...");
      const contract = await factory.deploy();

      const deployTx = contract.deploymentTransaction();
      setTxHash(deployTx.hash);
      console.log("Deployment TX:", deployTx.hash);

      console.log("Waiting for confirmation...");
      await contract.waitForDeployment();

      const address = await contract.getAddress();
      setDeployedAddress(address);
      console.log("✅ Contract deployed at:", address);

      console.log("Updating database...");
      await api.patch(`api/company/${company_id}/update/`, {
        contract_address: address,
        deployment_tx_hash: deployTx.hash,
      });

      alert("✅ Contract deployed successfully!");
      setIsDeploying(false);
    } catch (err) {
      console.error("Deployment error:", err);

      if (err.code === "ACTION_REJECTED") {
        setError("Transaction was rejected in MetaMask");
      } else if (err.message.includes("insufficient funds")) {
        setError(
          "Insufficient Sepolia ETH for gas. Get free ETH from sepoliafaucet.com"
        );
      } else {
        setError(err.message);
      }

      setIsDeploying(false);
    }
  };

  return (
    <div>
      <div className="form-container">
        <button onClick={() => navigate("/")} className="form-button">
          ← Inicio
        </button>
      </div>

      <div>
        <h2>🚀 Despliega el Smart Contract de tu Co.</h2>
        <p style={{ fontSize: "0.9em", color: "#666" }}>
          Desplegar el blockchain smart contract para {company?.name}
        </p>
      </div>

      <div className="form-container">
        {/* Company Info */}
        {company && (
          <div
            style={{
              backgroundColor: "#e3f2fd",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "20px",
              border: "2px solid #2196F3",
            }}
          >
            <h3 style={{ marginTop: 0 }}>📋 Info de la Co.</h3>
            <p>
              <strong>Nombre:</strong> {company.name}
            </p>
            <p>
              <strong>RUC:</strong> {company.registration_number}
            </p>
            <p>
              <strong>Total Acciones:</strong> {company.total_shares}
            </p>
            <p>
              <strong>Constituyente:</strong> {company.incorporator_name}
            </p>
          </div>
        )}

        {/* Wallet Info */}
        <div
          style={{
            backgroundColor: userWallet ? "#fff3e0" : "#ffebee",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "20px",
            border: userWallet ? "2px solid #FF9800" : "2px solid #f44336",
          }}
        >
          <h3 style={{ marginTop: 0 }}>🦊 MetaMask Wallet</h3>
          {userWallet ? (
            <>
              <p>
                <strong>Connected:</strong> {userWallet.slice(0, 6)}...
                {userWallet.slice(-4)}
              </p>
              <p>
                <strong>Network:</strong> {networkName}
              </p>
            </>
          ) : (
            <p style={{ color: "#f44336", fontWeight: "bold" }}>
              ⚠️ Wallet no conectada
            </p>
          )}
        </div>

        {/* Instructions */}
        {!deployedAddress && !isDeploying && (
          <div
            style={{
              backgroundColor: "#f5f5f5",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ marginTop: 0 }}>📖 Instructions:</h3>
            <ol style={{ paddingLeft: "20px" }}>
              <li>
                Asegura de estar en <strong>Sepolia Testnet</strong>
              </li>
              <li>
                Asegura tener <strong>Sepolia ETH</strong> para los gas fees
              </li>
              <li>Click "Despliega contrato" abajo</li>
              <li>Aprueba la transaccióin en MetaMask</li>
              <li>Wait ~15-30 seconds for confirmation</li>
            </ol>

            {/* FIXED faucet link */}
            <p style={{ fontSize: "0.85em", color: "#666", marginTop: "10px" }}>
              💡 Need Sepolia ETH? Get free testnet ETH at{" "}
              <a
                href="https://sepoliafaucet.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                sepoliafaucet.com
              </a>
            </p>
          </div>
        )}

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

        {/* Deploy Button */}
        {!deployedAddress && (
          <button
            onClick={deployContract}
            disabled={
              isDeploying || !userWallet || error.includes("Wrong Network")
            }
            style={{
              backgroundColor: isDeploying ? "#9e9e9e" : "#4CAF50",
              color: "white",
              padding: "20px 40px",
              fontSize: "1.2em",
              border: "none",
              borderRadius: "10px",
              cursor: isDeploying || !userWallet ? "not-allowed" : "pointer",
              width: "100%",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            {isDeploying
              ? "⏳ Deploying Contract..."
              : "🚀 Deploy Contract to Sepolia"}
          </button>
        )}

        {/* Deployment Progress */}
        {txHash && !deployedAddress && (
          <div
            style={{
              backgroundColor: "#fff3e0",
              padding: "20px",
              borderRadius: "10px",
              border: "2px solid #FF9800",
            }}
          >
            <h3 style={{ marginTop: 0 }}>⏳ Deployment en curso...</h3>
            <p>Espera a la confirmación de la trsc. en blockchain.</p>
            <p>
              <strong>Transaction Hash:</strong>
            </p>
            <p
              style={{
                fontSize: "0.85em",
                wordBreak: "break-all",
                fontFamily: "monospace",
              }}
            >
              {txHash}
            </p>

            {/* FIXED: removed stray </p> and closed properly */}
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#2196F3",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              🔗 Ver en Sepolia Etherscan →
            </a>
          </div>
        )}

        {/* Success */}
        {deployedAddress && (
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
              🎉 Contracto Desplegado exitosamente!
            </h2>

            <div style={{ margin: "20px 0" }}>
              <p style={{ fontSize: "0.9em", color: "#666" }}>
                <strong>Contract Address:</strong>
              </p>
              <p
                style={{
                  fontSize: "1.1em",
                  wordBreak: "break-all",
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  backgroundColor: "white",
                  padding: "15px",
                  borderRadius: "5px",
                  border: "1px solid #4CAF50",
                }}
              >
                {deployedAddress}
              </p>
            </div>

            {/* FIXED: added proper <a> opening tag */}
            <a
              href={`https://sepolia.etherscan.io/address/${deployedAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#2196F3",
                textDecoration: "none",
                fontWeight: "bold",
                display: "inline-block",
                marginBottom: "20px",
              }}
            >
              🔗 Ver mart Contract en Etherscan →
            </a>

            <div style={{ marginTop: "20px" }}>
              <button
                onClick={() => navigate(`/createshares/${company_id}`)}
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
                Next: Crea las acciones →
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="form-container">
        <button
          onClick={() => navigate("/shareholdercos")}
          className="form-button"
        >
          Mis Cos.
        </button>
        <button onClick={() => navigate("/logout")} className="form-button">
          Logout
        </button>
      </div>
    </div>
  );
}

export default DeployContract;
