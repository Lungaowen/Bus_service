namespace CreditService.DTOs;

public class AdvanceResponse
{
    public int Id { get; set; }
    public int CardId { get; set; }
    public decimal Amount { get; set; }
    public decimal RemainingAmount { get; set; }
    public string Currency { get; set; } = "";
    public string Status { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public DateTime? RepaidAt { get; set; }
}
