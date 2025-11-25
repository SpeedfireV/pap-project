using Microsoft.EntityFrameworkCore;

namespace WebApplication1;

public class DatabaseContext: DbContext
{
    public DatabaseContext(DbContextOptions<DatabaseContext> options) : base(options) {}
    
    
    public DbSet<Error> Errors => Set<Error>();
}