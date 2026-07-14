using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCheckInVerification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CheckedInAt",
                table: "Booking",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CheckedInByAdminId",
                table: "Booking",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CheckedInAt", "CheckedInByAdminId", "CreatedAt", "EndTime", "PaymentDeadline", "StartTime" },
                values: new object[] { null, null, new DateTime(2026, 7, 13, 8, 26, 5, 651, DateTimeKind.Utc).AddTicks(5684), new DateTime(2026, 7, 14, 10, 26, 5, 651, DateTimeKind.Utc).AddTicks(5046), new DateTime(2026, 7, 13, 8, 36, 5, 651, DateTimeKind.Utc).AddTicks(5502), new DateTime(2026, 7, 14, 8, 26, 5, 651, DateTimeKind.Utc).AddTicks(4875) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CheckedInAt", "CheckedInByAdminId", "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { null, null, new DateTime(2026, 7, 13, 8, 26, 5, 651, DateTimeKind.Utc).AddTicks(5798), new DateTime(2026, 7, 15, 12, 26, 5, 651, DateTimeKind.Utc).AddTicks(5796), new DateTime(2026, 7, 15, 8, 26, 5, 651, DateTimeKind.Utc).AddTicks(5796) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CheckedInAt", "CheckedInByAdminId", "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { null, null, new DateTime(2026, 7, 13, 8, 26, 5, 651, DateTimeKind.Utc).AddTicks(5801), new DateTime(2026, 7, 13, 10, 26, 5, 651, DateTimeKind.Utc).AddTicks(5800), new DateTime(2026, 7, 13, 7, 26, 5, 651, DateTimeKind.Utc).AddTicks(5799) });

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

            migrationBuilder.CreateIndex(
                name: "IX_Booking_CheckedInByAdminId",
                table: "Booking",
                column: "CheckedInByAdminId");

            migrationBuilder.AddForeignKey(
                name: "FK_Booking_Users_CheckedInByAdminId",
                table: "Booking",
                column: "CheckedInByAdminId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Booking_Users_CheckedInByAdminId",
                table: "Booking");

            migrationBuilder.DropIndex(
                name: "IX_Booking_CheckedInByAdminId",
                table: "Booking");

            migrationBuilder.DropColumn(
                name: "CheckedInAt",
                table: "Booking");

            migrationBuilder.DropColumn(
                name: "CheckedInByAdminId",
                table: "Booking");

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "EndTime", "PaymentDeadline", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 13, 3, 57, 18, 51, DateTimeKind.Utc).AddTicks(4012), new DateTime(2026, 7, 14, 5, 57, 18, 51, DateTimeKind.Utc).AddTicks(3256), new DateTime(2026, 7, 13, 4, 7, 18, 51, DateTimeKind.Utc).AddTicks(3796), new DateTime(2026, 7, 14, 3, 57, 18, 51, DateTimeKind.Utc).AddTicks(3052) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 13, 3, 57, 18, 51, DateTimeKind.Utc).AddTicks(4150), new DateTime(2026, 7, 15, 7, 57, 18, 51, DateTimeKind.Utc).AddTicks(4148), new DateTime(2026, 7, 15, 3, 57, 18, 51, DateTimeKind.Utc).AddTicks(4147) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 13, 3, 57, 18, 51, DateTimeKind.Utc).AddTicks(4154), new DateTime(2026, 7, 13, 5, 57, 18, 51, DateTimeKind.Utc).AddTicks(4153), new DateTime(2026, 7, 13, 2, 57, 18, 51, DateTimeKind.Utc).AddTicks(4152) });

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 13, 3, 57, 18, 51, DateTimeKind.Utc).AddTicks(5540));

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 13, 3, 57, 18, 51, DateTimeKind.Utc).AddTicks(5677));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$IBjB36C6eFS8wcVxyMQJFeQd/giKSMyknlBLVuoq.g.WPHIG3G3Ci");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$IBjB36C6eFS8wcVxyMQJFeQd/giKSMyknlBLVuoq.g.WPHIG3G3Ci");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$IBjB36C6eFS8wcVxyMQJFeQd/giKSMyknlBLVuoq.g.WPHIG3G3Ci");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "PasswordHash",
                value: "$2a$11$IBjB36C6eFS8wcVxyMQJFeQd/giKSMyknlBLVuoq.g.WPHIG3G3Ci");
        }
    }
}
