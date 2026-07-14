using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSpaceAssetsSeeding : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "AreaM2", "AssetName", "AssetType", "BasePrice", "Capacity", "Dimensions" },
                values: new object[] { 30.00m, "Hội Trường Lớn 101", "Meeting_Room", 300000m, 15, "6m x 5m" });

            migrationBuilder.UpdateData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "AssetName", "BasePrice", "LocationName" },
                values: new object[] { "Họp Chiến Lược 102", 250000m, "Lầu 1" });

            migrationBuilder.InsertData(
                table: "Space_Asset",
                columns: new[] { "Id", "AreaM2", "AssetName", "AssetType", "BasePrice", "Capacity", "Description", "Dimensions", "IsActive", "LocationName" },
                values: new object[,]
                {
                    { 3, 16.00m, "Tiếp Khách VIP 103", "Meeting_Room", 200000m, 6, null, "4m x 4m", true, "Lầu 1" },
                    { 4, 12.00m, "Phòng Dự Án 201", "Meeting_Room", 150000m, 6, null, "4m x 3m", true, "Lầu 2" },
                    { 5, 12.00m, "Phòng Dự Án 202", "Meeting_Room", 150000m, 6, null, "4m x 3m", true, "Lầu 2" },
                    { 6, 9.00m, "Phòng Phỏng Vấn 203", "Meeting_Room", 100000m, 4, null, "3m x 3m", true, "Lầu 2" },
                    { 7, 16.00m, "Phòng Nghiên Cứu 204", "Meeting_Room", 200000m, 8, null, "4m x 4m", true, "Lầu 2" },
                    { 8, 10.50m, "Họp Nhóm A", "Meeting_Room", 120000m, 5, null, "3.5m x 3m", true, "Lầu 3" },
                    { 9, 10.50m, "Họp Nhóm B", "Meeting_Room", 120000m, 5, null, "3.5m x 3m", true, "Lầu 3" },
                    { 10, 25.00m, "Hội Thảo 303", "Meeting_Room", 250000m, 12, null, "5m x 5m", true, "Lầu 3" },
                    { 11, 40.00m, "Đào Tạo 304", "Meeting_Room", 400000m, 20, null, "8m x 5m", true, "Lầu 3" }
                });

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 11);

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
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "AreaM2", "AssetName", "AssetType", "BasePrice", "Capacity", "Dimensions" },
                values: new object[] { 0.96m, "Hot Desk 101", "Hot_Desk", 50000m, 1, "1.2m x 0.8m" });

            migrationBuilder.UpdateData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "AssetName", "BasePrice", "LocationName" },
                values: new object[] { "Meeting Room A", 300000m, "Lầu 2" });

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
        }
    }
}
