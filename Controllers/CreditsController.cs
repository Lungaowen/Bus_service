using System.Security.Claims;
using CreditService.Data;
using CreditService.DTOs;
using CreditService.Models;
using CreditService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CreditService.Controllers;

[ApiController]
[Route("api/credits")]
[Authorize]
public class CreditsController : ControllerBase
{
    private readonly CreditDbContext _db;
    private readonly CardServiceClient _cardService;
    private readonly ILogger<CreditsController> _logger;

    public CreditsController(CreditDbContext db, CardServiceClient cardService, ILogger<CreditsController> logger)
    {
        _db = db;
        _cardService = cardService;
        _logger = logger;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private string GetJwt() => Request.Headers.Authorization.ToString().Replace("Bearer ", "");

    [HttpPost("top-up")]
    public async Task<ActionResult<ApiResponse<TopUpResult>>> ProcessTopUp([FromBody] TopUpRequest request)
    {
        var userId = GetUserId();
        var jwt = GetJwt();

        var outstandingAdvances = await _db.CreditAdvances
            .Where(a => a.CardId == request.CardId && a.UserId == userId && a.Status == "Outstanding")
            .OrderBy(a => a.CreatedAt)
            .ToListAsync();

        var totalOutstanding = outstandingAdvances.Sum(a => a.RemainingAmount);
        var repaymentAmount = Math.Min(request.Amount, totalOutstanding);
        var creditToBalance = request.Amount - repaymentAmount;

        var remainingRepayment = repaymentAmount;
        foreach (var advance in outstandingAdvances)
        {
            if (remainingRepayment <= 0) break;

            var pay = Math.Min(advance.RemainingAmount, remainingRepayment);
            advance.RemainingAmount -= pay;
            remainingRepayment -= pay;

            if (advance.RemainingAmount == 0)
            {
                advance.Status = "Repaid";
                advance.RepaidAt = DateTime.UtcNow;
            }
        }

        var bonusAdvance = request.Amount > 100 ? request.Amount * 0.1m : 0;

        if (bonusAdvance > 0)
        {
            var limit = await _db.CreditLimits
                .FirstOrDefaultAsync(l => l.UserId == userId && (l.CardId == null || l.CardId == request.CardId));

            var maxAdvance = limit?.MaxAdvanceAmount ?? 500m;

            var currentOutstanding = totalOutstanding - repaymentAmount;

            if (currentOutstanding + bonusAdvance > maxAdvance)
                bonusAdvance = Math.Max(0, maxAdvance - currentOutstanding);
        }

        var netToCard = creditToBalance + bonusAdvance;

        if (netToCard > 0)
        {
            var success = await _cardService.TopUpCardAsync(request.CardId, netToCard, jwt);
            if (!success)
                return StatusCode(502, new ApiResponse<TopUpResult>
                {
                    Success = false,
                    Message = "CardService unavailable — top-up aborted"
                });
        }

        if (bonusAdvance > 0)
        {
            _db.CreditAdvances.Add(new CreditAdvance
            {
                CardId = request.CardId,
                UserId = userId,
                Amount = bonusAdvance,
                RemainingAmount = bonusAdvance,
                Currency = "ZAR",
                Status = "Outstanding"
            });
        }

        await _db.SaveChangesAsync();

        var newOutstanding = await _db.CreditAdvances
            .Where(a => a.CardId == request.CardId && a.UserId == userId && a.Status == "Outstanding")
            .SumAsync(a => a.RemainingAmount);

        var result = new TopUpResult
        {
            TopUpAmount = request.Amount,
            RepaidAmount = repaymentAmount,
            BonusAdvance = bonusAdvance,
            NetCreditedToCard = netToCard,
            NewOutstanding = newOutstanding,
            Currency = "ZAR"
        };

        return Ok(new ApiResponse<TopUpResult>
        {
            Success = true,
            Message = bonusAdvance > 0
                ? $"Top-up processed. R{repaymentAmount} repaid, R{bonusAdvance} bonus advance granted"
                : repaymentAmount > 0
                    ? $"Top-up processed. R{repaymentAmount} applied to outstanding advances"
                    : "Top-up processed successfully",
            Data = result
        });
    }

    [HttpPost("advances")]
    public async Task<ActionResult<ApiResponse<AdvanceResponse>>> TakeAdvance([FromBody] AdvanceRequest request)
    {
        var userId = GetUserId();
        var jwt = GetJwt();

        var limit = await _db.CreditLimits
            .FirstOrDefaultAsync(l => l.UserId == userId && (l.CardId == null || l.CardId == request.CardId));

        var maxAdvance = limit?.MaxAdvanceAmount ?? 500m;

        var currentOutstanding = await _db.CreditAdvances
            .Where(a => a.CardId == request.CardId && a.UserId == userId && a.Status == "Outstanding")
            .SumAsync(a => a.RemainingAmount);

        if (currentOutstanding + request.Amount > maxAdvance)
        {
            var available = maxAdvance - currentOutstanding;
            return BadRequest(new ApiResponse<AdvanceResponse>
            {
                Success = false,
                Message = $"Advance would exceed credit limit of R{maxAdvance}. R{available:F2} available"
            });
        }

        var success = await _cardService.TopUpCardAsync(request.CardId, request.Amount, jwt);
        if (!success)
            return StatusCode(502, new ApiResponse<AdvanceResponse>
            {
                Success = false,
                Message = "CardService unavailable — advance aborted"
            });

        var advance = new CreditAdvance
        {
            CardId = request.CardId,
            UserId = userId,
            Amount = request.Amount,
            RemainingAmount = request.Amount,
            Currency = "ZAR",
            Status = "Outstanding"
        };

        _db.CreditAdvances.Add(advance);
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<AdvanceResponse>
        {
            Success = true,
            Message = $"Advance of R{request.Amount} granted",
            Data = MapAdvance(advance)
        });
    }

