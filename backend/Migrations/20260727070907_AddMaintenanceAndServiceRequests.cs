using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddMaintenanceAndServiceRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsMaintenance",
                table: "Space_Asset",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "ActualEndTime",
                table: "Booking",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Arrived",
                table: "Booking",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "CancellationReason",
                table: "Booking",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NoShowTimeoutMinutes",
                table: "Booking",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "RefundAmount",
                table: "Booking",
                type: "decimal(12,2)",
                precision: 12,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "AssetUnavailabilities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AssetId = table.Column<int>(type: "int", nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SpaceAssetId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssetUnavailabilities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssetUnavailabilities_Space_Asset_SpaceAssetId",
                        column: x => x.SpaceAssetId,
                        principalTable: "Space_Asset",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ServiceRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BookingId = table.Column<int>(type: "int", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    RequestType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RoomName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Detail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ServiceId = table.Column<int>(type: "int", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    RequestStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AddOnServiceId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceRequests_Add_on_Service_AddOnServiceId",
                        column: x => x.AddOnServiceId,
                        principalTable: "Add_on_Service",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ServiceRequests_Booking_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Booking",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ServiceRequests_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ActualEndTime", "Arrived", "CancellationReason", "CreatedAt", "EndTime", "NoShowTimeoutMinutes", "PaymentDeadline", "StartTime" },
                values: new object[] { null, false, null, new DateTime(2026, 7, 27, 7, 9, 7, 53, DateTimeKind.Utc).AddTicks(1419), new DateTime(2026, 7, 28, 9, 9, 7, 53, DateTimeKind.Utc).AddTicks(367), 30, new DateTime(2026, 7, 27, 7, 19, 7, 53, DateTimeKind.Utc).AddTicks(1209), new DateTime(2026, 7, 28, 7, 9, 7, 53, DateTimeKind.Utc).AddTicks(1) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "ActualEndTime", "Arrived", "CancellationReason", "CreatedAt", "EndTime", "NoShowTimeoutMinutes", "StartTime" },
                values: new object[] { null, false, null, new DateTime(2026, 7, 27, 7, 9, 7, 53, DateTimeKind.Utc).AddTicks(1564), new DateTime(2026, 7, 29, 11, 9, 7, 53, DateTimeKind.Utc).AddTicks(1562), 30, new DateTime(2026, 7, 29, 7, 9, 7, 53, DateTimeKind.Utc).AddTicks(1562) });

            migrationBuilder.UpdateData(
                table: "Booking",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "ActualEndTime", "Arrived", "CancellationReason", "CreatedAt", "EndTime", "NoShowTimeoutMinutes", "StartTime" },
                values: new object[] { null, false, null, new DateTime(2026, 7, 27, 7, 9, 7, 53, DateTimeKind.Utc).AddTicks(1569), new DateTime(2026, 7, 27, 9, 9, 7, 53, DateTimeKind.Utc).AddTicks(1567), 30, new DateTime(2026, 7, 27, 6, 9, 7, 53, DateTimeKind.Utc).AddTicks(1567) });

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 27, 7, 9, 7, 57, DateTimeKind.Utc).AddTicks(6342));

            migrationBuilder.UpdateData(
                table: "Internal_Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 27, 7, 9, 7, 57, DateTimeKind.Utc).AddTicks(6502));

            migrationBuilder.UpdateData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 1,
                column: "IsMaintenance",
                value: false);

            migrationBuilder.UpdateData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 2,
                column: "IsMaintenance",
                value: false);

            migrationBuilder.UpdateData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 3,
                column: "IsMaintenance",
                value: false);

            migrationBuilder.UpdateData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 4,
                column: "IsMaintenance",
                value: false);

            migrationBuilder.UpdateData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 5,
                column: "IsMaintenance",
                value: false);

            migrationBuilder.UpdateData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 6,
                column: "IsMaintenance",
                value: false);

            migrationBuilder.UpdateData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 7,
                column: "IsMaintenance",
                value: false);

            migrationBuilder.UpdateData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 8,
                column: "IsMaintenance",
                value: false);

            migrationBuilder.UpdateData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 9,
                column: "IsMaintenance",
                value: false);

            migrationBuilder.UpdateData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 10,
                column: "IsMaintenance",
                value: false);

            migrationBuilder.UpdateData(
                table: "Space_Asset",
                keyColumn: "Id",
                keyValue: 11,
                column: "IsMaintenance",
                value: false);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$nxDGINWj49/OnTNqXcBdQOUsQ2WLshkVkmGQrnsKzWkwfrEzD.pi6");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$nxDGINWj49/OnTNqXcBdQOUsQ2WLshkVkmGQrnsKzWkwfrEzD.pi6");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$nxDGINWj49/OnTNqXcBdQOUsQ2WLshkVkmGQrnsKzWkwfrEzD.pi6");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "PasswordHash",
                value: "$2a$11$nxDGINWj49/OnTNqXcBdQOUsQ2WLshkVkmGQrnsKzWkwfrEzD.pi6");

            migrationBuilder.CreateIndex(
                name: "IX_AssetUnavailabilities_SpaceAssetId",
                table: "AssetUnavailabilities",
                column: "SpaceAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_AddOnServiceId",
                table: "ServiceRequests",
                column: "AddOnServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_BookingId",
                table: "ServiceRequests",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_UserId",
                table: "ServiceRequests",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AssetUnavailabilities");

            migrationBuilder.DropTable(
                name: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "IsMaintenance",
                table: "Space_Asset");

            migrationBuilder.DropColumn(
                name: "ActualEndTime",
                table: "Booking");

            migrationBuilder.DropColumn(
                name: "Arrived",
                table: "Booking");

            migrationBuilder.DropColumn(
                name: "CancellationReason",
                table: "Booking");

            migrationBuilder.DropColumn(
                name: "NoShowTimeoutMinutes",
                table: "Booking");

            migrationBuilder.DropColumn(
                name: "RefundAmount",
                table: "Booking");

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
