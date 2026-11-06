using System.Text.Json;
using System.Text.Json.Serialization;

namespace CarDealer.Api.Workshop;

public record WorkshopService(string Code, string Category, string Name, string Description, int Minutes, int PriceFrom);

/// <summary>
/// Services, opening hours and capacity, read from data/workshop.json — the
/// same file the website uses, so prices and durations never drift apart.
/// </summary>
public class WorkshopCatalog
{
    public string TimeZone { get; init; } = "Europe/Stockholm";
    public int SlotMinutes { get; init; } = 30;
    /// <summary>How many cars the workshop can handle at the same time (lifts).</summary>
    public int Bays { get; init; } = 2;
    /// <summary>Earliest bookable time is now + this many minutes.</summary>
    public int MinLeadMinutes { get; init; } = 120;
    public int BookingHorizonDays { get; init; } = 21;
    /// <summary>Customers can cancel or move a booking online until this many hours before it starts.</summary>
    public int ChangeCutoffHours { get; init; } = 24;
    /// <summary>ISO weekday (1 = Monday … 7 = Sunday) → ["08:00", "17:00"]. Missing day = closed.</summary>
    public Dictionary<string, string[]> OpeningHours { get; init; } = [];
    public List<WorkshopService> Services { get; init; } = [];

    [JsonIgnore] public TimeZoneInfo Zone => TimeZoneInfo.FindSystemTimeZoneById(TimeZone);

    public WorkshopService? Find(string code) => Services.FirstOrDefault(s => s.Code == code);

    public (TimeOnly Open, TimeOnly Close)? HoursFor(DateOnly date)
    {
        var iso = date.DayOfWeek == DayOfWeek.Sunday ? 7 : (int)date.DayOfWeek;
        return OpeningHours.TryGetValue(iso.ToString(), out var h) && h.Length == 2
            ? (TimeOnly.Parse(h[0]), TimeOnly.Parse(h[1]))
            : null;
    }

    /// <summary>Local workshop date and time → UTC.</summary>
    public DateTime ToUtc(DateOnly date, TimeOnly time) =>
        TimeZoneInfo.ConvertTimeToUtc(date.ToDateTime(time, DateTimeKind.Unspecified), Zone);

    public static WorkshopCatalog Load(string path)
    {
        var json = File.ReadAllText(path);
        return JsonSerializer.Deserialize<WorkshopCatalog>(json, new JsonSerializerOptions(JsonSerializerDefaults.Web))
               ?? throw new InvalidOperationException($"Could not read {path}");
    }
}
