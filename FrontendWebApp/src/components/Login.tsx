import Anchor from "react-bootstrap/Anchor";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const Login: React.FC = () => {
  return (
    <OverlayTrigger
      trigger="click"
      placement="bottom"
      overlay={
        <Popover>
          <Popover.Header as="h3">Login Window</Popover.Header>
          <Popover.Body>
            <GoogleLogin
              onSuccess={(credentialResponse => {
                console.log(jwtDecode(credentialResponse.credential)["name"])
              })}
              onError={() => console.log("Login failed")}/>
          </Popover.Body>
        </Popover>
      }
    >
      <Anchor className="text-success">Login</Anchor>
    </OverlayTrigger>
  );
};

export default Login