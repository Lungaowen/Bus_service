using PaymentSystem.Models;
using PaymentSystem.Services;
using Xunit;

namespace PaymentSystem.Tests;

public class CardTopUpServiceTests
{
    [Fact]
    public void TopUpCard_WithValidRequest_ReturnsSuccess()
    {
        var service = new CardTopUpService();
        var request = new TopUpRequest
        {
            JwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEifQ.signature",
            UserId = "user-1",
            CardNumber = "4111111111111111",
            CardHolderName = "Jane Doe",
            ExpiryDate = "12/30",
            CVV = "123",
            Amount = 250
        };

        var response = service.TopUpCard(request);

        Assert.True(response.Success);
        Assert.Equal("Top-up completed successfully.", response.Message);
        Assert.Equal(250, response.Amount);
    }
}
