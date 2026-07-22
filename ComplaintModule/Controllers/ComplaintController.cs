using Microsoft.AspNetCore.Mvc;

namespace ComplaintModule.Controllers;

[ApiController]
[Route("api/complaints")]
public class ComplaintController : ControllerBase
{
    private static readonly List<ComplaintRecord> Complaints = new();

    [HttpPost]
    public IActionResult Submit([FromBody] ComplaintRequest request)
    {
        var complaint = new ComplaintRecord
        {
            Id = Guid.NewGuid(),
            Subject = request.Subject,
            Description = request.Description,
            Status = "Pending",
            DateSubmitted = DateTime.UtcNow
        };

        Complaints.Add(complaint);
        return Ok(new { message = "Complaint submitted successfully.", complaint.Id });
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(Complaints);

    [HttpPut("{id}")]
    public IActionResult UpdateStatus(Guid id, [FromBody] UpdateComplaintStatusRequest request)
    {
        var complaint = Complaints.FirstOrDefault(c => c.Id == id);
        if (complaint is null)
        {
            return NotFound(new { message = "Complaint not found." });
        }

        complaint.Status = request.Status;
        complaint.AdminResponse = request.AdminResponse;
        return Ok(complaint);
    }
}

public class ComplaintRequest
{
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class UpdateComplaintStatusRequest
{
    public string Status { get; set; } = "Resolved";
    public string? AdminResponse { get; set; }
}

public class ComplaintRecord
{
    public Guid Id { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? AdminResponse { get; set; }
    public DateTime DateSubmitted { get; set; }
}
