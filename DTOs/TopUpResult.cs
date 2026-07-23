namespace CreditService.DTOs;

public class TopUpResult
{
    public decimal TopUpAmount { get; set; }
    public decimal RepaidAmount { get; set; }
    public decimal BonusAdvance { get; set; }
    public decimal NetCreditedToCard { get; set; }
    public decimal NewOutstanding { get; set; }
    public string Currency { get; set; } = "ZAR";
}
