namespace CarDealer.Api.Common;

/// <summary>
/// Every user-facing Swedish message in one place (const so validation
/// attributes can use them). The website has the same wording in src/lib/messages.ts.
/// </summary>
public static class Messages
{
    // Contact details
    public const string NameRequired = "Fyll i ditt namn.";
    public const string EmailRequired = "Fyll i din e-postadress.";
    public const string EmailInvalid = "E-postadressen verkar inte stämma. Exempel: namn@exempel.se";
    public const string PhoneInvalid = "Telefonnumret får bara innehålla siffror, mellanslag och bindestreck.";
    public const string PhoneRequiredForWorkshop = "Fyll i ditt telefonnummer så att verkstaden kan nå dig.";
    public const string MessageTooShort = "Skriv ett meddelande på minst {1} tecken.";

    // Trade-in
    public const string BrandRequired = "Fyll i bilens märke, t.ex. Volvo.";
    public const string ModelRequired = "Fyll i bilens modell, t.ex. V60.";
    /// <summary>{1} = min, {2} = max (DataAnnotations placeholders; {0} is the field name).</summary>
    public const string TradeInYearRange = "Årsmodellen ska vara ett årtal mellan {1} och {2}.";
    public const string MileageInvalid = "Ange miltal i mil som en siffra, t.ex. 8500.";

    // Cars (staff)
    public const string MakeRequired = "Ange märke.";
    public const string ModelRequiredStaff = "Ange modell.";
    public const string CarYearRange = "Årsmodellen ska vara mellan {1} och {2}.";
    public const string CarMileageRange = "Miltal ska anges i mil ({1}–{2}).";
    public const string ColorRequired = "Ange färg.";
    public const string PriceRequired = "Ange ett pris i kronor.";
    public const string CarNotFound = "Bilen hittades inte";
    public const string CarMaybeSold = "Bilen kan redan vara såld.";

    // Workshop booking
    public const string ServiceRequired = "Välj en tjänst.";
    public const string ServiceNotFound = "Tjänsten finns inte.";
    public const string DateRequired = "Välj en dag.";
    public const string TimeRequired = "Välj en tid.";
    public const string RegRequired = "Fyll i bilens registreringsnummer.";
    public const string RegInvalid = "Registreringsnumret ska ha formatet ABC 123 eller ABC 12D.";
    public const string SlotTaken = "Tiden är inte längre ledig.";
    public const string SlotTakenDetail = "Någon hann boka tiden före dig. Välj en annan tid.";

    // Auth
    public const string EmailRequiredLogin = "Ange e-post.";
    public const string PasswordRequired = "Ange lösenord.";
    public const string LoginFailed = "Fel e-post eller lösenord.";

    // Confirmations
    public const string LeadThanks = "Tack för ditt meddelande! Vi återkommer inom {0} timmar.";
    public const string TradeInThanks = "Tack för din förfrågan! Vi återkommer med en värdering inom {0} timmar.";
    public const string BookingThanks = "Tack! Din tid är bokad. Bokningsnummer {0}.";
    public const string NotFound = "Hittades inte.";
}

/// <summary>Validation limits and patterns shared by the request contracts.</summary>
public static class Limits
{
    public const int MessageMinLength = 10;
    public const int TradeInMinYear = 1950;
    public const int CarMinYear = 1950;
    public const int CarMaxYear = 2100;
    public const int MaxMileage = 100_000;
    public const int MaxPrice = 20_000_000;
    public const string PhonePattern = @"^[+\d][\d\s-]{6,}$";
    public const string TimePattern = @"^\d{2}:\d{2}$";
}
