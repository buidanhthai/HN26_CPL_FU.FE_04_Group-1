using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddMoreServices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Add_on_Service",
                columns: new[] { "Id", "ChargeMethod", "IsAvailable", "ServiceName", "UnitPrice" },
                values: new object[,]
                {
                    { 3, "Fixed", true, "Cà phê sữa đá", 25000m },
                    { 4, "Fixed", true, "Bạc xỉu", 29000m },
                    { 5, "Fixed", true, "Trà đào cam sả", 35000m },
                    { 6, "Fixed", true, "Bánh mì sừng bò (Croissant)", 30000m },
                    { 7, "By_Quantity", true, "In ấn / Sao chụp tài liệu", 2000m },
                    { 8, "Fixed", true, "Bảng di động & Bút viết", 30000m }
                });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "EndTime", "PaymentDeadline", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 14, 9, 17, 47, 380, DateTimeKind.Utc).AddTicks(9008), new DateTime(2026, 7, 15, 11, 17, 47, 380, DateTimeKind.Utc).AddTicks(7753), new DateTime(2026, 7, 14, 9, 27, 47, 380, DateTimeKind.Utc).AddTicks(8662), new DateTime(2026, 7, 15, 9, 17, 47, 380, DateTimeKind.Utc).AddTicks(7332) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 14, 9, 17, 47, 380, DateTimeKind.Utc).AddTicks(9265), new DateTime(2026, 7, 16, 13, 17, 47, 380, DateTimeKind.Utc).AddTicks(9263), new DateTime(2026, 7, 16, 9, 17, 47, 380, DateTimeKind.Utc).AddTicks(9262) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 14, 9, 17, 47, 380, DateTimeKind.Utc).AddTicks(9270), new DateTime(2026, 7, 14, 11, 17, 47, 380, DateTimeKind.Utc).AddTicks(9268), new DateTime(2026, 7, 14, 8, 17, 47, 380, DateTimeKind.Utc).AddTicks(9268) });

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Add_on_Service",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Add_on_Service",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Add_on_Service",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Add_on_Service",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Add_on_Service",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Add_on_Service",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "EndTime", "PaymentDeadline", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 14, 2, 48, 28, 391, DateTimeKind.Utc).AddTicks(753), new DateTime(2026, 7, 15, 4, 48, 28, 391, DateTimeKind.Utc).AddTicks(119), new DateTime(2026, 7, 14, 2, 58, 28, 391, DateTimeKind.Utc).AddTicks(574), new DateTime(2026, 7, 15, 2, 48, 28, 390, DateTimeKind.Utc).AddTicks(9938) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 14, 2, 48, 28, 391, DateTimeKind.Utc).AddTicks(865), new DateTime(2026, 7, 16, 6, 48, 28, 391, DateTimeKind.Utc).AddTicks(864), new DateTime(2026, 7, 16, 2, 48, 28, 391, DateTimeKind.Utc).AddTicks(862) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 14, 2, 48, 28, 391, DateTimeKind.Utc).AddTicks(870), new DateTime(2026, 7, 14, 4, 48, 28, 391, DateTimeKind.Utc).AddTicks(869), new DateTime(2026, 7, 14, 1, 48, 28, 391, DateTimeKind.Utc).AddTicks(868) });

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
    }
}
