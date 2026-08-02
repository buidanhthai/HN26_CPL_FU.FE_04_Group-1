using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddTaskLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Task_Log",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TaskId = table.Column<int>(type: "int", nullable: false),
                    UserFullName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ActionDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Task_Log", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Task_Log_Internal_Tasks_TaskId",
                        column: x => x.TaskId,
                        principalTable: "Internal_Tasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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

            migrationBuilder.CreateIndex(
                name: "IX_Task_Log_TaskId",
                table: "Task_Log",
                column: "TaskId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Task_Log");

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
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 2, 52, 52, 5, DateTimeKind.Utc).AddTicks(5830));

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 2, 52, 52, 5, DateTimeKind.Utc).AddTicks(5969));

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
        }
    }
}
