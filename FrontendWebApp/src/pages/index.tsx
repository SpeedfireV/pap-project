import { useState, useRef } from 'react';
import Head from "next/head";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ExampleOffcanvas from "@/components/ExampleOffcanvas";
import StatsCards from "@/components/Dashboard/StatsCards";
import Charts from "@/components/Dashboard/Charts";
import DataTables from "@/components/Dashboard/DataTables";
import RecentActivity from "@/components/Dashboard/RecentActivity";

export default function Home() {
  const [activeTab, setActiveTab] = useState('clients');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const dataTablesRef = useRef<HTMLDivElement>(null);

  const handleCardClick = (tabKey: string) => {
    setActiveTab(tabKey);
    dataTablesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Function to trigger refresh of all components
  const handleDataChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
        <Head>
          <title>Dashboard - Aplikacja Spedycyjna</title>
          <meta name="description" content="Dashboard for managing logistics and transportation" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <ExampleOffcanvas className="me-3" />
        <Container as="main" className="py-4 px-3 mx-auto">
          <Header />

          <h1 className="mb-4">Dashboard</h1>

          {/* Statistics Cards */}
          <StatsCards 
            onCardClick={handleCardClick} 
            refreshTrigger={refreshTrigger}
          />

          {/* Charts and Recent Activity Row */}
          <Row className="g-4 mb-4">
            <Col xs={12} lg={8}>
              <Charts refreshTrigger={refreshTrigger} />
            </Col>
            <Col xs={12} lg={4}>
              <RecentActivity refreshTrigger={refreshTrigger} />
            </Col>
          </Row>

          {/* Data Tables */}
          <div className="mb-4" ref={dataTablesRef}>
            <h2 className="mb-3">Data Management</h2>
            <DataTables 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
              onDataChange={handleDataChange}
            />
          </div>

          <Footer />
        </Container>
    </>
  );
}