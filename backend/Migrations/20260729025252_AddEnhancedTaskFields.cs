using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddEnhancedTaskFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "Task_Allocations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CompletionNote",
                table: "Task_Allocations",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EvidenceImageUrl",
                table: "Task_Allocations",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Deadline",
                table: "Internal_Tasks",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Priority",
                table: "Internal_Tasks",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "MEDIUM");

            migrationBuilder.AddColumn<int>(
                name: "SpaceAssetId",
                table: "Internal_Tasks",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "EndTime", "PaymentDeadline", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 29, 2, 52, 51, 999, DateTimeKind.Utc).AddTicks(9022), new DateTime(2026, 7, 30, 4, 52, 51, 999, DateTimeKind.Utc).AddTicks(8177), new DateTime(2026, 7, 29, 3, 2, 51, 999, DateTimeKind.Utc).AddTicks(8839), new DateTime(2026, 7, 30, 2, 52, 51, 999, DateTimeKind.Utc).AddTicks(7940) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 29, 2, 52, 51, 999, DateTimeKind.Utc).AddTicks(9168), new DateTime(2026, 7, 31, 6, 52, 51, 999, DateTimeKind.Utc).AddTicks(9166), new DateTime(2026, 7, 31, 2, 52, 51, 999, DateTimeKind.Utc).AddTicks(9165) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 29, 2, 52, 51, 999, DateTimeKind.Utc).AddTicks(9172), new DateTime(2026, 7, 29, 4, 52, 51, 999, DateTimeKind.Utc).AddTicks(9171), new DateTime(2026, 7, 29, 1, 52, 51, 999, DateTimeKind.Utc).AddTicks(9170) });

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "Deadline", "Priority", "SpaceAssetId" },
                values: new object[] { new DateTime(2026, 7, 29, 2, 52, 52, 5, DateTimeKind.Utc).AddTicks(5830), null, "MEDIUM", null });

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "Deadline", "Priority", "SpaceAssetId" },
                values: new object[] { new DateTime(2026, 7, 29, 2, 52, 52, 5, DateTimeKind.Utc).AddTicks(5969), null, "MEDIUM", null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$g2vDBH2HCEW9qW197Tq9neljTCazy6bKJ84lbg3LgPA4/DG7n86Ui");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$g2vDBH2HCEW9qW197Tq9neljTCazy6bKJ84lbg3LgPA4/DG7n86Ui");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$g2vDBH2HCEW9qW197Tq9neljTCazy6bKJ84lbg3LgPA4/DG7n86Ui");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "PasswordHash",
                value: "$2a$11$g2vDBH2HCEW9qW197Tq9neljTCazy6bKJ84lbg3LgPA4/DG7n86Ui");

            migrationBuilder.CreateIndex(
                name: "IX_Internal_Tasks_SpaceAssetId",
                table: "Internal_Tasks",
                column: "SpaceAssetId");

            migrationBuilder.AddForeignKey(
                name: "FK_Internal_Tasks_Space_Asset_SpaceAssetId",
                table: "Internal_Tasks",
                column: "SpaceAssetId",
                principalTable: "Space_Asset",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Internal_Tasks_Space_Asset_SpaceAssetId",
                table: "Internal_Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Internal_Tasks_SpaceAssetId",
                table: "Internal_Tasks");

            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "Task_Allocations");

            migrationBuilder.DropColumn(
                name: "CompletionNote",
                table: "Task_Allocations");

            migrationBuilder.DropColumn(
                name: "EvidenceImageUrl",
                table: "Task_Allocations");

            migrationBuilder.DropColumn(
                name: "Deadline",
                table: "Internal_Tasks");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "Internal_Tasks");

            migrationBuilder.DropColumn(
                name: "SpaceAssetId",
                table: "Internal_Tasks");

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "EndTime", "PaymentDeadline", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 28, 22, 4, 7, 942, DateTimeKind.Utc).AddTicks(36), new DateTime(2026, 7, 30, 0, 4, 7, 941, DateTimeKind.Utc).AddTicks(9222), new DateTime(2026, 7, 28, 22, 14, 7, 941, DateTimeKind.Utc).AddTicks(9863), new DateTime(2026, 7, 29, 22, 4, 7, 941, DateTimeKind.Utc).AddTicks(9015) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 28, 22, 4, 7, 942, DateTimeKind.Utc).AddTicks(164), new DateTime(2026, 7, 31, 2, 4, 7, 942, DateTimeKind.Utc).AddTicks(163), new DateTime(2026, 7, 30, 22, 4, 7, 942, DateTimeKind.Utc).AddTicks(162) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 28, 22, 4, 7, 942, DateTimeKind.Utc).AddTicks(167), new DateTime(2026, 7, 29, 0, 4, 7, 942, DateTimeKind.Utc).AddTicks(166), new DateTime(2026, 7, 28, 21, 4, 7, 942, DateTimeKind.Utc).AddTicks(166) });

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
    }
}
