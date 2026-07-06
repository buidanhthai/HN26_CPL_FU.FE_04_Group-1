CREATE DATABASE IF NOT EXISTS `odm_workspace_db` CHARACTER SET utf8mb4;
USE `odm_workspace_db`;

CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `ProductVersion` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
) CHARACTER SET=utf8mb4;

START TRANSACTION;


CREATE TABLE `Add_on_Service` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `ServiceName` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
    `ChargeMethod` varchar(30) CHARACTER SET utf8mb4 NOT NULL,
    `UnitPrice` decimal(12,2) NOT NULL,
    `IsAvailable` tinyint(1) NOT NULL DEFAULT TRUE,
    CONSTRAINT `PK_Add_on_Service` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Space_Asset` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `LocationName` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
    `AssetName` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
    `AssetType` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
    `BasePrice` decimal(12,2) NOT NULL,
    `Capacity` int NOT NULL,
    `Dimensions` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
    `AreaM2` decimal(6,2) NOT NULL,
    `IsActive` tinyint(1) NOT NULL DEFAULT TRUE,
    `Description` longtext CHARACTER SET utf8mb4 NULL,
    CONSTRAINT `PK_Space_Asset` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Users` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `FullName` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
    `Email` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
    `PasswordHash` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `Role` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `CreatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `PK_Users` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Room_Layout` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `AssetId` int NOT NULL,
    `LayoutName` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
    `MaxCapacity` int NOT NULL,
    `SetupDurationMinutes` int NOT NULL,
    `PriceModifier` decimal(12,2) NOT NULL DEFAULT 0.0,
    CONSTRAINT `PK_Room_Layout` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_Room_Layout_Space_Asset_AssetId` FOREIGN KEY (`AssetId`) REFERENCES `Space_Asset` (`Id`) ON DELETE RESTRICT
) CHARACTER SET=utf8mb4;

CREATE TABLE `Booking` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `UserId` int NOT NULL,
    `AssetId` int NOT NULL,
    `LayoutId` int NOT NULL,
    `StartTime` datetime(6) NOT NULL,
    `EndTime` datetime(6) NOT NULL,
    `BookingStatus` varchar(25) CHARACTER SET utf8mb4 NOT NULL DEFAULT 'Pending',
    `PaymentDeadline` datetime(6) NULL,
    `CustomSetupNote` longtext CHARACTER SET utf8mb4 NULL,
    `SnapshotBasePrice` decimal(12,2) NOT NULL,
    `SnapshotPriceModifier` decimal(12,2) NOT NULL DEFAULT 0.0,
    `CreatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `PK_Booking` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_Booking_Room_Layout_LayoutId` FOREIGN KEY (`LayoutId`) REFERENCES `Room_Layout` (`Id`) ON DELETE RESTRICT,
    CONSTRAINT `FK_Booking_Space_Asset_AssetId` FOREIGN KEY (`AssetId`) REFERENCES `Space_Asset` (`Id`) ON DELETE RESTRICT,
    CONSTRAINT `FK_Booking_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE RESTRICT
) CHARACTER SET=utf8mb4;

