using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using WebApplication1;
using WebApplication1.Controllers;
using WebApplication1.DTOs.Route;

namespace SpeditionAppTests.Tests;

public class RouteControllerTests
{
    private readonly DbContextOptions<DatabaseContext> _options = new DbContextOptionsBuilder<DatabaseContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString())
        .Options;

    private readonly Mock<ILogger<RouteController>> _loggerMock = new();

    [Fact]
    public async Task GetRoutes_ReturnsPagedList()
    {
        await using var context = new DatabaseContext(_options);
        context.Routes.AddRange(
            new Route { RouteId = 1, StartPoint = "A", EndPoint = "B", TransportId = 1 },
            new Route { RouteId = 2, StartPoint = "C", EndPoint = "D", TransportId = 1 },
            new Route { RouteId = 3, StartPoint = "E", EndPoint = "F", TransportId = 1 }
        );
        await context.SaveChangesAsync();
        var controller = new RouteController(context, _loggerMock.Object);

        var result = await controller.GetRoutes(1, 1); // lastId=1, amount=1

        var actionResult = Assert.IsType<ActionResult<IEnumerable<Route>>>(result);
        var routes = Assert.IsAssignableFrom<IEnumerable<Route>>(actionResult.Value);
        Assert.Single(routes);
        Assert.Equal(2, routes.First().RouteId);
    }

    [Fact]
    public async Task GetRoute_ReturnsOk_WhenExists()
    {
        await using var context = new DatabaseContext(_options);
        var testRoute = new Route { RouteId = 10, StartPoint = "Warsaw", EndPoint = "Berlin", TransportId = 1 };
        context.Routes.Add(testRoute);
        await context.SaveChangesAsync();
        var controller = new RouteController(context, _loggerMock.Object);

        var result = await controller.GetRoute(10);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var route = Assert.IsType<Route>(okResult.Value);
        Assert.Equal("Warsaw", route.StartPoint);
    }

    [Fact]
    public async Task GetRoute_ReturnsNotFound_WhenNotExists()
    {
        await using var context = new DatabaseContext(_options);
        var controller = new RouteController(context, _loggerMock.Object);

        var result = await controller.GetRoute(999);

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task CreateRoute_ReturnsCreated_WithRouteData()
    {
        await using var context = new DatabaseContext(_options);
        var controller = new RouteController(context, _loggerMock.Object);
        var dto = new CreateRouteDto
        {
            TransportId = 1,
            StartPoint = "Krakow",
            EndPoint = "Prague",
            Distance = 550,
            EstimatedTime = TimeSpan.FromHours(7)
        };

        var result = await controller.CreateRoute(dto);

        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var route = Assert.IsType<Route>(createdResult.Value);
        Assert.Equal("Krakow", route.StartPoint);
        Assert.True(route.RouteId > 0);
        Assert.Equal(1, await context.Routes.CountAsync());
    }

    [Fact]
    public async Task DeleteRoute_ReturnsNoContent_WhenSuccessful()
    {
        await using var context = new DatabaseContext(_options);
        var route = new Route { RouteId = 1, StartPoint = "A", EndPoint = "B", TransportId = 1 };
        context.Routes.Add(route);
        await context.SaveChangesAsync();
        var controller = new RouteController(context, _loggerMock.Object);

        var result = await controller.DeleteRoute(1);

        Assert.IsType<NoContentResult>(result);
        Assert.Empty(context.Routes);
    }

    [Fact]
    public async Task DeleteRoute_ReturnsNotFound_WhenRouteMissing()
    {
        await using var context = new DatabaseContext(_options);
        var controller = new RouteController(context, _loggerMock.Object);

        var result = await controller.DeleteRoute(55);

        Assert.IsType<NotFoundObjectResult>(result);
    }
}