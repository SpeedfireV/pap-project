using Microsoft.EntityFrameworkCore;

namespace WebApplication1;

public class DatabaseContext: DbContext
{
    public DatabaseContext(DbContextOptions<DatabaseContext> options) : base(options) {}
    
    
    public DbSet<Error> Errors => Set<Error>();
    public DbSet<Cargo> Cargos => Set<Cargo>();
    public DbSet<Route> Routes => Set<Route>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<Transport> Transports => Set<Transport>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<Driver> Drivers => Set<Driver>();
    
    public DbSet<StatusHistory> StatusHistories => Set<StatusHistory>();
    
    public DbSet<MaintenanceLog> MaintenanceLogs => Set<MaintenanceLog>();
    
    public DbSet<TransportCost> TransportCosts => Set<TransportCost>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<StatusHistory>()
            .HasOne(sh => sh.Job)
            .WithMany()
            .HasForeignKey(sh => sh.JobId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}