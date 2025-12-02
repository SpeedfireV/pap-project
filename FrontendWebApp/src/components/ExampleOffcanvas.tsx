import { useState } from "react";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Offcanvas from "react-bootstrap/Offcanvas";
import Link from "next/link";

export interface ExampleOffcanvasProps {
  className?: string | undefined;
}

const ExampleOffcanvas: React.FC<ExampleOffcanvasProps> = ({ className }) => {
  const [show, setShow] = useState(false);

  return (
    <>
      <Button onClick={() => setShow((s) => !s)} className={className}>
        ☰
      </Button>
      <Offcanvas placement="start" show={show} onHide={() => setShow(false)}>
        <Offcanvas.Header className="d-flex justify-content-between">
          <Offcanvas.Title as="h5">Offcanvas</Offcanvas.Title>
          <Button onClick={() => setShow((s) => !s)} className={className}>
            ☰
          </Button>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div>
            Some text as placeholder. In real life you can have the elements you
            have chosen. Like, text, images, lists, etc.
          </div>

          <DropdownButton
            variant="secondary"
            title="Dropdown button"
            className="mt-3"
          >
            <Dropdown.Item href="#"><Link href="/">Strona główna</Link></Dropdown.Item>
            <Dropdown.Item href="#"><Link href="/bug_report">Zgłoś błąd</Link></Dropdown.Item>
            <Dropdown.Item href="#">Something else here</Dropdown.Item>
          </DropdownButton>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default ExampleOffcanvas;
