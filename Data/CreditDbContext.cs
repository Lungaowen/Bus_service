using CreditService.Models;
using Microsoft.EntityFrameworkCore;

namespace CreditService.Data;

public class CreditDbContext : DbContext
{
    public CreditDbContext(DbContextOptions<CreditDbContext> options) : base(options)
    {
    }

    public DbSet<CreditAdvance> CreditAdvances { get; set; } = null!;
    public DbSet<CreditLimit> CreditLimits { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("card_service");

        modelBuilder.Entity<CreditAdvance>(entity =>
        {
            entity.ToTable("credit_advances");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CardId).HasColumnName("card_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Amount).HasColumnName("amount");
            entity.Property(e => e.RemainingAmount).HasColumnName("remaining_amount");
            entity.Property(e => e.Currency).HasColumnName("currency").HasDefaultValue("ZAR");
            entity.Property(e => e.Status).HasColumnName("status").HasDefaultValue("Outstanding");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.RepaidAt).HasColumnName("repaid_at");
            entity.HasIndex(e => e.CardId).HasDatabaseName("ix_credit_advances_card_id");
            entity.HasIndex(e => e.UserId).HasDatabaseName("ix_credit_advances_user_id");
            entity.HasIndex(e => e.Status).HasDatabaseName("ix_credit_advances_status");
        });

        modelBuilder.Entity<CreditLimit>(entity =>
        {
            entity.ToTable("credit_limits");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CardId).HasColumnName("card_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.MaxAdvanceAmount).HasColumnName("max_advance_amount").HasDefaultValue(500m);
            entity.Property(e => e.Currency).HasColumnName("currency").HasDefaultValue("ZAR");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.HasIndex(e => e.UserId).HasDatabaseName("ix_credit_limits_user_id");
            entity.HasIndex(e => e.CardId).HasDatabaseName("ix_credit_limits_card_id");
        });
    }
}
