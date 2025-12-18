import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";

function Form({ route, method }) {
  //route -> corresponds to the endpoint we want to submit the form to
  //it may be the token route or register route
  //the method is telling us whether we are registering or login in

  //State variables: username and password:
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [wallet_address, setWallet] = useState("");
  const [condition, setCondition] = useState("");
  const [loading, setLoading] = useState(false);

  //calling the useNavigate hook
  const navigate = useNavigate();

  //assess the name of the name of the form -> if method = login, name is login, else it will be register
  //It is the method that is passed as a prop when the Form component is called
  const formName = method === "login" ? "Login" : "Register";

  //submit function
  //It takes aa Rich Event object named e
  const handleSubmit = async (e) => {
    //we update the state variable -> Loading
    setLoading(true);
    e.preventDefault(); // prevent a default -> reloading after form was submitted

    //We will try to send a request to the api
    try {
      //we send a request to the backend -> to the enpoint from the route specified from which the form is called
      //we are using the api which is an axios instance object
      const response = await api.post(route, {
        username,
        password,
        condition,
        wallet_address,
      });
      if (method === "login") {
        //we retrieve the tokens from the response and register it in the local storage
        localStorage.setItem(ACCESS_TOKEN, response.data.access);
        localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
        //navigating to Home
        navigate("/");
      } else {
        //it is someone that registered. Method == "register"
        // -> Therefore the person needs to navigate and login again to obtain the tokens
        navigate("/login");
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  //basic form
  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h1>{formName}</h1>
      <input
        className="form-input"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter the username"
      />
      <input
        className="form-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter the password"
      />
      {/* Conditional input - shows only if formName is "Sign Up" */}
      {formName === "Register" && (
        <select
          className="form-input"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        >
          <option value="">Select Status</option>
          <option value="shareholder">Shareholder</option>
          <option value="authority">Authority</option>
        </select>
      )}
      {formName === "Register" && (
        <input
          className="form-input"
          type="text"
          value={wallet_address}
          onChange={(e) => setWallet(e.target.value)}
          placeholder="Enter the wallet"
        />
      )}
      <button className="form-button" type="submit">
        {formName}
      </button>
    </form>
  );
}

export default Form;
