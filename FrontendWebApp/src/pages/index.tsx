import Head from "next/head";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ExampleOffcanvas from "@/components/ExampleOffcanvas";
import StatsCards from "@/components/Dashboard/StatsCards";
import Charts from "@/components/Dashboard/Charts";
import DataTables from "@/components/Dashboard/DataTables";
import RecentActivity from "@/components/Dashboard/RecentActivity";

const CLIENT_ID = "436533053234-td33v9jq36mlrj6fkpq4sf2gpo73o284.apps.googleusercontent.com"

export default function Home() {
  return (
    <>
      <GoogleOAuthProvider clientId={CLIENT_ID}>
        <Head>
          <title>Dashboard - Aplikacja Spedycyjna</title>
          <meta name="description" content="Dashboard for managing logistics and transportation" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <ExampleOffcanvas className="me-3"/>
        <Container as="main" className="py-4 px-3 mx-auto">
          <Header />

          <h1 className="mb-4">Dashboard</h1>

          {/* Statistics Cards */}
          <StatsCards />

          {/* Charts and Recent Activity Row */}
          <Row className="g-4 mb-4">
            <Col xs={12} lg={8}>
              <Charts />
            </Col>
            <Col xs={12} lg={4}>
              <RecentActivity />
            </Col>
          </Row>

          {/* Data Tables */}
          <div className="mb-4">
            <h2 className="mb-3">Data Management</h2>
            <DataTables />
          </div>

          <Footer />
        </Container>
      </GoogleOAuthProvider>
    </>
  );
}
