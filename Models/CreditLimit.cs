namespace CreditService.Models;

public class CreditLimit
{
    public int Id { get; set; }
    public int? CardId { get; set; }
    public int UserId { get; set; }
    public decimal MaxAdvanceAmount { get; set; } = 500;
    public string Currency { get; set; } = "ZAR";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
