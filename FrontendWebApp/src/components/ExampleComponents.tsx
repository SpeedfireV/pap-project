import Col from "react-bootstrap/Col";
import ExamplePopover from "@/components/ExamplePopover";
import ExampleOffcanvas from "./ExampleOffcanvas";

const ExampleComponents: React.FC = () => {
  return (
    <>
      <Col lg={8} className="px-0">
        <p className="fs-4">
          Bootstrap + React
        </p>
        <p>
          Some text
        </p>
      </Col>

      <ExampleOffcanvas className="me-3" />
      <ExamplePopover />
    </>
  );
};

export default ExampleComponents;
