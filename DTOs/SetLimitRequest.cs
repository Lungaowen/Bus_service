using System.ComponentModel.DataAnnotations;

namespace CreditService.DTOs;

public class SetLimitRequest
{
    public int? CardId { get; set; }

    [Required]
    [Range(0, 1000000)]
    public decimal MaxAmount { get; set; }
}
