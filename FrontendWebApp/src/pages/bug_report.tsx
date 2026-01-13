import Head from "next/head";
import Container from "react-bootstrap/Container";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import BugReportForm from "@/components/BugReportForm";
import ExampleOffcanvas from "@/components/ExampleOffcanvas";

export default function BugReport() {
  return (
    <>
        <Head>
          <title>Spedycja</title>
          <meta name="description" content="" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <ExampleOffcanvas className="me-3"/>
        <Container as="main" className="py-4 px-3 mx-auto">
          <Header />

          <h1>Zgłoś błąd</h1>

          <BugReportForm />

          <Footer />
        </Container>
    </>
  );
}
