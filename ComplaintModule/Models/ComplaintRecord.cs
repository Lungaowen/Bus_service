namespace ComplaintModule.Models;

public class ComplaintRecord
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public string? AdminResponse { get; set; }
    public DateTime DateSubmitted { get; set; } = DateTime.UtcNow;
}

public class ComplaintRequest
{
    public Guid UserId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class UpdateComplaintStatusRequest
{
    public string Status { get; set; } = "Resolved";
    public string? AdminResponse { get; set; }
}
