using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Booking_Log",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BookingId = table.Column<int>(type: "int", nullable: false),
                    UserFullName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ActionDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Booking_Log", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Booking_Log_Booking_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Booking",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "EndTime", "PaymentDeadline", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 13, 8, 59, 14, 959, DateTimeKind.Utc).AddTicks(1898), new DateTime(2026, 7, 14, 10, 59, 14, 959, DateTimeKind.Utc).AddTicks(1265), new DateTime(2026, 7, 13, 9, 9, 14, 959, DateTimeKind.Utc).AddTicks(1717), new DateTime(2026, 7, 14, 8, 59, 14, 959, DateTimeKind.Utc).AddTicks(1088) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 13, 8, 59, 14, 959, DateTimeKind.Utc).AddTicks(2009), new DateTime(2026, 7, 15, 12, 59, 14, 959, DateTimeKind.Utc).AddTicks(2008), new DateTime(2026, 7, 15, 8, 59, 14, 959, DateTimeKind.Utc).AddTicks(2007) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 13, 8, 59, 14, 959, DateTimeKind.Utc).AddTicks(2014), new DateTime(2026, 7, 13, 10, 59, 14, 959, DateTimeKind.Utc).AddTicks(2013), new DateTime(2026, 7, 13, 7, 59, 14, 959, DateTimeKind.Utc).AddTicks(2013) });

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 13, 8, 59, 14, 959, DateTimeKind.Utc).AddTicks(3132));

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 13, 8, 59, 14, 959, DateTimeKind.Utc).AddTicks(3245));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$P50GLA6CBU.nD9JM96TkMuDG./6WWeJOCnlmg3Xmo5Umzr.Dynh7G");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$P50GLA6CBU.nD9JM96TkMuDG./6WWeJOCnlmg3Xmo5Umzr.Dynh7G");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$P50GLA6CBU.nD9JM96TkMuDG./6WWeJOCnlmg3Xmo5Umzr.Dynh7G");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "PasswordHash",
                value: "$2a$11$P50GLA6CBU.nD9JM96TkMuDG./6WWeJOCnlmg3Xmo5Umzr.Dynh7G");

            migrationBuilder.CreateIndex(
                name: "IX_Booking_Log_BookingId",
                table: "Booking_Log",
                column: "BookingId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Booking_Log");

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "EndTime", "PaymentDeadline", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 13, 8, 33, 1, 795, DateTimeKind.Utc).AddTicks(1809), new DateTime(2026, 7, 14, 10, 33, 1, 795, DateTimeKind.Utc).AddTicks(1161), new DateTime(2026, 7, 13, 8, 43, 1, 795, DateTimeKind.Utc).AddTicks(1627), new DateTime(2026, 7, 14, 8, 33, 1, 795, DateTimeKind.Utc).AddTicks(987) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 13, 8, 33, 1, 795, DateTimeKind.Utc).AddTicks(1922), new DateTime(2026, 7, 15, 12, 33, 1, 795, DateTimeKind.Utc).AddTicks(1920), new DateTime(2026, 7, 15, 8, 33, 1, 795, DateTimeKind.Utc).AddTicks(1919) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 13, 8, 33, 1, 795, DateTimeKind.Utc).AddTicks(1925), new DateTime(2026, 7, 13, 10, 33, 1, 795, DateTimeKind.Utc).AddTicks(1924), new DateTime(2026, 7, 13, 7, 33, 1, 795, DateTimeKind.Utc).AddTicks(1924) });

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 13, 8, 33, 1, 795, DateTimeKind.Utc).AddTicks(3037));

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 13, 8, 33, 1, 795, DateTimeKind.Utc).AddTicks(3147));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$r.6njro2KuERtO3x576kMOai0TYjZ1mPfa/U50/msnHNnzVJgdeb2");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$r.6njro2KuERtO3x576kMOai0TYjZ1mPfa/U50/msnHNnzVJgdeb2");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$r.6njro2KuERtO3x576kMOai0TYjZ1mPfa/U50/msnHNnzVJgdeb2");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "PasswordHash",
                value: "$2a$11$r.6njro2KuERtO3x576kMOai0TYjZ1mPfa/U50/msnHNnzVJgdeb2");
        }
    }
}
