namespace CarDealer.Api.Auth;

/// <summary>Staff roles. Admin manages everything; Sales handles cars and customer requests.</summary>
public static class Roles
{
    public const string Admin = "Admin";
    public const string Sales = "Sales";
    public const string Staff = Admin + "," + Sales;
    public static readonly string[] All = [Admin, Sales];
}
