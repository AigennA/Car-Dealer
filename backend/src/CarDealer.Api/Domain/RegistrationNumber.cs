using System.Text.RegularExpressions;

namespace CarDealer.Api.Domain;

/// <summary>Swedish registration number: ABC 123 or ABC 12D. Stored as "ABC12D".</summary>
public static partial class RegistrationNumber
{
    public const string Pattern = @"^\s*[A-Za-z]{3}\s?\d{2}[A-Za-z0-9]\s*$";

    public static bool IsValid(string? input) => input is not null && Regex().IsMatch(input);

    /// <summary>" abc 12d " → "ABC12D".</summary>
    public static string Normalize(string input) =>
        new(input.Where(char.IsLetterOrDigit).Select(char.ToUpperInvariant).ToArray());

    [GeneratedRegex(Pattern)]
    private static partial Regex Regex();
}

/// <summary>URL slugs for cars: "Volvo XC60 T8 2021" → "volvo-xc60-t8-2021".</summary>
public static partial class Slug
{
    public const string Fallback = "bil";

    public static string Create(string text)
    {
        var s = text.ToLowerInvariant().Replace('å', 'a').Replace('ä', 'a').Replace('ö', 'o').Replace('é', 'e');
        s = NonSlugChars().Replace(s, "-").Trim('-');
        return s.Length == 0 ? Fallback : s;
    }

    [GeneratedRegex("[^a-z0-9]+")]
    private static partial Regex NonSlugChars();
}
