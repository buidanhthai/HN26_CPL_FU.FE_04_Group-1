using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class RedesignBookingFlow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CheckInVerificationCode",
                table: "Booking");

            migrationBuilder.AddColumn<string>(
                name: "BookingCode",
                table: "Booking",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "BookingCode", "CreatedAt", "EndTime", "PaymentDeadline", "StartTime" },
                values: new object[] { "BK-260716-01", new DateTime(2026, 7, 16, 3, 43, 41, 925, DateTimeKind.Utc).AddTicks(9099), new DateTime(2026, 7, 17, 5, 43, 41, 925, DateTimeKind.Utc).AddTicks(8245), new DateTime(2026, 7, 16, 3, 53, 41, 925, DateTimeKind.Utc).AddTicks(8915), new DateTime(2026, 7, 17, 3, 43, 41, 925, DateTimeKind.Utc).AddTicks(8005) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "BookingCode", "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { "BK-260716-02", new DateTime(2026, 7, 16, 3, 43, 41, 925, DateTimeKind.Utc).AddTicks(9234), new DateTime(2026, 7, 18, 7, 43, 41, 925, DateTimeKind.Utc).AddTicks(9232), new DateTime(2026, 7, 18, 3, 43, 41, 925, DateTimeKind.Utc).AddTicks(9231) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "BookingCode", "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { "BK-260716-03", new DateTime(2026, 7, 16, 3, 43, 41, 925, DateTimeKind.Utc).AddTicks(9238), new DateTime(2026, 7, 16, 5, 43, 41, 925, DateTimeKind.Utc).AddTicks(9236), new DateTime(2026, 7, 16, 2, 43, 41, 925, DateTimeKind.Utc).AddTicks(9236) });

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 16, 3, 43, 41, 929, DateTimeKind.Utc).AddTicks(7703));

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 16, 3, 43, 41, 929, DateTimeKind.Utc).AddTicks(7838));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$B6p17PohgUjfOGnq3qI1qOnQllc72Z2LD5KB9sVDiEzIzdDlj.Fde");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$B6p17PohgUjfOGnq3qI1qOnQllc72Z2LD5KB9sVDiEzIzdDlj.Fde");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$B6p17PohgUjfOGnq3qI1qOnQllc72Z2LD5KB9sVDiEzIzdDlj.Fde");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "PasswordHash",
                value: "$2a$11$B6p17PohgUjfOGnq3qI1qOnQllc72Z2LD5KB9sVDiEzIzdDlj.Fde");

            migrationBuilder.CreateIndex(
                name: "IX_Booking_BookingCode",
                table: "Booking",
                column: "BookingCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Booking_BookingCode",
                table: "Booking");

            migrationBuilder.DropColumn(
                name: "BookingCode",
                table: "Booking");

            migrationBuilder.AddColumn<string>(
                name: "CheckInVerificationCode",
                table: "Booking",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CheckInVerificationCode", "CreatedAt", "EndTime", "PaymentDeadline", "StartTime" },
                values: new object[] { null, new DateTime(2026, 7, 14, 9, 17, 47, 380, DateTimeKind.Utc).AddTicks(9008), new DateTime(2026, 7, 15, 11, 17, 47, 380, DateTimeKind.Utc).AddTicks(7753), new DateTime(2026, 7, 14, 9, 27, 47, 380, DateTimeKind.Utc).AddTicks(8662), new DateTime(2026, 7, 15, 9, 17, 47, 380, DateTimeKind.Utc).AddTicks(7332) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CheckInVerificationCode", "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { null, new DateTime(2026, 7, 14, 9, 17, 47, 380, DateTimeKind.Utc).AddTicks(9265), new DateTime(2026, 7, 16, 13, 17, 47, 380, DateTimeKind.Utc).AddTicks(9263), new DateTime(2026, 7, 16, 9, 17, 47, 380, DateTimeKind.Utc).AddTicks(9262) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CheckInVerificationCode", "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { null, new DateTime(2026, 7, 14, 9, 17, 47, 380, DateTimeKind.Utc).AddTicks(9270), new DateTime(2026, 7, 14, 11, 17, 47, 380, DateTimeKind.Utc).AddTicks(9268), new DateTime(2026, 7, 14, 8, 17, 47, 380, DateTimeKind.Utc).AddTicks(9268) });

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 14, 9, 17, 47, 389, DateTimeKind.Utc).AddTicks(302));

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 14, 9, 17, 47, 389, DateTimeKind.Utc).AddTicks(635));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$8cnTwJSdRphKyFiXlNaIYumZuaKhJr.SyjBZbO2B84erHo13lFSVm");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$8cnTwJSdRphKyFiXlNaIYumZuaKhJr.SyjBZbO2B84erHo13lFSVm");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$8cnTwJSdRphKyFiXlNaIYumZuaKhJr.SyjBZbO2B84erHo13lFSVm");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "PasswordHash",
                value: "$2a$11$8cnTwJSdRphKyFiXlNaIYumZuaKhJr.SyjBZbO2B84erHo13lFSVm");
        }
    }
}
