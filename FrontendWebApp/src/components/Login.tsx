import Anchor from "react-bootstrap/Anchor";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from '../contexts/AuthContext';
import Spinner from 'react-bootstrap/Spinner';

interface Window {
  google?: {
    accounts: {
      id: {
        revoke: (email?: string) => void;
      };
    };
  };
}

const Login: React.FC = () => {
  const { user, login, logout, isAuthenticated, isLoading } = useAuth();

  const handleSuccess = (credentialResponse: any) => {
    console.log('Google login successful:', credentialResponse);
    
    if (credentialResponse.credential) {
      try {
        login(credentialResponse.credential);
      } catch (error) {
        console.error('Login failed:', error);
        alert('Login failed. Please try again.');
      }
    } else {
      console.error('No credential in response');
      alert('Login failed. No credential received.');
    }
  };

  const handleError = () => {
    console.log("Google login failed");
    alert("Google login failed. Please try again.");
  };

  if (isLoading) {
    return (
      <Spinner animation="border" size="sm" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="d-flex align-items-center">
        {user.picture && (
          <img 
            src={user.picture} 
            alt={user.name}
            className="rounded-circle me-2"
            style={{ width: '32px', height: '32px' }}
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <span className="me-3 text-truncate" style={{ maxWidth: '150px' }}>
          {user.name}
        </span>
        <Anchor 
          className="text-danger" 
          onClick={logout}
          style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
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
      rootClose
      overlay={
        <Popover>
          <Popover.Header as="h3">Login Window</Popover.Header>
          <Popover.Body className="text-center">
            <p className="mb-3">Sign in with Google to continue</p>
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap={false}
              theme="filled_blue"
              shape="rectangular"
              size="large"
              text="signin_with"
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