using System.ComponentModel.DataAnnotations;

namespace CreditService.DTOs;

public class TopUpRequest
{
    [Required]
    public int CardId { get; set; }

    [Required]
    [Range(1, 1000000)]
    public decimal Amount { get; set; }
}
