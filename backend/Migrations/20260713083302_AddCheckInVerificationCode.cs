using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCheckInVerificationCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                values: new object[] { null, new DateTime(2026, 7, 13, 8, 33, 1, 795, DateTimeKind.Utc).AddTicks(1809), new DateTime(2026, 7, 14, 10, 33, 1, 795, DateTimeKind.Utc).AddTicks(1161), new DateTime(2026, 7, 13, 8, 43, 1, 795, DateTimeKind.Utc).AddTicks(1627), new DateTime(2026, 7, 14, 8, 33, 1, 795, DateTimeKind.Utc).AddTicks(987) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CheckInVerificationCode", "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { null, new DateTime(2026, 7, 13, 8, 33, 1, 795, DateTimeKind.Utc).AddTicks(1922), new DateTime(2026, 7, 15, 12, 33, 1, 795, DateTimeKind.Utc).AddTicks(1920), new DateTime(2026, 7, 15, 8, 33, 1, 795, DateTimeKind.Utc).AddTicks(1919) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CheckInVerificationCode", "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { null, new DateTime(2026, 7, 13, 8, 33, 1, 795, DateTimeKind.Utc).AddTicks(1925), new DateTime(2026, 7, 13, 10, 33, 1, 795, DateTimeKind.Utc).AddTicks(1924), new DateTime(2026, 7, 13, 7, 33, 1, 795, DateTimeKind.Utc).AddTicks(1924) });

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CheckInVerificationCode",
                table: "Booking");

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "EndTime", "PaymentDeadline", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 13, 8, 26, 5, 651, DateTimeKind.Utc).AddTicks(5684), new DateTime(2026, 7, 14, 10, 26, 5, 651, DateTimeKind.Utc).AddTicks(5046), new DateTime(2026, 7, 13, 8, 36, 5, 651, DateTimeKind.Utc).AddTicks(5502), new DateTime(2026, 7, 14, 8, 26, 5, 651, DateTimeKind.Utc).AddTicks(4875) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 13, 8, 26, 5, 651, DateTimeKind.Utc).AddTicks(5798), new DateTime(2026, 7, 15, 12, 26, 5, 651, DateTimeKind.Utc).AddTicks(5796), new DateTime(2026, 7, 15, 8, 26, 5, 651, DateTimeKind.Utc).AddTicks(5796) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 13, 8, 26, 5, 651, DateTimeKind.Utc).AddTicks(5801), new DateTime(2026, 7, 13, 10, 26, 5, 651, DateTimeKind.Utc).AddTicks(5800), new DateTime(2026, 7, 13, 7, 26, 5, 651, DateTimeKind.Utc).AddTicks(5799) });

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 13, 8, 26, 5, 651, DateTimeKind.Utc).AddTicks(7234));

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 13, 8, 26, 5, 651, DateTimeKind.Utc).AddTicks(7371));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$XAxTaSlU4z0u6zd1GrWK2OJQCozOUQ2mcbX6JKThp.nZ8OLc2hCnO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$XAxTaSlU4z0u6zd1GrWK2OJQCozOUQ2mcbX6JKThp.nZ8OLc2hCnO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$XAxTaSlU4z0u6zd1GrWK2OJQCozOUQ2mcbX6JKThp.nZ8OLc2hCnO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "PasswordHash",
                value: "$2a$11$XAxTaSlU4z0u6zd1GrWK2OJQCozOUQ2mcbX6JKThp.nZ8OLc2hCnO");
        }
    }
}
