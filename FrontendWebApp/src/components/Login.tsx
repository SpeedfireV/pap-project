import Anchor from "react-bootstrap/Anchor";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { user, login, logout, isAuthenticated } = useAuth();

  const handleSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      login(credentialResponse.credential);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="d-flex align-items-center">
        <span className="me-3">{user.name}</span>
        <Anchor 
          className="text-danger" 
          onClick={logout}
          style={{ cursor: 'pointer' }}
        >
          Logout
        </Anchor>
      </div>
    );
  }

  return (
    <OverlayTrigger
      trigger="click"
      placement="bottom"
      overlay={
        <Popover>
          <Popover.Header as="h3">Login Window</Popover.Header>
          <Popover.Body>
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => console.log("Login failed")}
            />
          </Popover.Body>
        </Popover>
      }
    >
      <Anchor className="text-success" style={{ cursor: 'pointer' }}>
        Login
      </Anchor>
    </OverlayTrigger>
  );
};

export default Login;