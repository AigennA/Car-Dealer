using CarDealer.Api.Configuration;

namespace CarDealer.Api.Workshop;

/// <summary>
/// The scheduling rules for test drives, expressed as a <see cref="WorkshopCatalog"/> so the same pure
/// <see cref="Availability"/> function serves both: showroom hours instead of workshop hours, and
/// <c>Bays = 1</c> because one car can only be out with one customer at a time. The bookings that count
/// as "taken" are those for the same car, not all bookings.
/// </summary>
public sealed class TestDriveSchedule
{
    public const string ServiceCode = "provkorning";
    public const string Category = "provkorning";

    /// <summary>Test drives are told apart by their service code, so they stay test drives if the car is deleted later.</summary>
    public static bool IsTestDrive(Domain.Booking b) => b.ServiceCode == ServiceCode;

    public WorkshopCatalog Catalog { get; }
    public WorkshopService Service { get; }

    public TestDriveSchedule(WorkshopCatalog workshop, BusinessInfo business)
    {
        var t = business.TestDrive;
        Service = new WorkshopService(ServiceCode, Category, "Provkörning", "", t.DurationMinutes, 0);
        Catalog = new WorkshopCatalog
        {
            TimeZone = workshop.TimeZone,
            SlotMinutes = t.SlotMinutes,
            Bays = 1,
            MinLeadMinutes = t.MinLeadMinutes,
            BookingHorizonDays = t.BookingHorizonDays,
            ChangeCutoffHours = t.ChangeCutoffHours,
            OpeningHours = business.ShowroomHours,
            Services = [Service],
        };
    }
}
