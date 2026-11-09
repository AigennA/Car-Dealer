using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarDealer.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCarSoldAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "SoldAt",
                table: "Cars",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SoldAt",
                table: "Cars");
        }
    }
}
