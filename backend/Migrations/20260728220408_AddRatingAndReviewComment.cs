using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddRatingAndReviewComment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Rating",
                table: "Booking",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReviewComment",
                table: "Booking",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "EndTime", "PaymentDeadline", "Rating", "ReviewComment", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 28, 22, 4, 7, 942, DateTimeKind.Utc).AddTicks(36), new DateTime(2026, 7, 30, 0, 4, 7, 941, DateTimeKind.Utc).AddTicks(9222), new DateTime(2026, 7, 28, 22, 14, 7, 941, DateTimeKind.Utc).AddTicks(9863), null, null, new DateTime(2026, 7, 29, 22, 4, 7, 941, DateTimeKind.Utc).AddTicks(9015) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "EndTime", "Rating", "ReviewComment", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 28, 22, 4, 7, 942, DateTimeKind.Utc).AddTicks(164), new DateTime(2026, 7, 31, 2, 4, 7, 942, DateTimeKind.Utc).AddTicks(163), null, null, new DateTime(2026, 7, 30, 22, 4, 7, 942, DateTimeKind.Utc).AddTicks(162) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "EndTime", "Rating", "ReviewComment", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 28, 22, 4, 7, 942, DateTimeKind.Utc).AddTicks(167), new DateTime(2026, 7, 29, 0, 4, 7, 942, DateTimeKind.Utc).AddTicks(166), null, null, new DateTime(2026, 7, 28, 21, 4, 7, 942, DateTimeKind.Utc).AddTicks(166) });

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 28, 22, 4, 7, 946, DateTimeKind.Utc).AddTicks(9602));

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 28, 22, 4, 7, 946, DateTimeKind.Utc).AddTicks(9747));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$PS/lLvfZHq62PESzUkRyuemHbYaaV/ZBusAkTJjqL5laFnyClDNMq");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$PS/lLvfZHq62PESzUkRyuemHbYaaV/ZBusAkTJjqL5laFnyClDNMq");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$PS/lLvfZHq62PESzUkRyuemHbYaaV/ZBusAkTJjqL5laFnyClDNMq");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "PasswordHash",
                value: "$2a$11$PS/lLvfZHq62PESzUkRyuemHbYaaV/ZBusAkTJjqL5laFnyClDNMq");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Rating",
                table: "Booking");

            migrationBuilder.DropColumn(
                name: "ReviewComment",
                table: "Booking");

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "EndTime", "PaymentDeadline", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 27, 7, 9, 7, 53, DateTimeKind.Utc).AddTicks(1419), new DateTime(2026, 7, 28, 9, 9, 7, 53, DateTimeKind.Utc).AddTicks(367), new DateTime(2026, 7, 27, 7, 19, 7, 53, DateTimeKind.Utc).AddTicks(1209), new DateTime(2026, 7, 28, 7, 9, 7, 53, DateTimeKind.Utc).AddTicks(1) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 27, 7, 9, 7, 53, DateTimeKind.Utc).AddTicks(1564), new DateTime(2026, 7, 29, 11, 9, 7, 53, DateTimeKind.Utc).AddTicks(1562), new DateTime(2026, 7, 29, 7, 9, 7, 53, DateTimeKind.Utc).AddTicks(1562) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 27, 7, 9, 7, 53, DateTimeKind.Utc).AddTicks(1569), new DateTime(2026, 7, 27, 9, 9, 7, 53, DateTimeKind.Utc).AddTicks(1567), new DateTime(2026, 7, 27, 6, 9, 7, 53, DateTimeKind.Utc).AddTicks(1567) });

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 27, 7, 9, 7, 57, DateTimeKind.Utc).AddTicks(6342));

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 27, 7, 9, 7, 57, DateTimeKind.Utc).AddTicks(6502));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$nxDGINWj49/OnTNqXcBdQOUsQ2WLshkVkmGQrnsKzWkwfrEzD.pi6");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$nxDGINWj49/OnTNqXcBdQOUsQ2WLshkVkmGQrnsKzWkwfrEzD.pi6");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$nxDGINWj49/OnTNqXcBdQOUsQ2WLshkVkmGQrnsKzWkwfrEzD.pi6");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "PasswordHash",
                value: "$2a$11$nxDGINWj49/OnTNqXcBdQOUsQ2WLshkVkmGQrnsKzWkwfrEzD.pi6");
        }
    }
}