    [HttpGet("cards/{cardId}/status")]
    public async Task<ActionResult<ApiResponse<CreditStatusResponse>>> GetStatus(int cardId)
    {
        var userId = GetUserId();

        var outstandingAdvances = await _db.CreditAdvances
            .Where(a => a.CardId == cardId && a.UserId == userId && a.Status == "Outstanding")
            .ToListAsync();

        var totalOutstanding = outstandingAdvances.Sum(a => a.RemainingAmount);

        var limit = await _db.CreditLimits
            .FirstOrDefaultAsync(l => l.UserId == userId && (l.CardId == null || l.CardId == cardId));

        var maxAdvance = limit?.MaxAdvanceAmount ?? 500m;

        return Ok(new ApiResponse<CreditStatusResponse>
        {
            Success = true,
            Message = "Credit status retrieved",
            Data = new CreditStatusResponse
            {
                TotalOutstanding = totalOutstanding,
                CreditLimit = maxAdvance,
                AvailableCredit = Math.Max(0, maxAdvance - totalOutstanding),
                ActiveAdvanceCount = outstandingAdvances.Count,
                Currency = "ZAR"
            }
        });
    }

    [HttpGet("cards/{cardId}/advances")]
    public async Task<ActionResult<ApiResponse<List<AdvanceResponse>>>> GetAdvances(int cardId)
    {
        var userId = GetUserId();

        var advances = await _db.CreditAdvances
            .Where(a => a.CardId == cardId && a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return Ok(new ApiResponse<List<AdvanceResponse>>
        {
            Success = true,
            Message = "Advances retrieved",
            Data = advances.Select(MapAdvance).ToList()
        });
    }

    [HttpPost("limits")]
    public async Task<ActionResult<ApiResponse<CreditLimit>>> SetLimit([FromBody] SetLimitRequest request)
    {
        var userId = GetUserId();

        var limit = await _db.CreditLimits
            .FirstOrDefaultAsync(l => l.UserId == userId && (l.CardId == null || l.CardId == request.CardId));

        if (limit == null)
        {
            limit = new CreditLimit
            {
                CardId = request.CardId,
                UserId = userId,
                MaxAdvanceAmount = request.MaxAmount,
                Currency = "ZAR"
            };
            _db.CreditLimits.Add(limit);
        }
        else
        {
            limit.MaxAdvanceAmount = request.MaxAmount;
            limit.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<CreditLimit>
        {
            Success = true,
            Message = $"Credit limit set to R{request.MaxAmount}",
            Data = limit
        });
    }

    private static AdvanceResponse MapAdvance(CreditAdvance a) => new()
    {
        Id = a.Id,
        CardId = a.CardId,
        Amount = a.Amount,
        RemainingAmount = a.RemainingAmount,
        Currency = a.Currency,
        Status = a.Status,
        CreatedAt = a.CreatedAt,
        RepaidAt = a.RepaidAt
    };
}
