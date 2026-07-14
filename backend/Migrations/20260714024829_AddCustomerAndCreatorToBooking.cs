using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerAndCreatorToBooking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "Booking",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerName",
                table: "Booking",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerPhone",
                table: "Booking",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "CreatedByUserId", "CustomerName", "CustomerPhone", "EndTime", "PaymentDeadline", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 14, 2, 48, 28, 391, DateTimeKind.Utc).AddTicks(753), null, null, null, new DateTime(2026, 7, 15, 4, 48, 28, 391, DateTimeKind.Utc).AddTicks(119), new DateTime(2026, 7, 14, 2, 58, 28, 391, DateTimeKind.Utc).AddTicks(574), new DateTime(2026, 7, 15, 2, 48, 28, 390, DateTimeKind.Utc).AddTicks(9938) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "CreatedByUserId", "CustomerName", "CustomerPhone", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 14, 2, 48, 28, 391, DateTimeKind.Utc).AddTicks(865), null, null, null, new DateTime(2026, 7, 16, 6, 48, 28, 391, DateTimeKind.Utc).AddTicks(864), new DateTime(2026, 7, 16, 2, 48, 28, 391, DateTimeKind.Utc).AddTicks(862) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "CreatedByUserId", "CustomerName", "CustomerPhone", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 14, 2, 48, 28, 391, DateTimeKind.Utc).AddTicks(870), null, null, null, new DateTime(2026, 7, 14, 4, 48, 28, 391, DateTimeKind.Utc).AddTicks(869), new DateTime(2026, 7, 14, 1, 48, 28, 391, DateTimeKind.Utc).AddTicks(868) });

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 14, 2, 48, 28, 391, DateTimeKind.Utc).AddTicks(1986));

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 14, 2, 48, 28, 391, DateTimeKind.Utc).AddTicks(2116));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$UUrUTALbKFqEmq9KwWD0x.zoT7bsGD05PntrS50TeLw3GecHgN4Jy");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$UUrUTALbKFqEmq9KwWD0x.zoT7bsGD05PntrS50TeLw3GecHgN4Jy");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$UUrUTALbKFqEmq9KwWD0x.zoT7bsGD05PntrS50TeLw3GecHgN4Jy");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "PasswordHash",
                value: "$2a$11$UUrUTALbKFqEmq9KwWD0x.zoT7bsGD05PntrS50TeLw3GecHgN4Jy");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Booking");

            migrationBuilder.DropColumn(
                name: "CustomerName",
                table: "Booking");

            migrationBuilder.DropColumn(
                name: "CustomerPhone",
                table: "Booking");

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "EndTime", "PaymentDeadline", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 14, 2, 12, 40, 839, DateTimeKind.Utc).AddTicks(895), new DateTime(2026, 7, 15, 4, 12, 40, 839, DateTimeKind.Utc).AddTicks(248), new DateTime(2026, 7, 14, 2, 22, 40, 839, DateTimeKind.Utc).AddTicks(714), new DateTime(2026, 7, 15, 2, 12, 40, 839, DateTimeKind.Utc).AddTicks(64) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 14, 2, 12, 40, 839, DateTimeKind.Utc).AddTicks(1011), new DateTime(2026, 7, 16, 6, 12, 40, 839, DateTimeKind.Utc).AddTicks(1009), new DateTime(2026, 7, 16, 2, 12, 40, 839, DateTimeKind.Utc).AddTicks(1009) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 14, 2, 12, 40, 839, DateTimeKind.Utc).AddTicks(1014), new DateTime(2026, 7, 14, 4, 12, 40, 839, DateTimeKind.Utc).AddTicks(1013), new DateTime(2026, 7, 14, 1, 12, 40, 839, DateTimeKind.Utc).AddTicks(1013) });

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 14, 2, 12, 40, 839, DateTimeKind.Utc).AddTicks(2667));

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 14, 2, 12, 40, 839, DateTimeKind.Utc).AddTicks(2787));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$snwbZQTfzv0rYpKMDFAtgeX94gjkBz2WicorITqNmcQizjlUE1NwC");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$snwbZQTfzv0rYpKMDFAtgeX94gjkBz2WicorITqNmcQizjlUE1NwC");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$snwbZQTfzv0rYpKMDFAtgeX94gjkBz2WicorITqNmcQizjlUE1NwC");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "PasswordHash",
                value: "$2a$11$snwbZQTfzv0rYpKMDFAtgeX94gjkBz2WicorITqNmcQizjlUE1NwC");
        }
    }
}
