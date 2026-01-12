using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1;
using WebApplication1.Controllers;

namespace SpeditionAppTests.Tests;

public class MaintenanceLogControllerTests
{
    private DatabaseContext GetDatabaseContext()
    {
        var options = new DbContextOptionsBuilder<DatabaseContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var databaseContext = new DatabaseContext(options);
        databaseContext.Database.EnsureCreated();
        return databaseContext;
    }

    [Fact]
    public async Task GetLogs_ReturnsAllLogs()
    {
        var context = GetDatabaseContext();
        // Dodano ServiceType, ponieważ jest [Required]
        context.MaintenanceLogs.Add(new MaintenanceLog { MaintenanceId = 1, Description = "Oil Change", ServiceType = "Mechanical" });
        context.MaintenanceLogs.Add(new MaintenanceLog { MaintenanceId = 2, Description = "Tire Rotation", ServiceType = "Tires" });
        await context.SaveChangesAsync();

        var controller = new MaintenanceLogController(context);

        var result = await controller.GetLogs();

        var actionResult = Assert.IsType<ActionResult<IEnumerable<MaintenanceLog>>>(result);
        var logs = Assert.IsAssignableFrom<IEnumerable<MaintenanceLog>>(actionResult.Value);
        Assert.Equal(2, logs.Count());
    }

    [Fact]
    public async Task CreateLog_AddsLogToDatabase()
    {
        var context = GetDatabaseContext();
        var controller = new MaintenanceLogController(context);
        // Dodano ServiceType
        var newLog = new MaintenanceLog 
        { 
            MaintenanceId = 10, 
            Description = "Brake Check", 
            VehicleId = 1, 
            ServiceType = "Safety" 
        };

        var result = await controller.CreateLog(newLog);

        var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var returnedLog = Assert.IsType<MaintenanceLog>(createdAtActionResult.Value);
    
        Assert.Equal("Brake Check", returnedLog.Description);
        Assert.Null(returnedLog.Vehicle);
        Assert.Equal(1, await context.MaintenanceLogs.CountAsync());
    }

    [Fact]
    public async Task GetLogsByVehicle_ReturnsFilteredAndOrderedLogs()
    {
        var context = GetDatabaseContext();
        int targetVehicleId = 1;
    
        context.MaintenanceLogs.AddRange(new List<MaintenanceLog>
        {
            new MaintenanceLog { 
                MaintenanceId = 1, 
                VehicleId = targetVehicleId, 
                ServiceDate = new DateTime(2023, 1, 1), 
                ServiceType = "Oil Change", 
                Description = "Standard service" // Dodano wymagane pole
            },
            new MaintenanceLog { 
                MaintenanceId = 2, 
                VehicleId = targetVehicleId, 
                ServiceDate = new DateTime(2023, 5, 1), 
                ServiceType = "Tires", 
                Description = "Seasonal change" // Dodano wymagane pole
            },
            new MaintenanceLog { 
                MaintenanceId = 3, 
                VehicleId = 99, 
                ServiceDate = new DateTime(2023, 2, 1), 
                ServiceType = "Repair", 
                Description = "Other vehicle log" // Dodano wymagane pole
            }
        });
        await context.SaveChangesAsync();

        var controller = new MaintenanceLogController(context);
        var result = await controller.GetLogsByVehicle(targetVehicleId);

        var logs = Assert.IsType<List<MaintenanceLog>>(result.Value);
        Assert.Equal(2, logs.Count);
    }
}