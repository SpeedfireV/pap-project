import "@/styles/styles.scss";
import type { AppProps } from "next/app";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/contexts/AuthContext";

const CLIENT_ID = "436533053234-td33v9jq36mlrj6fkpq4sf2gpo73o284.apps.googleusercontent.com"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
