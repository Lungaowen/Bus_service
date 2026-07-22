using Microsoft.EntityFrameworkCore;
using ComplaintModule.Models;

namespace ComplaintModule.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<ComplaintRecord> ComplaintRecords => Set<ComplaintRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ComplaintRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Subject).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).IsRequired();
            entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("Pending");
            entity.Property(e => e.DateSubmitted).HasDefaultValueSql("now()");
            entity.Property(e => e.UserId).HasDefaultValue(Guid.Empty);
            entity.HasIndex(e => e.UserId);
        });
    }
}
