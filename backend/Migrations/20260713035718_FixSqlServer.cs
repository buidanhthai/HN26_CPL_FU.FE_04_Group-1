using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class FixSqlServer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "EndTime", "PaymentDeadline", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 13, 3, 56, 51, 765, DateTimeKind.Utc).AddTicks(3503), new DateTime(2026, 7, 14, 5, 56, 51, 765, DateTimeKind.Utc).AddTicks(2811), new DateTime(2026, 7, 13, 4, 6, 51, 765, DateTimeKind.Utc).AddTicks(3305), new DateTime(2026, 7, 14, 3, 56, 51, 765, DateTimeKind.Utc).AddTicks(2615) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 13, 3, 56, 51, 765, DateTimeKind.Utc).AddTicks(3628), new DateTime(2026, 7, 15, 7, 56, 51, 765, DateTimeKind.Utc).AddTicks(3626), new DateTime(2026, 7, 15, 3, 56, 51, 765, DateTimeKind.Utc).AddTicks(3626) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 13, 3, 56, 51, 765, DateTimeKind.Utc).AddTicks(3631), new DateTime(2026, 7, 13, 5, 56, 51, 765, DateTimeKind.Utc).AddTicks(3630), new DateTime(2026, 7, 13, 2, 56, 51, 765, DateTimeKind.Utc).AddTicks(3630) });

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 13, 3, 56, 51, 765, DateTimeKind.Utc).AddTicks(4794));

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 13, 3, 56, 51, 765, DateTimeKind.Utc).AddTicks(4903));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$oXJahW8iQJCHJtDpVwVBoOyBpBO9Shrc/SQxDQvnXvRPhhuYJ7AeO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$oXJahW8iQJCHJtDpVwVBoOyBpBO9Shrc/SQxDQvnXvRPhhuYJ7AeO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$oXJahW8iQJCHJtDpVwVBoOyBpBO9Shrc/SQxDQvnXvRPhhuYJ7AeO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "PasswordHash",
                value: "$2a$11$oXJahW8iQJCHJtDpVwVBoOyBpBO9Shrc/SQxDQvnXvRPhhuYJ7AeO");
        }
    }
}
