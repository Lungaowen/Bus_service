namespace CreditService.DTOs;

public class CreditStatusResponse
{
    public decimal TotalOutstanding { get; set; }
    public decimal CreditLimit { get; set; }
    public decimal AvailableCredit { get; set; }
    public int ActiveAdvanceCount { get; set; }
    public string Currency { get; set; } = "ZAR";
}
