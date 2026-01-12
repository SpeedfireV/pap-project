import { Form, Button } from "react-bootstrap";
import { useRef, FormEvent, useState } from "react";

interface BugReportData {
  name: string;
  description: string;
  ticketDate: string;
}

const BugReportForm: React.FC = () => {
  const nameRef = useRef<HTMLTextAreaElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    if (!nameRef.current?.value.trim() || !descRef.current?.value.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const bugReport: BugReportData = {
        name: nameRef.current.value,
        description: descRef.current.value,
        ticketDate: new Date().toISOString(),
      };

      const response = await fetch('/api/ErrorTicket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bugReport),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Clear form on successful submission
      nameRef.current.value = '';
      descRef.current.value = '';
      
      alert("Bug report submitted successfully!");
      
    } catch (error) {
      console.error("Error submitting bug report:", error);
      alert("Failed to submit bug report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="formErrName">
        <Form.Label>Nazwij błąd</Form.Label>
        <Form.Control 
          as="textarea" 
          ref={nameRef}
          required
          disabled={isSubmitting}
        />
      </Form.Group>
      
      <Form.Group className="mb-3" controlId="formErrDesc">
        <Form.Label>Opisz błąd</Form.Label>
        <Form.Control 
          as="textarea" 
          rows={3} 
          ref={descRef}
          required
          disabled={isSubmitting}
        />
      </Form.Group>
      
      <Button 
        variant="primary" 
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Wysyłanie..." : "Wyślij"}
      </Button>
    </Form>
  );
};

export default BugReportForm;