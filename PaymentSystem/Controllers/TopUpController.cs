using Microsoft.AspNetCore.Mvc;
using PaymentSystem.Models;
using PaymentSystem.Services;

namespace PaymentSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TopUpController : ControllerBase
{
    private readonly CardTopUpService _cardTopUpService;

    public TopUpController(CardTopUpService cardTopUpService)
    {
        _cardTopUpService = cardTopUpService;
    }

    [HttpPost("card")]
    public IActionResult TopUpCard([FromBody] TopUpRequest request)
    {
        var response = _cardTopUpService.TopUpCard(request);

        if (!response.Success)
        {
            return BadRequest(response);
        }

        return Ok(response);
    }
}
