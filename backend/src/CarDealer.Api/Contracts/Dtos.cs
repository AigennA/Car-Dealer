using System.ComponentModel.DataAnnotations;
using CarDealer.Api.Domain;

namespace CarDealer.Api.Contracts;

/// <summary>
/// Same shape as the website's <c>Car</c> type (src/lib/cars.ts), so the
/// frontend can switch from static data to the API without UI changes.
/// </summary>
public record CarDto(
    string Id, string Slug, string Make, string Model, string Title, int Year, int Mileage,
    string Fuel, string Transmission, string Drivetrain, string BodyType, string Color, int Price,
    string[] Images, bool Featured, string Description, string[] Features, string Status)
{
    public static CarDto From(Car c) => new(
        c.Id.ToString(), c.Slug, c.Make, c.Model, c.Title, c.Year, c.Mileage, c.Fuel, c.Transmission,
        c.Drivetrain, c.BodyType, c.Color, c.Price,
        c.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).ToArray(),
        c.Featured, c.Description, c.Features.Select(f => f.Name).ToArray(), c.Status.ToString());
}

public record PagedResult<T>(IReadOnlyList<T> Items, int Total, int Page, int PageSize);

/// <summary>Query string for GET /api/cars — mirrors the website's filters.</summary>
public class CarQuery
{
    public string? Search { get; set; }
    public string? Make { get; set; }
    public string? Fuel { get; set; }
    public string? Transmission { get; set; }
    public string? BodyType { get; set; }
    [Range(0, int.MaxValue)] public int? PriceMin { get; set; }
    [Range(0, int.MaxValue)] public int? PriceMax { get; set; }
    [Range(1900, 2100)] public int? YearMin { get; set; }
    [Range(1900, 2100)] public int? YearMax { get; set; }
    [Range(0, int.MaxValue)] public int? MileageMax { get; set; }
    public bool? Featured { get; set; }
    /// <summary>relevant | newest | price-asc | price-desc | year-desc | year-asc | mileage-asc | mileage-desc | name-asc | name-desc</summary>
    public string Sort { get; set; } = "relevant";
    [Range(1, 1000)] public int Page { get; set; } = 1;
    [Range(1, 100)] public int PageSize { get; set; } = 24;
}

public class CarUpsertRequest
{
    [Required(ErrorMessage = "Ange märke."), StringLength(60)] public string Make { get; set; } = "";
    [Required(ErrorMessage = "Ange modell."), StringLength(80)] public string Model { get; set; } = "";
    [Range(1950, 2100, ErrorMessage = "Årsmodellen ska vara mellan 1950 och 2100.")] public int Year { get; set; }
    [Range(0, 100000, ErrorMessage = "Miltal ska anges i mil (0–100 000).")] public int Mileage { get; set; }
    [Required, StringLength(30)] public string Fuel { get; set; } = "";
    [Required, StringLength(30)] public string Transmission { get; set; } = "";
    [Required, StringLength(10)] public string Drivetrain { get; set; } = "";
    [Required, StringLength(30)] public string BodyType { get; set; } = "";
    [Required(ErrorMessage = "Ange färg."), StringLength(30)] public string Color { get; set; } = "";
    [Range(1, 20_000_000, ErrorMessage = "Ange ett pris i kronor.")] public int Price { get; set; }
    public bool Featured { get; set; }
    [StringLength(4000)] public string Description { get; set; } = "";
    public List<string> Features { get; set; } = [];
    public List<string> Images { get; set; } = [];
    public CarStatus Status { get; set; } = CarStatus.Available;
}

public class CreateLeadRequest
{
    [Required(ErrorMessage = "Fyll i ditt namn."), StringLength(100)] public string Name { get; set; } = "";
    [Required(ErrorMessage = "Fyll i din e-postadress."), EmailAddress(ErrorMessage = "E-postadressen verkar inte stämma. Exempel: namn@exempel.se"), StringLength(254)]
    public string Email { get; set; } = "";
    [RegularExpression(@"^[+\d][\d\s-]{6,}$", ErrorMessage = "Telefonnumret får bara innehålla siffror, mellanslag och bindestreck."), StringLength(30)]
    public string? Phone { get; set; }
    [StringLength(40)] public string? Subject { get; set; }
    [Required(ErrorMessage = "Skriv ett meddelande på minst 10 tecken."), MinLength(10, ErrorMessage = "Skriv ett meddelande på minst 10 tecken."), StringLength(4000)]
    public string Message { get; set; } = "";
    /// <summary>Slug of the car the message is about (from "Boka provkörning").</summary>
    [StringLength(120)] public string? CarSlug { get; set; }
    /// <summary>Honeypot: hidden field real users leave empty; bots fill it.</summary>
    public string? Website { get; set; }
}

