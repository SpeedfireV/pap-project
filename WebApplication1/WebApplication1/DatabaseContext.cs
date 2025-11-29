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
}