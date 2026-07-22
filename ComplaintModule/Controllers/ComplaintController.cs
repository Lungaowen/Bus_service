using Microsoft.AspNetCore.Mvc;
using ComplaintModule.Models;
using ComplaintModule.Services;

namespace ComplaintModule.Controllers;

[ApiController]
[Route("api/complaints")]
public class ComplaintController : ControllerBase
{
    private readonly ComplaintService _service;

    public ComplaintController(ComplaintService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] ComplaintRequest request)
    {
        var complaint = await _service.SubmitAsync(request);
        return Ok(new { message = "Complaint submitted successfully.", complaint.Id });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var complaints = await _service.GetAllAsync();
        return Ok(complaints);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateComplaintStatusRequest request)
    {
        var complaint = await _service.UpdateStatusAsync(id, request);
        if (complaint is null)
            return NotFound(new { message = "Complaint not found." });

        return Ok(complaint);
    }
}
