using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using WebApplication1;
using WebApplication1.Controllers;
using WebApplication1.DTOs.TransportCost;

namespace SpeditionAppTests.Tests;

public class TransportCostsControllerTests
{
    private readonly DatabaseContext _context;
    private readonly TransportCostsController _controller;

    public TransportCostsControllerTests()
    {
        var options = new DbContextOptionsBuilder<DatabaseContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new DatabaseContext(options);
        Mock<ILogger<TransportCostsController>> mockLogger = new();
        _controller = new TransportCostsController(_context, mockLogger.Object);
    }

    [Fact]
    public async Task PostTransportCost_ReturnsBadRequest_WhenTransportDoesNotExist()
    {
        // Arrange
        var dto = new CreateTransportCostDto { TransportId = 99, Description = "Fuel", Amount = 100 };

        // Act
        var result = await _controller.PostTransportCost(dto);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal("Transport 99 not found.", badRequest.Value);
    }

    [Fact]
    public async Task PostTransportCost_ReturnsCreated_WhenValid()
    {
        // Arrange
        var transport = new Transport { TransportId = 1 }; // Assuming a basic Transport model exists
        _context.Transports.Add(transport);
        await _context.SaveChangesAsync();

        var dto = new CreateTransportCostDto 
        { 
            TransportId = 1, 
            Description = "Highway Toll", 
            Amount = 45.50m,
            Currency = "PLN",
            Category = CostCategory.Toll
        };

        // Act
        var result = await _controller.PostTransportCost(dto);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var cost = Assert.IsType<TransportCost>(createdResult.Value);
        Assert.Equal(45.50m, cost.Amount);
        Assert.Equal(1, await _context.TransportCosts.CountAsync());
    }

    [Fact]
    public async Task GetCostsByTransport_ReturnsList()
    {
        // Arrange
        int tId = 5;
        _context.TransportCosts.AddRange(
            new TransportCost { TransportId = tId, Description = "C1", Amount = 10, Currency = "PLN" },
            new TransportCost { TransportId = tId, Description = "C2", Amount = 20, Currency = "PLN" },
            new TransportCost { TransportId = 2, Description = "Other", Amount = 50, Currency = "PLN" }
        );
        await _context.SaveChangesAsync();

        // Act
        var result = await _controller.GetCostsByTransport(tId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var costs = Assert.IsAssignableFrom<IEnumerable<TransportCost>>(okResult.Value);
        Assert.Equal(2, costs.Count());
    }

    [Fact]
    public async Task GetTotalCost_ReturnsSumOfAmounts()
    {
        // Arrange
        int tId = 10;
        _context.TransportCosts.AddRange(
            new TransportCost { TransportId = tId, Amount = 100.50m, Description = "A", Currency = "PLN" },
            new TransportCost { TransportId = tId, Amount = 200.25m, Description = "B", Currency = "PLN" }
        );
        await _context.SaveChangesAsync();

        // Act
        var result = await _controller.GetTotalCost(tId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(300.75m, (decimal)okResult.Value!);
    }
}