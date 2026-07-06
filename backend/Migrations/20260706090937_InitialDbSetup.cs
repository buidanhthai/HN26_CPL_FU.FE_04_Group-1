using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialDbSetup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Add_on_Service",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ServiceName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ChargeMethod = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UnitPrice = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    IsAvailable = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Add_on_Service", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Space_Asset",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    LocationName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AssetName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AssetType = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    BasePrice = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    Dimensions = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AreaM2 = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: false),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: true),
                    Description = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Space_Asset", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    FullName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Email = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PasswordHash = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Role = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Room_Layout",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    AssetId = table.Column<int>(type: "int", nullable: false),
                    LayoutName = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MaxCapacity = table.Column<int>(type: "int", nullable: false),
                    SetupDurationMinutes = table.Column<int>(type: "int", nullable: false),
                    PriceModifier = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false, defaultValue: 0m)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Room_Layout", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Room_Layout_Space_Asset_AssetId",
                        column: x => x.AssetId,
                        principalTable: "Space_Asset",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Booking",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    AssetId = table.Column<int>(type: "int", nullable: false),
                    LayoutId = table.Column<int>(type: "int", nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    BookingStatus = table.Column<string>(type: "varchar(25)", maxLength: 25, nullable: false, defaultValue: "Pending")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PaymentDeadline = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CustomSetupNote = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SnapshotBasePrice = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    SnapshotPriceModifier = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false, defaultValue: 0m),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Booking", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Booking_Room_Layout_LayoutId",
                        column: x => x.LayoutId,
                        principalTable: "Room_Layout",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Booking_Space_Asset_AssetId",
                        column: x => x.AssetId,
                        principalTable: "Space_Asset",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Booking_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Booking_Service_Detail",
                columns: table => new
                {
                    BookingId = table.Column<int>(type: "int", nullable: false),
                    ServiceId = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    SnapshotUnitPrice = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    IsIncurred = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    PaymentStatus = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false, defaultValue: "Unpaid")
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Booking_Service_Detail", x => new { x.BookingId, x.ServiceId });
                    table.ForeignKey(
                        name: "FK_Booking_Service_Detail_Add_on_Service_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "Add_on_Service",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Booking_Service_Detail_Booking_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Booking",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Internal_Tasks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    BookingId = table.Column<int>(type: "int", nullable: false),
                    TaskCategory = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TaskDescription = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RequiredStaffCount = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    TaskStatus = table.Column<string>(type: "varchar(25)", maxLength: 25, nullable: false, defaultValue: "Unassigned")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Internal_Tasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Internal_Tasks_Booking_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Booking",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Invoice",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    BookingId = table.Column<int>(type: "int", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    PaidUpfront = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false, defaultValue: 0m),
                    FinalDue = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    InvoiceType = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PaymentStatus = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false, defaultValue: "Unpaid")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Invoice", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Invoice_Booking_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Booking",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Task_Allocations",
                columns: table => new
                {
                    TaskId = table.Column<int>(type: "int", nullable: false),
                    StaffId = table.Column<int>(type: "int", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Task_Allocations", x => new { x.TaskId, x.StaffId });
                    table.ForeignKey(
                        name: "FK_Task_Allocations_Internal_Tasks_TaskId",
                        column: x => x.TaskId,
                        principalTable: "Internal_Tasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Task_Allocations_Users_StaffId",
                        column: x => x.StaffId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "Add_on_Service",
                columns: new[] { "Id", "ChargeMethod", "IsAvailable", "ServiceName", "UnitPrice" },
                values: new object[,]
                {
                    { 1, "Fixed", true, "Trà đá & Cà phê", 20000m },
                    { 2, "By_Hour", true, "Projector", 50000m }
                });

            migrationBuilder.InsertData(
                table: "Space_Asset",
                columns: new[] { "Id", "AreaM2", "AssetName", "AssetType", "BasePrice", "Capacity", "Description", "Dimensions", "IsActive", "LocationName" },
                values: new object[,]
                {
                    { 1, 0.96m, "Hot Desk 101", "Hot_Desk", 50000m, 1, null, "1.2m x 0.8m", true, "Lầu 1" },
                    { 2, 20.00m, "Meeting Room A", "Meeting_Room", 300000m, 10, null, "5m x 4m", true, "Lầu 2" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "FullName", "PasswordHash", "Role" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 7, 6, 0, 0, 0, 0, DateTimeKind.Utc), "admin@example.com", "System Admin", "admin_pwd_hash", "ADMIN" },
                    { 2, new DateTime(2026, 7, 6, 0, 0, 0, 0, DateTimeKind.Utc), "staff@example.com", "John Staff", "staff_pwd_hash", "STAFF" },
                    { 3, new DateTime(2026, 7, 6, 0, 0, 0, 0, DateTimeKind.Utc), "alice@example.com", "Alice User", "user_pwd_hash", "USER" }
                });

            migrationBuilder.InsertData(
                table: "Room_Layout",
                columns: new[] { "Id", "AssetId", "LayoutName", "MaxCapacity", "PriceModifier", "SetupDurationMinutes" },
                values: new object[] { 1, 2, "Chữ U", 8, 50000m, 15 });

            migrationBuilder.InsertData(
                table: "Room_Layout",
                columns: new[] { "Id", "AssetId", "LayoutName", "MaxCapacity", "SetupDurationMinutes" },
                values: new object[] { 2, 2, "Lớp học", 10, 20 });

            migrationBuilder.CreateIndex(
                name: "IX_Booking_AssetId",
                table: "Booking",
                column: "AssetId");

            migrationBuilder.CreateIndex(
                name: "IX_Booking_LayoutId",
                table: "Booking",
                column: "LayoutId");

            migrationBuilder.CreateIndex(
                name: "IX_Booking_UserId",
                table: "Booking",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Booking_Service_Detail_ServiceId",
                table: "Booking_Service_Detail",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Internal_Tasks_BookingId",
                table: "Internal_Tasks",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoice_BookingId",
                table: "Invoice",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_Room_Layout_AssetId",
                table: "Room_Layout",
                column: "AssetId");

            migrationBuilder.CreateIndex(
                name: "IX_Task_Allocations_StaffId",
                table: "Task_Allocations",
                column: "StaffId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Booking_Service_Detail");

            migrationBuilder.DropTable(
                name: "Invoice");

            migrationBuilder.DropTable(
                name: "Task_Allocations");

            migrationBuilder.DropTable(
                name: "Add_on_Service");

            migrationBuilder.DropTable(
                name: "Internal_Tasks");

            migrationBuilder.DropTable(
                name: "Booking");

            migrationBuilder.DropTable(
                name: "Room_Layout");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Space_Asset");
        }
    }
}
