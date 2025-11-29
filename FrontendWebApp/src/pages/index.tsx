import Head from "next/head";
import Container from "react-bootstrap/Container";
import AppGuides from "@/components/AppGuides";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ExampleComponents from "@/components/ExampleComponents";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ExampleOffcanvas from "@/components/ExampleOffcanvas";
import { Offcanvas } from "react-bootstrap";

const CLIENT_ID = "436533053234-td33v9jq36mlrj6fkpq4sf2gpo73o284.apps.googleusercontent.com"

export default function Home() {
  return (
    <>
      <GoogleOAuthProvider clientId={CLIENT_ID}>
        <Head>
          <title>Spedycja</title>
          <meta name="description" content="" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <ExampleOffcanvas className="me-3"/>
        <Container as="main" className="py-4 px-3 mx-auto">
          <Header />

          <h1>Początki aplikacji</h1>

          <ExampleComponents />

          <hr className="col-1 my-5 mx-0" />

          <AppGuides />
          <Footer />
        </Container>
      </GoogleOAuthProvider>
    </>
  );
}
