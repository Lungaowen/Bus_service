using PaymentSystem.Models;
using TshwaneBusTicketingSystem;

namespace PaymentSystem.Services;

public class CardTopUpService
{
    public TopUpResponse TopUpCard(TopUpRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.JwtToken) || string.IsNullOrWhiteSpace(request.UserId) || !IsValidJwt(request.JwtToken))
        {
            return new TopUpResponse
            {
                Success = false,
                Message = "A valid JWT token and user ID are required."
            };
        }

        if (request.Amount <= 0)
        {
            return new TopUpResponse
            {
                Success = false,
                Message = "Amount must be greater than zero."
            };
        }

        var card = new VirtualCard(
            request.CardNumber ?? string.Empty,
            request.CardHolderName ?? string.Empty,
            request.ExpiryDate ?? string.Empty,
            request.CVV ?? string.Empty);

        if (!card.Validate())
        {
            return new TopUpResponse
            {
                Success = false,
                Message = "Card details are invalid."
            };
        }

        var transaction = new Transaction(request.Amount);

        return new TopUpResponse
        {
            Success = true,
            Message = "Top-up completed successfully.",
            Reference = transaction.Reference,
            Amount = transaction.Amount,
            UserId = request.UserId
        };
    }

    private static bool IsValidJwt(string token)
    {
        var parts = token.Split('.');
        return parts.Length == 3 && !string.IsNullOrWhiteSpace(parts[0]) && !string.IsNullOrWhiteSpace(parts[1]) && !string.IsNullOrWhiteSpace(parts[2]);
    }
}
