using CarDealer.Api.Auth;
using CarDealer.Api.Common;
using CarDealer.Api.Contracts;
using CarDealer.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarDealer.Api.Controllers;

/// <summary>Inventory endpoints. HTTP only — the use cases live in <see cref="ICarService"/>.</summary>
[ApiController]
[Route("api/cars")]
[Produces("application/json")]
public class CarsController(ICarService cars) : ControllerBase
{
    private bool IsStaff => User.IsInRole(Roles.Admin) || User.IsInRole(Roles.Sales);

    [HttpGet]
    public async Task<PagedResult<CarDto>> List([FromQuery] CarQuery query, CancellationToken ct) =>
        await cars.SearchAsync(query, ct);

    [HttpGet("facets")]
    public async Task<CarFacetsDto> Facets(CancellationToken ct) => await cars.FacetsAsync(ct);

    [HttpGet("{slug}")]
    public async Task<ActionResult<CarDto>> Get(string slug, CancellationToken ct) =>
        this.ToActionResult(await cars.GetBySlugAsync(slug, IsStaff, ct));

    [HttpGet("all")]
    [Authorize(Roles = Roles.Staff)]
    public async Task<IReadOnlyList<CarDto>> All(CancellationToken ct) => await cars.ListAllAsync(ct);

    [HttpPost]
    [Authorize(Roles = Roles.Staff)]
    public async Task<ActionResult<CarDto>> Create(CarUpsertRequest request, CancellationToken ct)
    {
        var car = await cars.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { slug = car.Slug }, car);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.Staff)]
    public async Task<ActionResult<CarDto>> Update(int id, CarUpsertRequest request, CancellationToken ct) =>
        this.ToActionResult(await cars.UpdateAsync(id, request, ct));

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct) =>
        this.ToActionResult(await cars.DeleteAsync(id, ct));
}
