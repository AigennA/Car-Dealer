namespace CarDealer.Api.Workshop;

/// <summary>An existing booking that occupies a bay.</summary>
public record Occupied(TimeOnly Start, int Minutes);

/// <summary>
/// Pure scheduling rules (no database), so they are easy to test:
/// - only on open days, inside opening hours, and the job must finish before closing
/// - not in the past, not sooner than <see cref="WorkshopCatalog.MinLeadMinutes"/>
/// - not further ahead than <see cref="WorkshopCatalog.BookingHorizonDays"/>
/// - at no moment more cars than <see cref="WorkshopCatalog.Bays"/>
/// The website's demo mode (src/lib/workshop.ts) implements the same rules.
/// </summary>
public static class Availability
{
    public static IReadOnlyList<TimeOnly> FreeStarts(
        WorkshopCatalog catalog, WorkshopService service, DateOnly date, DateTime utcNow, IEnumerable<Occupied> taken)
    {
        var localNow = TimeZoneInfo.ConvertTimeFromUtc(utcNow, catalog.Zone);
        var today = DateOnly.FromDateTime(localNow);
        if (date < today || date > today.AddDays(catalog.BookingHorizonDays)) return [];
        if (catalog.HoursFor(date) is not var (open, close)) return [];

        var earliest = localNow.AddMinutes(catalog.MinLeadMinutes);
        var busy = taken.ToList();
        var result = new List<TimeOnly>();

        // Integer minutes since midnight: no TimeOnly wrap-around surprises.
        var openMin = (int)open.ToTimeSpan().TotalMinutes;
        var closeMin = (int)close.ToTimeSpan().TotalMinutes;
        for (var m = openMin; m + service.Minutes <= closeMin; m += catalog.SlotMinutes)
        {
            var start = TimeOnly.FromTimeSpan(TimeSpan.FromMinutes(m));
            if (date.ToDateTime(start) < earliest) continue;
            if (FitsCapacity(catalog, start, service.Minutes, busy)) result.Add(start);
        }
        return result;
    }

    private static bool FitsCapacity(WorkshopCatalog catalog, TimeOnly start, int minutes, List<Occupied> busy)
    {
        // Check every slot the new job would occupy.
        for (var t = 0; t < minutes; t += catalog.SlotMinutes)
        {
            var at = start.AddMinutes(t);
            var overlapping = busy.Count(b => at >= b.Start && at < b.Start.AddMinutes(b.Minutes));
            if (overlapping >= catalog.Bays) return false;
        }
        return true;
    }
}
