namespace SmartClass.API.Data;

using Microsoft.EntityFrameworkCore;
using SmartClass.API.Models.Entities;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Class> Classes { get; set; }
    public DbSet<ClassEnrollment> ClassEnrollments { get; set; }
    public DbSet<Assignment> Assignments { get; set; }
    public DbSet<Submission> Submissions { get; set; }
    public DbSet<Announcement> Announcements { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(50);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(50);
        });

        // Class configuration
        modelBuilder.Entity<Class>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.JoinCode).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.JoinCode).IsRequired().HasMaxLength(10);
            
            entity.HasOne(e => e.Teacher)
                  .WithMany(u => u.ClassesTeaching)
                  .HasForeignKey(e => e.TeacherId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ClassEnrollment configuration
        modelBuilder.Entity<ClassEnrollment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.ClassId, e.StudentId }).IsUnique();
            
            entity.HasOne(e => e.Class)
                  .WithMany(c => c.Enrollments)
                  .HasForeignKey(e => e.ClassId)
                  .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.Student)
                  .WithMany(u => u.Enrollments)
                  .HasForeignKey(e => e.StudentId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Assignment configuration
        modelBuilder.Entity<Assignment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            
            entity.HasOne(e => e.Class)
                  .WithMany(c => c.Assignments)
                  .HasForeignKey(e => e.ClassId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Submission configuration
        modelBuilder.Entity<Submission>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.HasOne(e => e.Assignment)
                  .WithMany(a => a.Submissions)
                  .HasForeignKey(e => e.AssignmentId)
                  .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.Student)
                  .WithMany(u => u.Submissions)
                  .HasForeignKey(e => e.StudentId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Announcement configuration
        modelBuilder.Entity<Announcement>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            
            entity.HasOne(e => e.Class)
                  .WithMany(c => c.Announcements)
                  .HasForeignKey(e => e.ClassId)
                  .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.Creator)
                  .WithMany()
                  .HasForeignKey(e => e.CreatedBy)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}