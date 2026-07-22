using Microsoft.EntityFrameworkCore;
using ComplaintModule.Data;
using ComplaintModule.Models;
using ComplaintModule.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace ComplaintModule.Services;

public class ComplaintService
{
    private readonly AppDbContext _db;
    private readonly IHubContext<ComplaintHub> _hub;

    public ComplaintService(AppDbContext db, IHubContext<ComplaintHub> hub)
    {
        _db = db;
        _hub = hub;
    }

    public async Task<List<ComplaintRecord>> GetAllAsync()
    {
        return await _db.ComplaintRecords.OrderByDescending(c => c.DateSubmitted).ToListAsync();
    }

    public async Task<ComplaintRecord> SubmitAsync(ComplaintRequest request)
    {
        var complaint = new ComplaintRecord
        {
            UserId = request.UserId,
            Subject = request.Subject,
            Description = request.Description
        };

        _db.ComplaintRecords.Add(complaint);
        await _db.SaveChangesAsync();

        await _hub.Clients.All.SendAsync("ComplaintSubmitted", complaint);
        return complaint;
    }

    public async Task<ComplaintRecord?> UpdateStatusAsync(Guid id, UpdateComplaintStatusRequest request)
    {
        var complaint = await _db.ComplaintRecords.FindAsync(id);
        if (complaint is null) return null;

        complaint.Status = request.Status;
        complaint.AdminResponse = request.AdminResponse;
        await _db.SaveChangesAsync();

        await _hub.Clients.All.SendAsync("ComplaintUpdated", complaint);
        return complaint;
    }
}
