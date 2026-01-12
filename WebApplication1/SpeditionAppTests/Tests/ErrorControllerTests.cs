using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using WebApplication1;
using WebApplication1.Controllers;
using WebApplication1.DTOs.Error;
using Xunit;

namespace SpeditionAppTests.Tests;

public class ErrorControllerTests
{
    private readonly DatabaseContext _context;
    private readonly ErrorController _controller;

    public ErrorControllerTests()
    {
        var options = new DbContextOptionsBuilder<DatabaseContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        _context = new DatabaseContext(options);
        Mock<ILogger<ErrorController>> mockLogger = new();
        _controller = new ErrorController(_context, mockLogger.Object);
    }

    [Fact]
    public async Task CreateError_ReturnsCreatedAtAction_WhenValid()
    {
        var dto = new CreateErrorDto 
        { 
            TicketName = "Test Error", 
            TicketDescription = "Something went wrong" 
        };

        var result = await _controller.CreateError(dto);

        var actionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var returnedError = Assert.IsType<Error>(actionResult.Value);
        Assert.Equal(dto.TicketName, returnedError.Name);
        Assert.Equal(1, _context.Errors.Count());
    }

    [Fact]
    public async Task GetErrors_ReturnsAllErrors()
    {
        _context.Errors.Add(new Error { Name = "E1", Description = "D1" });
        _context.Errors.Add(new Error { Name = "E2", Description = "D2" });
        await _context.SaveChangesAsync();

        var result = await _controller.GetErrors();

        var list = Assert.IsType<List<Error>>(result.Value);
        Assert.Equal(2, list.Count);
    }

    [Fact]
    public async Task GetError_ReturnsNotFound_WhenIdDoesNotExist()
    {
        var result = await _controller.GetError(999);
        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetError_ReturnsOk_WhenIdExists()
    {
        var error = new Error { Name = "FindMe", Description = "Desc" };
        _context.Errors.Add(error);
        await _context.SaveChangesAsync();

        var result = await _controller.GetError(error.Id);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedError = Assert.IsType<Error>(okResult.Value);
        Assert.Equal(error.Id, returnedError.Id);
    }

    [Fact]
    public async Task DeleteError_ReturnsNoContent_WhenSuccessful()
    {
        var error = new Error { Name = "DeleteMe", Description = "Desc" };
        _context.Errors.Add(error);
        await _context.SaveChangesAsync();

        var result = await _controller.DeleteError(error.Id);

        Assert.IsType<NoContentResult>(result);
        Assert.Empty(_context.Errors);
    }
}