using System.ComponentModel.DataAnnotations;
using CarDealer.Api.Common;
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
    [Required(ErrorMessage = Messages.MakeRequired), StringLength(60)] public string Make { get; set; } = "";
    [Required(ErrorMessage = Messages.ModelRequiredStaff), StringLength(80)] public string Model { get; set; } = "";
    [Range(Limits.CarMinYear, Limits.CarMaxYear, ErrorMessage = Messages.CarYearRange)] public int Year { get; set; }
    [Range(0, Limits.MaxMileage, ErrorMessage = Messages.CarMileageRange)] public int Mileage { get; set; }
    [Required, StringLength(30)] public string Fuel { get; set; } = "";
    [Required, StringLength(30)] public string Transmission { get; set; } = "";
    [Required, StringLength(10)] public string Drivetrain { get; set; } = "";
    [Required, StringLength(30)] public string BodyType { get; set; } = "";
    [Required(ErrorMessage = Messages.ColorRequired), StringLength(30)] public string Color { get; set; } = "";
    [Range(1, Limits.MaxPrice, ErrorMessage = Messages.PriceRequired)] public int Price { get; set; }
    public bool Featured { get; set; }
    [StringLength(4000)] public string Description { get; set; } = "";
    public List<string> Features { get; set; } = [];
    public List<string> Images { get; set; } = [];
    public CarStatus Status { get; set; } = CarStatus.Available;
}

public class CreateLeadRequest
{
    [Required(ErrorMessage = Messages.NameRequired), StringLength(100)] public string Name { get; set; } = "";
    [Required(ErrorMessage = Messages.EmailRequired), EmailAddress(ErrorMessage = Messages.EmailInvalid), StringLength(254)]
    public string Email { get; set; } = "";
    [RegularExpression(Limits.PhonePattern, ErrorMessage = Messages.PhoneInvalid), StringLength(30)]
    public string? Phone { get; set; }
    [StringLength(40)] public string? Subject { get; set; }
    [Required(ErrorMessage = Messages.MessageTooShort), MinLength(Limits.MessageMinLength, ErrorMessage = Messages.MessageTooShort), StringLength(4000)]
    public string Message { get; set; } = "";
    /// <summary>Slug of the car the message is about (from "Boka provkörning").</summary>
    [StringLength(120)] public string? CarSlug { get; set; }
    /// <summary>Honeypot: hidden field real users leave empty; bots fill it.</summary>
    public string? Website { get; set; }
}

public class CreateTradeInRequest
{
    [Required(ErrorMessage = Messages.NameRequired), StringLength(100)] public string Name { get; set; } = "";
    [Required(ErrorMessage = Messages.EmailRequired), EmailAddress(ErrorMessage = Messages.EmailInvalid), StringLength(254)]
    public string Email { get; set; } = "";
    [RegularExpression(Limits.PhonePattern, ErrorMessage = Messages.PhoneInvalid), StringLength(30)]
    public string? Phone { get; set; }
    [Required(ErrorMessage = Messages.BrandRequired), StringLength(60)] public string Brand { get; set; } = "";
    [Required(ErrorMessage = Messages.ModelRequired), StringLength(80)] public string Model { get; set; } = "";
    [Range(Limits.TradeInMinYear, Limits.CarMaxYear, ErrorMessage = Messages.TradeInYearRange)] public int Year { get; set; }
    [Range(0, Limits.MaxMileage, ErrorMessage = Messages.MileageInvalid)] public int Mileage { get; set; }
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
    [Required(ErrorMessage = Messages.EmailRequiredLogin), EmailAddress] string Email,
    [Required(ErrorMessage = Messages.PasswordRequired)] string Password);

public record LoginResponse(string AccessToken, DateTime ExpiresAt, string Email, string[] Roles);

public record DashboardDto(int CarsAvailable, int CarsReserved, int CarsSold, int NewLeads, int NewTradeIns, int InventoryValue);

public record AvailabilityDto(string Service, DateOnly Date, string[] Slots);

public record BookableDayDto(DateOnly Date, int FreeSlots);

public class CreateBookingRequest
{
    [Required(ErrorMessage = Messages.ServiceRequired)] public string ServiceCode { get; set; } = "";
    [Required(ErrorMessage = Messages.DateRequired)] public DateOnly? Date { get; set; }
    [Required(ErrorMessage = Messages.TimeRequired), RegularExpression(Limits.TimePattern, ErrorMessage = Messages.TimeRequired)]
    public string Time { get; set; } = "";
    [Required(ErrorMessage = Messages.NameRequired), StringLength(100)] public string Name { get; set; } = "";
    [Required(ErrorMessage = Messages.EmailRequired), EmailAddress(ErrorMessage = Messages.EmailInvalid), StringLength(254)]
    public string Email { get; set; } = "";
    [Required(ErrorMessage = Messages.PhoneRequiredForWorkshop),
     RegularExpression(Limits.PhonePattern, ErrorMessage = Messages.PhoneInvalid), StringLength(30)]
    public string Phone { get; set; } = "";
    [Required(ErrorMessage = Messages.RegRequired),
     RegularExpression(RegistrationNumber.Pattern, ErrorMessage = Messages.RegInvalid)]
    public string RegNumber { get; set; } = "";
    [StringLength(2000)] public string? Message { get; set; }
    public string? Website { get; set; }
}

/// <param name="ManageToken">Secret for the customer's "Hantera bokning" link. Returned once, never stored in plain text.</param>
public record BookingConfirmationDto(string Reference, string ServiceName, DateOnly Date, string Time, int DurationMinutes, string Message,
    string ManageToken);

/// <summary>
/// Proves the customer owns a booking: the booking number plus either the
/// secret from their link (<see cref="Token"/>) or the e-mail address or
/// registration number they booked with (<see cref="Contact"/>).
/// </summary>
public class BookingAccessRequest
{
    [Required(ErrorMessage = Messages.ReferenceRequired), StringLength(12)] public string Reference { get; set; } = "";
    [StringLength(100)] public string? Token { get; set; }
    [StringLength(254)] public string? Contact { get; set; }
}

public class RescheduleBookingRequest : BookingAccessRequest
{
    [Required(ErrorMessage = Messages.DateRequired)] public DateOnly? Date { get; set; }
    [Required(ErrorMessage = Messages.TimeRequired), RegularExpression(Limits.TimePattern, ErrorMessage = Messages.TimeRequired)]
    public string Time { get; set; } = "";
}

/// <summary>What the customer sees on "Min bokning". No e-mail or phone: the page may be opened on a shared screen.</summary>
public record ManagedBookingDto(string Reference, string ServiceCode, string ServiceName, string Category, DateOnly Date, string Time,
    int DurationMinutes, string RegNumber, string Status, bool CanChange, DateTime ChangeDeadlineUtc);

public record CheckInRequest([Required(ErrorMessage = Messages.ReferenceRequired)] string Reference);

public record BookingDto(int Id, string Reference, string ServiceCode, string ServiceName, DateOnly Date, string Time,
    int DurationMinutes, string Name, string Email, string Phone, string RegNumber, string? Message, string Status, DateTime CreatedAt);

public record UpdateBookingStatusRequest([Required] BookingStatus Status);

public record CarFacetsDto(List<string> Makes, List<string> Fuels, List<string> Transmissions, List<string> BodyTypes);
