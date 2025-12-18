import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react"; // ← Add useRef
import api from "../api.js";
import "../styles/Home.css";

function DirectCreateShares() {
  const { company_id } = useParams();
  const navigate = useNavigate();

  const [user_name, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [shareInfo, setShareInfo] = useState("");

  const hasRun = useRef(false); // ← Guard flag

  const nominal_value = 1.0;
  const acquisition_price = nominal_value;

  useEffect(() => {
    // ← Only run once
    if (hasRun.current) return;
    hasRun.current = true;

    initializeShares();
  }, []);

  const initializeShares = async () => {
    try {
      // 1. Get user data
      const userData = await api.get("/api/userdata/");
      setUserName(userData.data.username);

      // 2. Get company data (for total_shares)
      const companyData = await api.get("/api/company/");
      const createdCompany = companyData.data.find(
        (company) => company.id === Number(company_id)
      );
      const quantity = createdCompany.total_shares;

      // 3. Get/calculate VPP
      const vppData = await api.get(
        `/api/company/${company_id}/calculate-vpp/`
      );
      const share_vpp = vppData.data.new_vpp;

      // 4. Create shares
      const shareResponse = await api.post("/api/shares/bulk-create/", {
        company_id,
        quantity,
        share_vpp,
        nominal_value,
        acquisition_price,
      });

      if (shareResponse.status === 201) {
        setLoading(false);
        setShareInfo(shareResponse.data.share_range);
        alert(
          `✅ ${shareResponse.data.message}\nRange: ${shareResponse.data.share_range}`
        );
      }
    } catch (error) {
      alert("Failed to create shares: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="form-container">
        <button onClick={() => navigate("/")} className="form-button">
          ← Back to Home
        </button>
      </div>

      <div>
        <h2>Hey, {user_name}! Your shares are being generated:</h2>
      </div>

      <div className="form-container">
        {loading ? (
          <p>LOADING....</p>
        ) : (
          <div>
            <p>✅ Shares created: {shareInfo}</p>
          </div>
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

export default DirectCreateShares;
