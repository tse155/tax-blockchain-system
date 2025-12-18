// MintShares.jsx
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import api from "../api.js";
import CompanySharesArtifact from "../contracts/CompanyShares.json";
import "../styles/Home.css";

function MintShares() {
  const navigate = useNavigate();
  const { company_id } = useParams();

  const [company, setCompany] = useState(null);
  const [shares, setShares] = useState([]);
  const [userWallet, setUserWallet] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [currentMinting, setCurrentMinting] = useState(0);
  const [mintedShares, setMintedShares] = useState([]);
  const [error, setError] = useState("");
  const [allComplete, setAllComplete] = useState(false);

  useEffect(() => {
    getCompanyAndShares();
    checkWallet();
  }, []);

  const getCompanyAndShares = async () => {
    try {
      const companyResponse = await api.get("/api/company/");
      const companyData = companyResponse.data.find(
        (c) => c.id === Number(company_id)
      );
      setCompany(companyData);

      if (!companyData.contract_address) {
        setError(
          "Contract not deployed for this company. Please deploy first."
        );
        return;
      }

      const sharesResponse = await api.get("/api/shares/");
      const companyShares = sharesResponse.data
        .filter((share) => share.company === Number(company_id))
        .slice(0, 2);

      setShares(companyShares);
    } catch (err) {
      setError("Failed to load data: " + err.message);
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

  const mintAllShares = async () => {
    console.log("🚀 Starting mintAllShares...");
    console.log("Company:", company);
    console.log("Shares to mint:", shares);
    setIsMinting(true);
    setError("");
    const minted = [];

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      console.log("✅ MetaMask found");
      await provider.send("eth_requestAccounts", []);
      console.log("✅ MetaMask connected");

      const signer = await provider.getSigner();

      const signerAddress = await signer.getAddress();
      console.log("✅ Signer address:", signerAddress);

      // Check network
      const network = await provider.getNetwork();
      console.log("Network:", network.chainId);
      console.log(company.contract_address);
      if (network.chainId !== 11155111n) {
        throw new Error("Please switch to Sepolia Testnet in MetaMask");
      }

      console.log("📍 Step 1: About to check contract address...");
      console.log("Contract address value:", company.contract_address);

      if (!company.contract_address) {
        throw new Error("No contract address!");
      }
      console.log("✅ Contract address exists");

      console.log("📍 Step 2: About to connect to contract...");

      const contract = new ethers.Contract(
        company.contract_address,
        CompanySharesArtifact.abi,
        signer
      );

      console.log("✅ Contract object created");

      console.log("📍 Step 3: About to read contract owner...");
      const owner = await contract.companyOwner();
      console.log("✅ Contract owner:", owner);

      console.log("📍 Step 4: About to start minting loop...");

      for (let i = 0; i < shares.length; i++) {
        const share = shares[i];
        setCurrentMinting(i + 1);

        console.log(`\n🔄 === SHARE ${i + 1}/${shares.length} ===`);
        console.log("Share data:", share);

        try {
          console.log("📍 Preparing mint parameters...");
          const priceCents = Math.round(share.acquisition_price * 100);
          const toAddress = userWallet;
          const tokenId = share.share_number;

          console.log("Mint params:", {
            to: toAddress,
            tokenId: tokenId,
            priceCents: priceCents,
          });

          // THIS IS THE CRITICAL LINE!
          console.log("📍 Calling contract.mintShare NOW...");

          const tx = await contract.mintShare(toAddress, tokenId, priceCents);

          console.log("✅ TX SENT:", tx.hash);

          const receipt = await tx.wait();
          const block = await provider.getBlock(receipt.blockNumber);

          await api.patch(`/api/shares/${share.id}/update/`, {
            token_id: tokenId,
            minting_tx_hash: tx.hash,
            minting_timestamp: block.timestamp,
          });

          minted.push({
            shareId: share.id,
            shareNumber: share.share_number,
            txHash: tx.hash,
            tokenId: tokenId,
          });

          setMintedShares([...minted]);
        } catch (shareError) {
          if (shareError.code === "ACTION_REJECTED") {
            throw new Error("Minting cancelled by user");
          }

          minted.push({
            shareId: share.id,
            shareNumber: share.share_number,
            error: shareError.message,
          });
        }
      }

      setAllComplete(true);
      setIsMinting(false);
      alert(
        `✅ Successfully minted ${
          minted.filter((s) => !s.error).length
        } shares!`
      );
    } catch (err) {
      setError(err.message);
      console.error("❌❌❌ MAIN ERROR:", err);
      console.error("Error details:", err.message);
      console.error("Error stack:", err.stack);
      setError(err.message);
      setIsMinting(false);
      setIsMinting(false);
    }
  };

  return (
    <div>
      <div className="form-container">
        <button onClick={() => navigate("/home")} className="form-button">
          ← Back to Home
        </button>
      </div>

      <div>
        <h2>⛏️ Mint Acciones en Blockchain</h2>
        <p style={{ fontSize: "0.9em", color: "#666" }}>
          Mint Acciones NFTs de {company?.name}
        </p>
      </div>

      <div className="form-container">
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
              <strong>Contrato:</strong>
            </p>
            <p
              style={{
                fontSize: "0.85em",
                fontFamily: "monospace",
                wordBreak: "break-all",
              }}
            >
              {company.contract_address}
            </p>

            <a
              href={`https://sepolia.etherscan.io/address/${company.contract_address}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#2196F3", fontSize: "0.9em" }}
            >
              🔗 Ver contrato en Etherscan
            </a>
          </div>
        )}

        {shares.length > 0 && !isMinting && !allComplete && (
          <div
            style={{
              backgroundColor: "#fff3e0",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "20px",
              border: "2px solid #FF9800",
            }}
          >
            <h3 style={{ marginTop: 0 }}>📊 Acciones listas para Mint</h3>
            <p>
              <strong>Total:</strong> {shares.length} acciones
            </p>
            <ul style={{ paddingLeft: "20px" }}>
              {shares.map((share) => (
                <li key={share.id}>
                  Acción #{share.share_number} - Dueño: {share.shareholder_name}{" "}
                  - Precio: ${share.acquisition_price}
                </li>
              ))}
            </ul>
          </div>
        )}

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

        {!isMinting && !allComplete && shares.length > 0 && (
          <button
            onClick={mintAllShares}
            disabled={!userWallet || !company?.contract_address}
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              padding: "20px 40px",
              fontSize: "1.2em",
              border: "none",
              borderRadius: "10px",
              cursor: !userWallet ? "not-allowed" : "pointer",
              width: "100%",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            ⛏️ Mint {shares.length} Acciones en Blockchain
          </button>
        )}

        {isMinting && (
          <div
            style={{
              backgroundColor: "#fff3e0",
              padding: "30px",
              borderRadius: "10px",
              border: "3px solid #FF9800",
              textAlign: "center",
            }}
          >
            <h3 style={{ marginTop: 0 }}>⏳ Minting en Proceso...</h3>
            <p
              style={{ fontSize: "2em", fontWeight: "bold", margin: "20px 0" }}
            >
              {currentMinting} / {shares.length}
            </p>
            <p style={{ fontSize: "0.9em", color: "#666" }}>
              Espera mientras cada acción es minted en blockchain.
            </p>
          </div>
        )}

        {mintedShares.length > 0 && (
          <div
            style={{
              backgroundColor: "#f5f5f5",
              padding: "20px",
              borderRadius: "10px",
              marginTop: "20px",
            }}
          >
            <h3 style={{ marginTop: 0 }}>✅ Acciones Minted:</h3>
            {mintedShares.map((minted, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: minted.error ? "#ffebee" : "#e8f5e9",
                  border: minted.error
                    ? "1px solid #f44336"
                    : "1px solid #4CAF50",
                  padding: "10px",
                  borderRadius: "5px",
                  marginBottom: "10px",
                }}
              >
                <p style={{ margin: "5px 0" }}>
                  <strong>Acción #{minted.shareNumber}</strong>
                  {minted.error ? " - Failed" : " - Success"}
                </p>
                {minted.txHash && (
                  <>
                    <p
                      style={{
                        margin: "5px 0",
                        fontSize: "0.85em",
                        fontFamily: "monospace",
                      }}
                    >
                      TX: {minted.txHash}
                    </p>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${minted.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.85em", color: "#2196F3" }}
                    >
                      🔗 Ver en Etherscan
                    </a>
                  </>
                )}
                {minted.error && (
                  <p
                    style={{
                      margin: "5px 0",
                      fontSize: "0.85em",
                      color: "#c62828",
                    }}
                  >
                    Error: {minted.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {allComplete && (
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
              🎉 Acciones Minted con Éxito!
            </h2>
            <p style={{ fontSize: "1.1em", margin: "20px 0" }}>
              {mintedShares.filter((s) => !s.error).length} out of{" "}
              {shares.length} acciones existentes enn Sepolia!
            </p>
            <button
              onClick={() => navigate(`/company/${company_id}/ledger`)}
              style={{
                backgroundColor: "#2196F3",
                color: "white",
                padding: "15px 30px",
                fontSize: "1.1em",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                marginTop: "10px",
              }}
            >
              Ver libro de acciones →
            </button>
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
          Cierra sesión
        </button>
      </div>
    </div>
  );
}

export default MintShares;