public class CreateTradeInRequest
{
    [Required(ErrorMessage = "Fyll i ditt namn."), StringLength(100)] public string Name { get; set; } = "";
    [Required(ErrorMessage = "Fyll i din e-postadress."), EmailAddress(ErrorMessage = "E-postadressen verkar inte stämma. Exempel: namn@exempel.se"), StringLength(254)]
    public string Email { get; set; } = "";
    [RegularExpression(@"^[+\d][\d\s-]{6,}$", ErrorMessage = "Telefonnumret får bara innehålla siffror, mellanslag och bindestreck."), StringLength(30)]
    public string? Phone { get; set; }
    [Required(ErrorMessage = "Fyll i bilens märke, t.ex. Volvo."), StringLength(60)] public string Brand { get; set; } = "";
    [Required(ErrorMessage = "Fyll i bilens modell, t.ex. V60."), StringLength(80)] public string Model { get; set; } = "";
    [Range(1950, 2100, ErrorMessage = "Årsmodellen ska vara ett årtal mellan 1950 och nästa år.")] public int Year { get; set; }
    [Range(0, 100000, ErrorMessage = "Ange miltal i mil som en siffra, t.ex. 8500.")] public int Mileage { get; set; }
    [StringLength(4000)] public string? Message { get; set; }
    public string? Website { get; set; }
}

public record LeadDto(int Id, string Name, string Email, string? Phone, string? Subject, string Message,
    string? CarSlug, string? CarTitle, string Status, DateTime CreatedAt);

public record TradeInDto(int Id, string Name, string Email, string? Phone, string Brand, string Model,
    int Year, int Mileage, string? Message, string Status, DateTime CreatedAt);

public record UpdateStatusRequest([Required] RequestStatus Status);

public record CreatedResponse(int Id, string Message);

public record LoginRequest(
    [Required(ErrorMessage = "Ange e-post."), EmailAddress] string Email,
    [Required(ErrorMessage = "Ange lösenord.")] string Password);

public record LoginResponse(string AccessToken, DateTime ExpiresAt, string Email, string[] Roles);

public record DashboardDto(int CarsAvailable, int CarsReserved, int CarsSold, int NewLeads, int NewTradeIns, int InventoryValue);

public record AvailabilityDto(string Service, DateOnly Date, string[] Slots);

public record BookableDayDto(DateOnly Date, int FreeSlots);

public class CreateBookingRequest
{
    [Required(ErrorMessage = "Välj en tjänst.")] public string ServiceCode { get; set; } = "";
    [Required(ErrorMessage = "Välj en dag.")] public DateOnly? Date { get; set; }
    [Required(ErrorMessage = "Välj en tid."), RegularExpression(@"^\d{2}:\d{2}$", ErrorMessage = "Välj en tid.")]
    public string Time { get; set; } = "";
    [Required(ErrorMessage = "Fyll i ditt namn."), StringLength(100)] public string Name { get; set; } = "";
    [Required(ErrorMessage = "Fyll i din e-postadress."), EmailAddress(ErrorMessage = "E-postadressen verkar inte stämma. Exempel: namn@exempel.se"), StringLength(254)]
    public string Email { get; set; } = "";
    [Required(ErrorMessage = "Fyll i ditt telefonnummer så att verkstaden kan nå dig."),
     RegularExpression(@"^[+\d][\d\s-]{6,}$", ErrorMessage = "Telefonnumret får bara innehålla siffror, mellanslag och bindestreck."), StringLength(30)]
    public string Phone { get; set; } = "";
    [Required(ErrorMessage = "Fyll i bilens registreringsnummer."),
     RegularExpression(@"^\s*[A-Za-z]{3}\s?\d{2}[A-Za-z0-9]\s*$", ErrorMessage = "Registreringsnumret ska ha formatet ABC 123 eller ABC 12D.")]
    public string RegNumber { get; set; } = "";
    [StringLength(2000)] public string? Message { get; set; }
    public string? Website { get; set; }
}

public record BookingConfirmationDto(string Reference, string ServiceName, DateOnly Date, string Time, int DurationMinutes, string Message);

public record BookingDto(int Id, string Reference, string ServiceCode, string ServiceName, DateOnly Date, string Time,
    int DurationMinutes, string Name, string Email, string Phone, string RegNumber, string? Message, string Status, DateTime CreatedAt);

public record UpdateBookingStatusRequest([Required] BookingStatus Status);
