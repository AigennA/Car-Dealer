using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarDealer.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingManageToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ManageTokenHash",
                table: "Bookings",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ManageTokenHash",
                table: "Bookings");
        }
    }
}
