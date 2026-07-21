namespace PaymentSystem.Models;

public class TopUpResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? Reference { get; set; }
    public decimal Amount { get; set; }
    public string? UserId { get; set; }
}
