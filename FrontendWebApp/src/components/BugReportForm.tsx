import { Form } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { useRef } from "react";

const BugReportForm: React.FC = () => {
    let nameRef = useRef(null);
    let descRef = useRef(null);

    function httppost()
    {
        fetch('/api/ErrorTicket', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({TicketName: nameRef.current.val, TicketDesctiption: descRef.current.val}),
        })
    }
    return (
        <>
            <Form>
                <Form.Group className="mb-3" controlId="formErrName" ref={nameRef}>
                    <Form.Label>Nazwij błąd</Form.Label>
                    <Form.Control as="textarea" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formErrDesc" ref={descRef}>
                    <Form.Label>Opisz błąd</Form.Label>
                    <Form.Control as="textarea" rows={3} />
                </Form.Group>
                <Button variant="primary" type="submit" onClick={httppost}>
                    Wyślij
                </Button>
            </Form>
        </>
    );
};

export default BugReportForm