CREATE TABLE `Booking_Service_Detail` (
    `BookingId` int NOT NULL,
    `ServiceId` int NOT NULL,
    `Quantity` int NOT NULL DEFAULT 1,
    `SnapshotUnitPrice` decimal(12,2) NOT NULL,
    `IsIncurred` tinyint(1) NOT NULL DEFAULT FALSE,
    `PaymentStatus` varchar(20) CHARACTER SET utf8mb4 NOT NULL DEFAULT 'Unpaid',
    CONSTRAINT `PK_Booking_Service_Detail` PRIMARY KEY (`BookingId`, `ServiceId`),
    CONSTRAINT `FK_Booking_Service_Detail_Add_on_Service_ServiceId` FOREIGN KEY (`ServiceId`) REFERENCES `Add_on_Service` (`Id`) ON DELETE RESTRICT,
    CONSTRAINT `FK_Booking_Service_Detail_Booking_BookingId` FOREIGN KEY (`BookingId`) REFERENCES `Booking` (`Id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `Internal_Tasks` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `BookingId` int NOT NULL,
    `TaskCategory` varchar(30) CHARACTER SET utf8mb4 NOT NULL,
    `TaskDescription` longtext CHARACTER SET utf8mb4 NULL,
    `RequiredStaffCount` int NOT NULL DEFAULT 1,
    `TaskStatus` varchar(25) CHARACTER SET utf8mb4 NOT NULL DEFAULT 'Unassigned',
    `CreatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `PK_Internal_Tasks` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_Internal_Tasks_Booking_BookingId` FOREIGN KEY (`BookingId`) REFERENCES `Booking` (`Id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `Invoice` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `BookingId` int NOT NULL,
    `TotalAmount` decimal(12,2) NOT NULL,
    `PaidUpfront` decimal(12,2) NOT NULL DEFAULT 0.0,
    `FinalDue` decimal(12,2) NOT NULL,
    `InvoiceType` varchar(30) CHARACTER SET utf8mb4 NOT NULL,
    `PaymentStatus` varchar(20) CHARACTER SET utf8mb4 NOT NULL DEFAULT 'Unpaid',
    `CreatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `PK_Invoice` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_Invoice_Booking_BookingId` FOREIGN KEY (`BookingId`) REFERENCES `Booking` (`Id`) ON DELETE RESTRICT
) CHARACTER SET=utf8mb4;

CREATE TABLE `Task_Allocations` (
    `TaskId` int NOT NULL,
    `StaffId` int NOT NULL,
    `JoinedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `PK_Task_Allocations` PRIMARY KEY (`TaskId`, `StaffId`),
    CONSTRAINT `FK_Task_Allocations_Internal_Tasks_TaskId` FOREIGN KEY (`TaskId`) REFERENCES `Internal_Tasks` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_Task_Allocations_Users_StaffId` FOREIGN KEY (`StaffId`) REFERENCES `Users` (`Id`) ON DELETE RESTRICT
) CHARACTER SET=utf8mb4;

INSERT INTO `Add_on_Service` (`Id`, `ChargeMethod`, `IsAvailable`, `ServiceName`, `UnitPrice`)
VALUES (1, 'Fixed', TRUE, 'Trà đá & Cà phê', 20000.0),
(2, 'By_Hour', TRUE, 'Projector', 50000.0);

INSERT INTO `Space_Asset` (`Id`, `AreaM2`, `AssetName`, `AssetType`, `BasePrice`, `Capacity`, `Description`, `Dimensions`, `IsActive`, `LocationName`)
VALUES (1, 0.96, 'Hot Desk 101', 'Hot_Desk', 50000.0, 1, NULL, '1.2m x 0.8m', TRUE, 'Lầu 1'),
(2, 20.0, 'Meeting Room A', 'Meeting_Room', 300000.0, 10, NULL, '5m x 4m', TRUE, 'Lầu 2');

INSERT INTO `Users` (`Id`, `CreatedAt`, `Email`, `FullName`, `PasswordHash`, `Role`)
VALUES (1, TIMESTAMP '2026-07-06 00:00:00', 'admin@example.com', 'System Admin', 'admin_pwd_hash', 'ADMIN'),
(2, TIMESTAMP '2026-07-06 00:00:00', 'staff@example.com', 'John Staff', 'staff_pwd_hash', 'STAFF'),
(3, TIMESTAMP '2026-07-06 00:00:00', 'alice@example.com', 'Alice User', 'user_pwd_hash', 'USER');

INSERT INTO `Room_Layout` (`Id`, `AssetId`, `LayoutName`, `MaxCapacity`, `PriceModifier`, `SetupDurationMinutes`)
VALUES (1, 2, 'Chữ U', 8, 50000.0, 15);

INSERT INTO `Room_Layout` (`Id`, `AssetId`, `LayoutName`, `MaxCapacity`, `SetupDurationMinutes`)
VALUES (2, 2, 'Lớp học', 10, 20);

CREATE INDEX `IX_Booking_AssetId` ON `Booking` (`AssetId`);

CREATE INDEX `IX_Booking_LayoutId` ON `Booking` (`LayoutId`);

CREATE INDEX `IX_Booking_UserId` ON `Booking` (`UserId`);

CREATE INDEX `IX_Booking_Service_Detail_ServiceId` ON `Booking_Service_Detail` (`ServiceId`);

CREATE INDEX `IX_Internal_Tasks_BookingId` ON `Internal_Tasks` (`BookingId`);

CREATE INDEX `IX_Invoice_BookingId` ON `Invoice` (`BookingId`);

CREATE INDEX `IX_Room_Layout_AssetId` ON `Room_Layout` (`AssetId`);

CREATE INDEX `IX_Task_Allocations_StaffId` ON `Task_Allocations` (`StaffId`);

CREATE UNIQUE INDEX `IX_Users_Email` ON `Users` (`Email`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260706090937_InitialDbSetup', '9.0.0');

COMMIT;

