namespace CreditService.Models;

public class CreditAdvance
{
    public int Id { get; set; }
    public int CardId { get; set; }
    public int UserId { get; set; }
    public decimal Amount { get; set; }
    public decimal RemainingAmount { get; set; }
    public string Currency { get; set; } = "ZAR";
    public string Status { get; set; } = "Outstanding";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RepaidAt { get; set; }
}
