namespace CarDealer.Api.Domain;

/// <summary>
/// Where a car is in the sales process. Available and Reserved are public; Sold stays public for
/// <c>SoldVisibleDays</c> after the sale (then only its own page remains); Draft is never public.
/// </summary>
public enum CarStatus { Available, Reserved, Sold, Draft }

/// <summary>Workflow state for incoming customer requests.</summary>
public enum RequestStatus { New, InProgress, Closed }

/// <summary>Lifecycle of a workshop / inspection booking.</summary>
/// <summary>Arrived = the customer has checked in at the workshop (staff scanned the QR code).</summary>
public enum BookingStatus { Booked, Confirmed, Completed, Cancelled, Arrived }

public class Car
{
    public int Id { get; set; }
    public required string Slug { get; set; }
    public required string Make { get; set; }
    public required string Model { get; set; }
    public int Year { get; set; }
    /// <summary>Swedish "mil" (1 mil = 10 km).</summary>
    public int Mileage { get; set; }
    public required string Fuel { get; set; }
    public required string Transmission { get; set; }
    public required string Drivetrain { get; set; }
    public required string BodyType { get; set; }
    public required string Color { get; set; }
    /// <summary>Price in SEK incl. VAT.</summary>
    public int Price { get; set; }
    public bool Featured { get; set; }
    public string Description { get; set; } = "";
    public CarStatus Status { get; set; } = CarStatus.Available;
    /// <summary>When the car was sold (UTC). Set when the status becomes Sold, cleared otherwise; decides how long it stays listed.</summary>
    public DateTime? SoldAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<CarImage> Images { get; set; } = [];
    public List<CarFeature> Features { get; set; } = [];

    public string Title => $"{Make} {Model}";
}

public class CarImage
{
    public int Id { get; set; }
    public int CarId { get; set; }
    public required string Url { get; set; }
    public int SortOrder { get; set; }
}

public class CarFeature
{
    public int Id { get; set; }
    public int CarId { get; set; }
    public required string Name { get; set; }
}

/// <summary>A message from the contact form ("Kontakta oss" / "Boka provkörning").</summary>
public class Lead
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public string? Phone { get; set; }
    public string? Subject { get; set; }
    public required string Message { get; set; }
    public int? CarId { get; set; }
    public Car? Car { get; set; }
    public RequestStatus Status { get; set; } = RequestStatus.New;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>A trade-in valuation request ("Begär värdering").</summary>
public class TradeIn
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public string? Phone { get; set; }
    public required string Brand { get; set; }
    public required string Model { get; set; }
    public int Year { get; set; }
    public int Mileage { get; set; }
    public string? Message { get; set; }
    public RequestStatus Status { get; set; } = RequestStatus.New;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>A workshop or inspection appointment ("Boka verkstadstid").</summary>
public class Booking
{
    public int Id { get; set; }
    /// <summary>Short code the customer can quote on the phone, e.g. "CD-7K3PQX".</summary>
    public required string Reference { get; set; }
    public required string ServiceCode { get; set; }
    /// <summary>Local (Europe/Stockholm) date and start time of the appointment.</summary>
    public DateOnly Date { get; set; }
    public TimeOnly StartTime { get; set; }
    public int DurationMinutes { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string Phone { get; set; }
    /// <summary>Swedish registration number, normalised to upper case without spaces (ABC123 / ABC12D). Empty for test drives.</summary>
    public required string RegNumber { get; set; }
    public string? Message { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Booked;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    /// <summary>Set for test drives ("Boka provkörning"): the car being driven. Null for workshop and inspection bookings.</summary>
    public int? CarId { get; set; }
    public Car? Car { get; set; }
    /// <summary>
    /// SHA-256 (hex) of the secret in the customer's "Hantera bokning" link.
    /// Only the hash is stored, so a database leak does not expose working links.
    /// </summary>
    public string? ManageTokenHash { get; set; }
}
