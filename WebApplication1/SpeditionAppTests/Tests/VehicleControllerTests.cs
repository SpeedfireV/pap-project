using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using WebApplication1;
using WebApplication1.Controllers;
using WebApplication1.DTOs.Vehicle;

namespace SpeditionAppTests.Tests;

public class VehicleControllerTests
{
    private readonly DatabaseContext _context;
    private readonly Mock<ILogger<VehicleController>> _mockLogger;
    private readonly VehicleController _controller;

    public VehicleControllerTests()
    {
        var options = new DbContextOptionsBuilder<DatabaseContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new DatabaseContext(options);
        _mockLogger = new Mock<ILogger<VehicleController>>();
        _controller = new VehicleController(_context, _mockLogger.Object);
    }

    [Fact]
    public async Task GetVehicles_ReturnsCorrectPage_BasedOnLastId()
    {
        // Arrange
        _context.Vehicles.AddRange(
            new Vehicle { VehicleId = 1, LicensePlate = "ABC-01", Type = VehicleType.Van, Capacity = 1000, State = VehicleState.Operational },
            new Vehicle { VehicleId = 2, LicensePlate = "ABC-02", Type = VehicleType.RigidTruck, Capacity = 5000, State = VehicleState.InTransit },
            new Vehicle { VehicleId = 3, LicensePlate = "ABC-03", Type = VehicleType.Flatbed, Capacity = 8000, State = VehicleState.InDepot }
        );
        await _context.SaveChangesAsync();

        // Act - Requesting vehicles with ID greater than 1
        var result = await _controller.GetVehicles(lastId: 1, amount: 10);

        // Assert
        var actionResult = Assert.IsType<ActionResult<IEnumerable<Vehicle>>>(result);
        var vehicles = Assert.IsAssignableFrom<IEnumerable<Vehicle>>(actionResult.Value);
        Assert.Equal(2, vehicles.Count());
        Assert.DoesNotContain(vehicles, v => v.VehicleId == 1);
    }

    [Fact]
    public async Task GetVehicle_ReturnsOk_WhenVehicleExists()
    {
        // Arrange
        var vehicle = new Vehicle { LicensePlate = "TEST-99", Type = VehicleType.Refrigerated, Capacity = 2000, State = VehicleState.Operational };
        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();

        // Act
        var result = await _controller.GetVehicle(vehicle.VehicleId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedVehicle = Assert.IsType<Vehicle>(okResult.Value);
        Assert.Equal("TEST-99", returnedVehicle.LicensePlate);
    }

    [Fact]
    public async Task CreateVehicle_ReturnsCreatedResponse_AndAddsToDb()
    {
        // Arrange
        var dto = new CreateVehicleDto
        {
            LicensePlate = "NEW-123",
            Type = VehicleType.TractorTrailer,
            Capacity = 15000,
            State = VehicleState.InDepot
        };

        // Act
        var result = await _controller.CreateVehicle(dto);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var createdVehicle = Assert.IsType<Vehicle>(createdResult.Value);
        
        Assert.Equal("NEW-123", createdVehicle.LicensePlate);
        Assert.Equal(1, await _context.Vehicles.CountAsync());
        Assert.Equal("GetVehicle", createdResult.ActionName);
    }

    [Fact]
    public async Task DeleteVehicle_ReturnsNoContent_WhenSuccessful()
    {
        // Arrange
        var vehicle = new Vehicle { LicensePlate = "DEL-01", Type = VehicleType.Van, Capacity = 500, State = VehicleState.Retired };
        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();

        // Act
        var result = await _controller.DeleteVehicle(vehicle.VehicleId);

        // Assert
        Assert.IsType<NoContentResult>(result);
        Assert.Null(await _context.Vehicles.FindAsync(vehicle.VehicleId));
    }

    [Fact]
    public async Task DeleteVehicle_ReturnsNotFound_ForInvalidId()
    {
        // Act
        var result = await _controller.DeleteVehicle(999);

        // Assert
        Assert.IsType<NotFoundObjectResult>(result);
    }
}