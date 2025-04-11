-- Create Database
CREATE DATABASE IF NOT EXISTS VendorManagementDB;
USE VendorManagementDB;

-- Create Tables
CREATE TABLE Vendor (
    VendorID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    ServiceCategory VARCHAR(255) NOT NULL,
    ContactInformation VARCHAR(255) NOT NULL,
    Certifications TEXT,
    ComplianceStatus BOOLEAN NOT NULL,
    PerformanceRating FLOAT DEFAULT 0 CHECK (PerformanceRating BETWEEN 0 AND 5)
);

CREATE TABLE Contract (
    ContractID INT AUTO_INCREMENT PRIMARY KEY,
    VendorID INT NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Terms TEXT NOT NULL,
    SpecialClauses TEXT,
    RenewalStatus BOOLEAN DEFAULT FALSE,
    RenewalNotificationDate DATE,
    FOREIGN KEY (VendorID) REFERENCES Vendor(VendorID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Department (
    DepartmentID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL UNIQUE,
    AllocatedBudget DECIMAL(10, 2) NOT NULL CHECK (AllocatedBudget >= 0),
    RemainingBudget DECIMAL(10, 2) NOT NULL CHECK (RemainingBudget >= 0)
);

CREATE TABLE PurchaseOrder (
    POID INT AUTO_INCREMENT PRIMARY KEY,
    DepartmentID INT NOT NULL,
    VendorID INT NOT NULL,
    ItemDetails TEXT NOT NULL,
    Quantity INT NOT NULL CHECK (Quantity > 0),
    TotalCost DECIMAL(10, 2) NOT NULL CHECK (TotalCost > 0),
    POStatus VARCHAR(50) DEFAULT 'Pending',
    FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (VendorID) REFERENCES Vendor(VendorID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Budget (
    BudgetID INT AUTO_INCREMENT PRIMARY KEY,
    DepartmentID INT NOT NULL UNIQUE,
    AllocatedBudget DECIMAL(10, 2) NOT NULL CHECK (AllocatedBudget >= 0),
    Expenses DECIMAL(10, 2) DEFAULT 0 CHECK (Expenses >= 0),
    RemainingBudget DECIMAL(10, 2) AS (AllocatedBudget - Expenses) STORED,
    FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE VendorPerformance (
    EvaluationID INT AUTO_INCREMENT PRIMARY KEY,
    VendorID INT NOT NULL,
    QualityRating FLOAT CHECK (QualityRating BETWEEN 0 AND 5),
    TimelinessRating FLOAT CHECK (TimelinessRating BETWEEN 0 AND 5),
    Feedback TEXT,
    FOREIGN KEY (VendorID) REFERENCES Vendor(VendorID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE User (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Role ENUM('Admin', 'ProcurementManager', 'DepartmentHead') NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    DepartmentID INT,
    FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID)
        ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE Notifications (
    NotificationID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    Message VARCHAR(255) NOT NULL,
    DateTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Unread', 'Read') DEFAULT 'Unread',
    Type ENUM('Contract Renewal', 'Budget Breach', 'Task Due', 'Pending PO') NOT NULL
);

CREATE TABLE AuditLogs (
    LogID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NULL,
    Action VARCHAR(255) NOT NULL,
    ActionDateTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    Description TEXT,
    FOREIGN KEY (UserID) REFERENCES User(UserID)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE Permissions (
    PermissionID INT AUTO_INCREMENT PRIMARY KEY,
    PermissionName VARCHAR(255) NOT NULL UNIQUE,
    Description TEXT
);

CREATE TABLE RolePermissions (
    Role ENUM('Admin', 'ProcurementManager', 'DepartmentHead') NOT NULL,
    PermissionID INT NOT NULL,
    PRIMARY KEY (Role, PermissionID),
    FOREIGN KEY (PermissionID) REFERENCES Permissions(PermissionID)
        ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE SystemSettings (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    SettingName VARCHAR(255) NOT NULL,
    SettingValue VARCHAR(255) NOT NULL,
    Description TEXT
);

CREATE TABLE Task (
    TaskID INT AUTO_INCREMENT PRIMARY KEY,
    AssignedTo INT NOT NULL,            -- User to whom the task is assigned
    TaskDescription TEXT NOT NULL,      -- Description of the task
    DueDate DATE NOT NULL,              -- Due date of the task
    Status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending', -- Task status
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP, -- Task creation timestamp
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Task update timestamp
    FOREIGN KEY (AssignedTo) REFERENCES User(UserID) ON DELETE CASCADE ON UPDATE CASCADE -- Link to users table
);

CREATE TABLE PurchaseOrderAudit (
    AuditID INT AUTO_INCREMENT PRIMARY KEY,
    POID INT NOT NULL,
    ChangedBy INT NULL,
    ChangeDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    ChangeDescription TEXT NOT NULL,
    FOREIGN KEY (POID) REFERENCES PurchaseOrder(POID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ChangedBy) REFERENCES User(UserID)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- Add Indices
CREATE INDEX idx_vendor_name ON Vendor(Name);
CREATE INDEX idx_department_name ON Department(Name);
CREATE INDEX idx_purchase_order_status ON PurchaseOrder(POStatus);
CREATE INDEX idx_contract_renewal_date ON Contract(RenewalNotificationDate);

-- Triggers
DELIMITER //

CREATE TRIGGER ContractRenewalNotification
AFTER INSERT ON Contract
FOR EACH ROW
BEGIN
    IF DATEDIFF(NEW.EndDate, CURDATE()) <= 30 THEN
        INSERT INTO Notifications (ContractID, NotificationType, NotificationDate, NotificationStatus)
        VALUES (NEW.ContractID, 'Renewal', CURDATE(), FALSE);
    END IF;
END;
//

CREATE TRIGGER PurchaseOrderBudgetCheck
BEFORE INSERT ON PurchaseOrder
FOR EACH ROW
BEGIN
    DECLARE remaining_budget DECIMAL(10, 2);
    SELECT RemainingBudget INTO remaining_budget
    FROM Department WHERE DepartmentID = NEW.DepartmentID;

    IF NEW.TotalCost > remaining_budget THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Purchase Order exceeds the department budget!';
    END IF;
END;
//

CREATE TRIGGER UpdateVendorPerformance
AFTER INSERT ON VendorPerformance
FOR EACH ROW
BEGIN
    DECLARE avg_performance FLOAT;
    SELECT AVG((QualityRating + TimelinessRating) / 2)
    INTO avg_performance
    FROM VendorPerformance
    WHERE VendorID = NEW.VendorID;

    UPDATE Vendor
    SET PerformanceRating = avg_performance
    WHERE VendorID = NEW.VendorID;
END;
//

DELIMITER ;

-- Stored Procedures
DELIMITER //

CREATE PROCEDURE RegisterVendor(
    IN vendorName VARCHAR(255),
    IN serviceCategory VARCHAR(255),
    IN contactInfo VARCHAR(255),
    IN certifications TEXT,
    IN complianceStatus BOOLEAN
)
BEGIN
    IF EXISTS (SELECT * FROM Vendor WHERE Name = vendorName) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Vendor with this name already exists!';
    ELSE
        INSERT INTO Vendor (Name, ServiceCategory, ContactInformation, Certifications, ComplianceStatus, PerformanceRating)
        VALUES (vendorName, serviceCategory, contactInfo, certifications, complianceStatus, 0);
    END IF;
END;
//

CREATE PROCEDURE RenewContract(
    IN contractID INT,
    IN newEndDate DATE,
    IN renewalNotificationDate DATE
)
BEGIN
    IF NOT EXISTS (SELECT * FROM Contract WHERE ContractID = contractID AND RenewalStatus = FALSE) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Contract does not exist or is already renewed!';
    ELSE
        UPDATE Contract
        SET EndDate = newEndDate,
            RenewalStatus = TRUE,
            RenewalNotificationDate = renewalNotificationDate
        WHERE ContractID = contractID;
    END IF;
END;
//

CREATE PROCEDURE GetVendorPerformanceReport(
    IN vendorID INT
)
BEGIN
    SELECT 
        VendorID,
        AVG(QualityRating) AS AverageQualityRating,
        AVG(TimelinessRating) AS AverageTimelinessRating,
        COUNT(*) AS TotalEvaluations
    FROM VendorPerformance
    WHERE VendorID = vendorID
    GROUP BY VendorID;
END;
//

CREATE PROCEDURE GetDepartmentBudgetReport(
    IN departmentID INT
)
BEGIN
    SELECT 
        DepartmentID,
        AllocatedBudget,
        Expenses,
        RemainingBudget
    FROM Budget
    WHERE DepartmentID = departmentID;
END;
//

DELIMITER ;




