using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using WebApplication1;
using WebApplication1.Controllers;
using WebApplication1.DTOs.Transport;
using WebApplication1.Models.Transport;

namespace SpeditionAppTests.Tests;

public class TransportControllerTests
{
    private readonly DatabaseContext _context;
    private readonly TransportController _controller;

    public TransportControllerTests()
    {
        var options = new DbContextOptionsBuilder<DatabaseContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new DatabaseContext(options);
        Mock<ILogger<TransportController>> mockLogger = new();
        _controller = new TransportController(_context, mockLogger.Object);
    }

    [Fact]
    public async Task CreateTransport_ReturnsCreatedAtAction_WithValidData()
    {
        // Arrange
        var dto = new CreateTransportDto
        {
            JobId = 1,
            VehicleId = 10,
            DriverId = 5,
            StartDate = new DateOnly(2024, 5, 1),
            EndDate = new DateOnly(2024, 5, 5),
            CargoMass = 2000,
            Status = TransportStatus.BookingConfirmed
        };

        // Act
        var result = await _controller.CreateTransport(dto);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var transport = Assert.IsType<Transport>(createdResult.Value);
        Assert.Equal(2000, transport.CargoMass);
        Assert.Equal(1, await _context.Transports.CountAsync());
    }

    [Fact]
    public async Task GetTransport_ReturnsNotFound_WhenIdDoesNotExist()
    {
        // Act
        var result = await _controller.GetTransport(999);

        // Assert
        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task UpdateTransport_UpdatesFields_WhenSuccessful()
    {
        // Arrange
        var transport = new Transport
        {
            JobId = 1, VehicleId = 1, DriverId = 1,
            StartDate = new DateOnly(2024, 1, 1), EndDate = new DateOnly(2024, 1, 2),
            CargoMass = 500, Status = TransportStatus.PickupScheduled
        };
        _context.Transports.Add(transport);
        await _context.SaveChangesAsync();

        var updateDto = new UpdateTransportDto
        {
            JobId = 1, VehicleId = 1, DriverId = 1,
            StartDate = new DateOnly(2024, 1, 1), EndDate = new DateOnly(2024, 1, 2),
            CargoMass = 1000, // Changed
            Status = TransportStatus.InTransit // Changed
        };

        // Act
        var result = await _controller.UpdateTransport(transport.TransportId, updateDto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var updated = Assert.IsType<Transport>(okResult.Value);
        Assert.Equal(1000, updated.CargoMass);
        Assert.Equal(TransportStatus.InTransit, updated.Status);
    }

    [Fact]
    public async Task GetTransports_ReturnsCorrectAmount_WithPagination()
    {
        // Arrange
        for (int i = 1; i <= 15; i++)
        {
            _context.Transports.Add(new Transport 
            { 
                TransportId = i, JobId = i, DriverId = i, VehicleId = i,
                StartDate = new DateOnly(2024, 1, 1), EndDate = new DateOnly(2024, 1, 2)
            });
        }
        await _context.SaveChangesAsync();

        // Act - Request 5 items starting after ID 5
        var result = await _controller.GetTransports(lastId: 5, amount: 5);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsAssignableFrom<IEnumerable<Transport>>(okResult.Value);
        Assert.Equal(5, list.Count());
        Assert.Equal(6, list.First().TransportId); // Should start at 6
        Assert.Equal(10, list.Last().TransportId); // Should end at 10
    }

    [Fact]
    public async Task DeleteTransport_RemovesRecordFromDb()
    {
        // Arrange
        var transport = new Transport { JobId = 1, VehicleId = 1, DriverId = 1 };
        _context.Transports.Add(transport);
        await _context.SaveChangesAsync();

        // Act
        var result = await _controller.DeleteTransport(transport.TransportId);

        // Assert
        Assert.IsType<NoContentResult>(result);
        Assert.Equal(0, await _context.Transports.CountAsync());
    }
}