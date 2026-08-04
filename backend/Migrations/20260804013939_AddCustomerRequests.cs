using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CustomerRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    RequestType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "SERVICE"),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Detail = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RoomName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Pending"),
                    ResolvedNote = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomerRequests_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "EndTime", "PaymentDeadline", "StartTime" },
                values: new object[] { new DateTime(2026, 8, 4, 1, 39, 39, 46, DateTimeKind.Utc).AddTicks(8700), new DateTime(2026, 8, 5, 3, 39, 39, 46, DateTimeKind.Utc).AddTicks(7824), new DateTime(2026, 8, 4, 1, 49, 39, 46, DateTimeKind.Utc).AddTicks(8515), new DateTime(2026, 8, 5, 1, 39, 39, 46, DateTimeKind.Utc).AddTicks(7603) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 8, 4, 1, 39, 39, 46, DateTimeKind.Utc).AddTicks(8827), new DateTime(2026, 8, 6, 5, 39, 39, 46, DateTimeKind.Utc).AddTicks(8826), new DateTime(2026, 8, 6, 1, 39, 39, 46, DateTimeKind.Utc).AddTicks(8825) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 8, 4, 1, 39, 39, 46, DateTimeKind.Utc).AddTicks(8832), new DateTime(2026, 8, 4, 3, 39, 39, 46, DateTimeKind.Utc).AddTicks(8831), new DateTime(2026, 8, 4, 0, 39, 39, 46, DateTimeKind.Utc).AddTicks(8830) });

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 4, 1, 39, 39, 52, DateTimeKind.Utc).AddTicks(1153));

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 4, 1, 39, 39, 52, DateTimeKind.Utc).AddTicks(1292));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$OCMpUcmBqIuKhkAJN6JDU.3tUGu9GS5lB4mPLw.hDi/WXgHGtXzWy");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$OCMpUcmBqIuKhkAJN6JDU.3tUGu9GS5lB4mPLw.hDi/WXgHGtXzWy");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$OCMpUcmBqIuKhkAJN6JDU.3tUGu9GS5lB4mPLw.hDi/WXgHGtXzWy");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "PasswordHash",
                value: "$2a$11$OCMpUcmBqIuKhkAJN6JDU.3tUGu9GS5lB4mPLw.hDi/WXgHGtXzWy");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerRequests_UserId",
                table: "CustomerRequests",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CustomerRequests");

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "EndTime", "PaymentDeadline", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 29, 4, 6, 0, 789, DateTimeKind.Utc).AddTicks(1294), new DateTime(2026, 7, 30, 6, 6, 0, 789, DateTimeKind.Utc).AddTicks(501), new DateTime(2026, 7, 29, 4, 16, 0, 789, DateTimeKind.Utc).AddTicks(1121), new DateTime(2026, 7, 30, 4, 6, 0, 789, DateTimeKind.Utc).AddTicks(299) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 29, 4, 6, 0, 789, DateTimeKind.Utc).AddTicks(1416), new DateTime(2026, 7, 31, 8, 6, 0, 789, DateTimeKind.Utc).AddTicks(1414), new DateTime(2026, 7, 31, 4, 6, 0, 789, DateTimeKind.Utc).AddTicks(1413) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 29, 4, 6, 0, 789, DateTimeKind.Utc).AddTicks(1420), new DateTime(2026, 7, 29, 6, 6, 0, 789, DateTimeKind.Utc).AddTicks(1418), new DateTime(2026, 7, 29, 3, 6, 0, 789, DateTimeKind.Utc).AddTicks(1418) });

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 4, 6, 0, 794, DateTimeKind.Utc).AddTicks(1176));

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 4, 6, 0, 794, DateTimeKind.Utc).AddTicks(1324));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$r0Wq3rjd1Es1q2rpbdBAh.EOZCYNZ/Phal/JrzMBKyeOOu3VHVG2m");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$r0Wq3rjd1Es1q2rpbdBAh.EOZCYNZ/Phal/JrzMBKyeOOu3VHVG2m");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$r0Wq3rjd1Es1q2rpbdBAh.EOZCYNZ/Phal/JrzMBKyeOOu3VHVG2m");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "PasswordHash",
                value: "$2a$11$r0Wq3rjd1Es1q2rpbdBAh.EOZCYNZ/Phal/JrzMBKyeOOu3VHVG2m");
        }
    }
}
