namespace WebApplication1.DTOs.Invoice;

public class CreateInvoiceDto
{
    public required int JobId { set; get; }
    public required int Number { set; get; }
    public required int Amount { set; get; }
    public required DateOnly IssueDate { set; get; }
    public required DateOnly Maturity { set; get; }
    public required InvoicePaymentStatus PaymentStatus { set; get; }
}