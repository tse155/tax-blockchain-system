import Form from "../components/Form";

function Register() {
  //route of the api endpoint where we are sending the request to:
  return <Form route="api/user/register/" method="register" />;
}

export default Register;
