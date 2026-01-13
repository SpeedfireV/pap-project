import { Form, Button } from "react-bootstrap";
import { useRef, FormEvent, useState } from "react";
import { CreateErrorTicketDto } from "@/types/api";
import { errorTicketApi, ApiError } from "@/services/api"

const BugReportForm: React.FC = () => {
  const nameRef = useRef<HTMLTextAreaElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    
    if (!nameRef.current?.value.trim() || !descRef.current?.value.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const bugReport: CreateErrorTicketDto = {
        ticketName: nameRef.current.value.trim(),
        ticketDescription: descRef.current.value.trim(),
      };

      // Use the centralized API service
      await errorTicketApi.create(bugReport);

      // Clear form on successful submission
      nameRef.current.value = '';
      descRef.current.value = '';
      setSuccess(true);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
      
    } catch (err) {
      console.error("Error submitting bug report:", err);
      
      if (err instanceof ApiError) {
        // Handle API-specific errors
        setError(`API Error (${err.status}): ${err.message}`);
      } else if (err instanceof Error) {
        // Handle general errors
        setError(`Error: ${err.message}`);
      } else {
        // Handle unknown errors
        setError("An unexpected error occurred. Please try again.");
      }
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