import Form from "../components/Form";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function Login() {
  const navigate = useNavigate();

  return (
    <div>
      <div>
        <Form route="api/token/" method="login" />
      </div>
      <div className="form-container">
        <p>No tienes cuenta?</p>
        <button onClick={() => navigate("/register")} className="form-button">
          Crea cuenta
        </button>
      </div>
    </div>
  );
}

export default Login;
