using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using WebApplication1;
using WebApplication1.Controllers;
using WebApplication1.DTOs.Error;

namespace SpeditionAppTests.Tests;

public class ErrorControllerTests
{
    private readonly DatabaseContext _context;
    private readonly ErrorController _controller;

    public ErrorControllerTests()
    {
        // Setup In-Memory Database
        var options = new DbContextOptionsBuilder<DatabaseContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Unique name per test run
            .Options;
        
        _context = new DatabaseContext(options);
        Mock<ILogger<ErrorController>> mockLogger = new();
        
        _controller = new ErrorController(_context, mockLogger.Object);
    }

    [Fact]
    public async Task CreateError_ReturnsCreatedAtAction_WhenValid()
    {
        // Arrange
        var dto = new CreateErrorDto 
        { 
            TicketName = "Test Error", 
            TicketDescription = "Something went wrong" 
        };

        // Act
        var result = await _controller.CreateError(dto);

        // Assert
        var actionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var returnedError = Assert.IsType<Error>(actionResult.Value);
        Assert.Equal(dto.TicketName, returnedError.Name);
        Assert.Equal(1, await EntityFrameworkQueryableExtensions.CountAsync(_context.Errors));
    }

    [Fact]
    public async Task GetErrors_ReturnsAllErrors()
    {
        // Arrange
        _context.Errors.Add(new Error { Name = "E1", Description = "D1", TicketDate = DateTime.UtcNow });
        _context.Errors.Add(new Error { Name = "E2", Description = "D2", TicketDate = DateTime.UtcNow });
        await _context.SaveChangesAsync();

        // Act
        var result = await _controller.GetErrors();

        // Assert
        var actionResult = Assert.IsType<ActionResult<List<Error>>>(result);
        var list = Assert.IsType<List<Error>>(actionResult.Value);
        Assert.Equal(2, list.Count);
    }

    [Fact]
    public async Task GetError_ReturnsNotFound_WhenIdDoesNotExist()
    {
        // Act
        var result = await _controller.GetError(999);

        // Assert
        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetError_ReturnsOk_WhenIdExists()
    {
        // Arrange
        var error = new Error { Name = "FindMe", Description = "Desc", TicketDate = DateTime.UtcNow };
        _context.Errors.Add(error);
        await _context.SaveChangesAsync();

        // Act
        var result = await _controller.GetError(error.ErrorId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedError = Assert.IsType<Error>(okResult.Value);
        Assert.Equal(error.ErrorId, returnedError.ErrorId);
    }

    [Fact]
    public async Task DeleteError_ReturnsNoContent_WhenSuccessful()
    {
        // Arrange
        var error = new Error { Name = "DeleteMe", Description = "Desc", TicketDate = DateTime.UtcNow };
        _context.Errors.Add(error);
        await _context.SaveChangesAsync();

        // Act
        var result = await _controller.DeleteError(error.ErrorId);

        // Assert
        Assert.IsType<NoContentResult>(result);
        Assert.Empty(_context.Errors);
    }

    [Fact]
    public async Task DeleteError_ReturnsNotFound_WhenIdMissing()
    {
        // Act
        var result = await _controller.DeleteError(404);

        // Assert
        Assert.IsType<NotFoundObjectResult>(result);
    }
}