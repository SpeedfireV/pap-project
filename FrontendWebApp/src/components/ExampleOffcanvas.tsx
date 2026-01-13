import { useState } from "react";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import Offcanvas from "react-bootstrap/Offcanvas";
import Link from "next/link";

export interface ExampleOffcanvasProps {
  className?: string | undefined;
}

const ExampleOffcanvas: React.FC<ExampleOffcanvasProps> = ({ className }) => {
  const [show, setShow] = useState(false);

  const menuItems = [
    { href: "/", label: "Dashboard" },
    { href: "/bug_report", label: "Zgłoś błąd"},
    { href: "/data_entry", label: "Dodaj dane"}
  ];

  return (
    <>
      <Button 
        onClick={() => setShow((s) => !s)} 
        className={className}
        variant="outline-secondary"
        aria-label="Open navigation menu"
      >
        ☰ Menu
      </Button>
      <Offcanvas placement="start" show={show} onHide={() => setShow(false)}>
        <Offcanvas.Header className="d-flex justify-content-between border-bottom">
          <Offcanvas.Title as="h5" className="mb-0">
            Aplikacja Spedycyjna
          </Offcanvas.Title>
          <Button 
            onClick={() => setShow(false)} 
            variant="link" 
            className="p-0"
            aria-label="Close menu"
          >
            ✕
          </Button>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <ListGroup variant="flush">
            {menuItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className="text-decoration-none text-dark"
                onClick={() => setShow(false)}
              >
                <ListGroup.Item 
                  action
                  className="border-0 px-3 py-3"
                >
                  <span className="fw-medium">{item.label}</span>
                </ListGroup.Item>
              </Link>
            ))}
          </ListGroup>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default ExampleOffcanvas;
