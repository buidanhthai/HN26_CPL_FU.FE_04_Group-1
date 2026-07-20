using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddMapCoordinates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MapHeight",
                table: "Space_Asset",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MapLeft",
                table: "Space_Asset",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MapTop",
                table: "Space_Asset",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MapWidth",
                table: "Space_Asset",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "EndTime", "PaymentDeadline", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 20, 6, 25, 9, 553, DateTimeKind.Utc).AddTicks(6083), new DateTime(2026, 7, 21, 8, 25, 9, 553, DateTimeKind.Utc).AddTicks(3514), new DateTime(2026, 7, 20, 6, 35, 9, 553, DateTimeKind.Utc).AddTicks(5462), new DateTime(2026, 7, 21, 6, 25, 9, 553, DateTimeKind.Utc).AddTicks(3012) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 20, 6, 25, 9, 553, DateTimeKind.Utc).AddTicks(6470), new DateTime(2026, 7, 22, 10, 25, 9, 553, DateTimeKind.Utc).AddTicks(6468), new DateTime(2026, 7, 22, 6, 25, 9, 553, DateTimeKind.Utc).AddTicks(6466) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 20, 6, 25, 9, 553, DateTimeKind.Utc).AddTicks(6475), new DateTime(2026, 7, 20, 8, 25, 9, 553, DateTimeKind.Utc).AddTicks(6474), new DateTime(2026, 7, 20, 5, 25, 9, 553, DateTimeKind.Utc).AddTicks(6473) });

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 20, 6, 25, 9, 561, DateTimeKind.Utc).AddTicks(498));

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 20, 6, 25, 9, 561, DateTimeKind.Utc).AddTicks(895));

            migrationBuilder.UpdateData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "MapHeight", "MapLeft", "MapTop", "MapWidth" },
                values: new object[] { "24%", "26%", "65%", "22%" });

            migrationBuilder.UpdateData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "MapHeight", "MapLeft", "MapTop", "MapWidth" },
                values: new object[] { "17%", "54%", "75%", "16%" });

            migrationBuilder.UpdateData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "MapHeight", "MapLeft", "MapTop", "MapWidth" },
                values: new object[] { "17%", "71%", "75%", "21%" });

            migrationBuilder.UpdateData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "MapHeight", "MapLeft", "MapTop", "MapWidth" },
                values: new object[] { "14%", "23%", "40%", "12%" });

            migrationBuilder.UpdateData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "MapHeight", "MapLeft", "MapTop", "MapWidth" },
                values: new object[] { "12%", "36%", "44%", "12%" });

            migrationBuilder.UpdateData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "MapHeight", "MapLeft", "MapTop", "MapWidth" },
                values: new object[] { "13%", "67%", "44%", "11%" });

            migrationBuilder.UpdateData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "MapHeight", "MapLeft", "MapTop", "MapWidth" },
                values: new object[] { "13%", "79%", "44%", "12%" });

            migrationBuilder.UpdateData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "MapHeight", "MapLeft", "MapTop", "MapWidth" },
                values: new object[] { "15%", "23%", "12%", "13%" });

            migrationBuilder.UpdateData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "MapHeight", "MapLeft", "MapTop", "MapWidth" },
                values: new object[] { "12%", "38%", "16%", "10%" });

            migrationBuilder.UpdateData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "MapHeight", "MapLeft", "MapTop", "MapWidth" },
                values: new object[] { "15%", "60%", "17%", "14%" });

            migrationBuilder.UpdateData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 11,
                columns: new[] { "MapHeight", "MapLeft", "MapTop", "MapWidth" },
                values: new object[] { "14%", "77%", "19%", "14%" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$cIF/SCsQ6MOdGVhjFe6pveNIRMFaijUKPARBZeoojxgyDuxZGAO9a");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$cIF/SCsQ6MOdGVhjFe6pveNIRMFaijUKPARBZeoojxgyDuxZGAO9a");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$cIF/SCsQ6MOdGVhjFe6pveNIRMFaijUKPARBZeoojxgyDuxZGAO9a");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "PasswordHash",
                value: "$2a$11$cIF/SCsQ6MOdGVhjFe6pveNIRMFaijUKPARBZeoojxgyDuxZGAO9a");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MapHeight",
                table: "Space_Asset");

            migrationBuilder.DropColumn(
                name: "MapLeft",
                table: "Space_Asset");

            migrationBuilder.DropColumn(
                name: "MapTop",
                table: "Space_Asset");

            migrationBuilder.DropColumn(
                name: "MapWidth",
                table: "Space_Asset");

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "EndTime", "PaymentDeadline", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 16, 3, 43, 41, 925, DateTimeKind.Utc).AddTicks(9099), new DateTime(2026, 7, 17, 5, 43, 41, 925, DateTimeKind.Utc).AddTicks(8245), new DateTime(2026, 7, 16, 3, 53, 41, 925, DateTimeKind.Utc).AddTicks(8915), new DateTime(2026, 7, 17, 3, 43, 41, 925, DateTimeKind.Utc).AddTicks(8005) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 16, 3, 43, 41, 925, DateTimeKind.Utc).AddTicks(9234), new DateTime(2026, 7, 18, 7, 43, 41, 925, DateTimeKind.Utc).AddTicks(9232), new DateTime(2026, 7, 18, 3, 43, 41, 925, DateTimeKind.Utc).AddTicks(9231) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "EndTime", "StartTime" },
                values: new object[] { new DateTime(2026, 7, 16, 3, 43, 41, 925, DateTimeKind.Utc).AddTicks(9238), new DateTime(2026, 7, 16, 5, 43, 41, 925, DateTimeKind.Utc).AddTicks(9236), new DateTime(2026, 7, 16, 2, 43, 41, 925, DateTimeKind.Utc).AddTicks(9236) });

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 16, 3, 43, 41, 929, DateTimeKind.Utc).AddTicks(7703));

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 16, 3, 43, 41, 929, DateTimeKind.Utc).AddTicks(7838));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$B6p17PohgUjfOGnq3qI1qOnQllc72Z2LD5KB9sVDiEzIzdDlj.Fde");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$B6p17PohgUjfOGnq3qI1qOnQllc72Z2LD5KB9sVDiEzIzdDlj.Fde");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$B6p17PohgUjfOGnq3qI1qOnQllc72Z2LD5KB9sVDiEzIzdDlj.Fde");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "PasswordHash",
                value: "$2a$11$B6p17PohgUjfOGnq3qI1qOnQllc72Z2LD5KB9sVDiEzIzdDlj.Fde");
        }
    }
}
