using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace CreditService.Services;

public class CardServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<CardServiceClient> _logger;

    public CardServiceClient(HttpClient httpClient, ILogger<CardServiceClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<bool> TopUpCardAsync(int cardId, decimal amount, string jwtToken)
    {
        try
        {
            var payload = new { amount };
            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var request = new HttpRequestMessage(HttpMethod.Post, $"/api/cards/{cardId}/top-up")
            {
                Content = content
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", jwtToken);

            var response = await _httpClient.SendAsync(request);
            var body = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("CardService returned {StatusCode} for card {CardId}: {Body}",
                    response.StatusCode, cardId, body);
                return false;
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to call CardService for card {CardId}", cardId);
            return false;
        }
    }
}
