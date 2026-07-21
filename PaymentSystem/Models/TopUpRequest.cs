namespace PaymentSystem.Models;

public class TopUpRequest
{
    public string? JwtToken { get; set; }
    public string? UserId { get; set; }
    public string? CardNumber { get; set; }
    public string? CardHolderName { get; set; }
    public string? ExpiryDate { get; set; }
    public string? CVV { get; set; }
    public decimal Amount { get; set; }
}
