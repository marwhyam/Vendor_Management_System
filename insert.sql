-- Insert 20 Vendor records (Make sure Vendor table has data before inserting into Contract)
INSERT INTO Vendor (Name, ServiceCategory, ContactInformation, Certifications, ComplianceStatus)
VALUES 
('Vendor A', 'IT Services', 'vendorA@example.com', 'ISO Certified', TRUE),
('Vendor B', 'Stationery Supplier', 'vendorB@example.com', 'ISO Certified', TRUE),
('Vendor C', 'Consulting', 'vendorC@example.com', 'ISO Certified', TRUE),
('Vendor D', 'Security Services', 'vendorD@example.com', 'Government Certified', TRUE),
('Vendor E', 'Software Development', 'vendorE@example.com', 'ISO Certified', TRUE),
('Vendor F', 'Logistics', 'vendorF@example.com', 'ISO Certified', TRUE),
('Vendor G', 'Cleaning Services', 'vendorG@example.com', 'ISO Certified', TRUE),
('Vendor H', 'Catering', 'vendorH@example.com', 'ISO Certified', TRUE),
('Vendor I', 'Office Equipment', 'vendorI@example.com', 'Government Certified', TRUE),
('Vendor J', 'Advertising', 'vendorJ@example.com', 'ISO Certified', TRUE),
('Vendor K', 'Consulting', 'vendorK@example.com', 'ISO Certified', TRUE),
('Vendor L', 'Medical Supplies', 'vendorL@example.com', 'ISO Certified', TRUE),
('Vendor M', 'Recruitment', 'vendorM@example.com', 'ISO Certified', TRUE),
('Vendor N', 'Construction', 'vendorN@example.com', 'ISO Certified', TRUE),
('Vendor O', 'Electrical', 'vendorO@example.com', 'ISO Certified', TRUE),
('Vendor P', 'IT Support', 'vendorP@example.com', 'ISO Certified', TRUE),
('Vendor Q', 'Stationery Supplier', 'vendorQ@example.com', 'ISO Certified', TRUE),
('Vendor R', 'Training', 'vendorR@example.com', 'ISO Certified', TRUE),
('Vendor S', 'Health Services', 'vendorS@example.com', 'ISO Certified', TRUE);

-- Insert data into Contract table
INSERT INTO Contract (VendorID, StartDate, EndDate, Terms, SpecialClauses, RenewalStatus, RenewalNotificationDate)
VALUES 
(1, '2022-01-01', '2023-01-01', '1 year contract', 'Annual review', FALSE, '2022-12-01'),
(2, '2022-02-01', '2023-02-01', '2 year contract', 'Bi-annual review', TRUE, '2022-12-15'),
(3, '2022-03-01', '2023-03-01', '1 year contract', 'Annual review', FALSE, '2022-02-01'),
(4, '2022-04-01', '2023-04-01', '3 year contract', 'Quarterly review', TRUE, '2022-03-15'),
(5, '2022-05-01', '2023-05-01', '1 year contract', 'Annual review', FALSE, '2022-04-01'),
(6, '2022-06-01', '2023-06-01', '1 year contract', 'Bi-annual review', TRUE, '2022-05-01'),
(7, '2022-07-01', '2023-07-01', '3 year contract', 'Annual review', FALSE, '2022-06-01'),
(8, '2022-08-01', '2023-08-01', '2 year contract', 'Quarterly review', TRUE, '2022-07-01'),
(9, '2022-09-01', '2023-09-01', '1 year contract', 'Bi-annual review', FALSE, '2022-08-01'),
(10, '2022-10-01', '2023-10-01', '1 year contract', 'Annual review', TRUE, '2022-09-01'),
(11, '2022-11-01', '2023-11-01', '2 year contract', 'Quarterly review', FALSE, '2022-10-01'),
(12, '2022-12-01', '2023-12-01', '1 year contract', 'Annual review', TRUE, '2022-11-01'),
(13, '2023-01-01', '2024-01-01', '3 year contract', 'Bi-annual review', FALSE, '2023-01-15'),
(14, '2023-02-01', '2024-02-01', '1 year contract', 'Quarterly review', TRUE, '2023-02-15'),
(15, '2023-03-01', '2024-03-01', '1 year contract', 'Annual review', TRUE, '2023-03-15'),
(16, '2023-04-01', '2024-04-01', '2 year contract', 'Bi-annual review', FALSE, '2023-04-01'),
(17, '2023-05-01', '2024-05-01', '3 year contract', 'Quarterly review', TRUE, '2023-05-15'),
(18, '2023-06-01', '2024-06-01', '1 year contract', 'Annual review', FALSE, '2023-06-01'),
(19, '2023-07-01', '2024-07-01', '1 year contract', 'Bi-annual review', TRUE, '2023-07-01');



-- Insert data into Department table
INSERT INTO Department (Name, AllocatedBudget, RemainingBudget)
VALUES 
('HR Department', 10000.00, 8000.00),
('Finance Department', 20000.00, 18000.00),
('IT Department', 15000.00, 12000.00),
('Marketing Department', 8000.00, 6000.00),
('Sales Department', 12000.00, 10000.00),
('Customer Service Department', 9000.00, 7000.00),
('Legal Department', 5000.00, 4000.00),
('Operations Department', 7000.00, 6000.00),
('R&D Department', 16000.00, 14000.00),
('Product Development Department', 11000.00, 9000.00),
('Logistics Department', 12000.00, 10000.00),
('Procurement Department', 13000.00, 11000.00),
('Business Development Department', 14000.00, 13000.00),
('Executive Department', 25000.00, 20000.00),
('Corporate Affairs Department', 6000.00, 5000.00),
('Compliance Department', 5000.00, 4500.00),
('Security Department', 4000.00, 3000.00),
('IT Support Department', 8000.00, 7000.00),
('Strategy Department', 20000.00, 18000.00);
-- Insert data into PurchaseOrder table (with lower costs to fit within the budget)
INSERT INTO PurchaseOrder (DepartmentID, VendorID, ItemDetails, Quantity, TotalCost, POStatus)
VALUES 
(1, 1, 'Laptops', 5, 2500.00, 'Pending'),  -- Total cost within budget
(2, 2, 'Office Chairs', 5, 500.00, 'Approved'),  -- Total cost within budget
(3, 3, 'Consulting Services', 3, 1200.00, 'Pending'),  -- Total cost within budget
(4, 4, 'Security Systems', 1, 2000.00, 'Approved'),  -- Total cost within budget
(5, 5, 'Software Development', 1, 2500.00, 'Pending'),  -- Total cost within budget
(6, 6, 'Logistics Services', 1, 2500.00, 'Approved'),  -- Total cost within budget
(7, 7, 'Cleaning Supplies', 2, 1000.00, 'Pending'),  -- Total cost within budget
(8, 8, 'Catering Services', 3, 900.00, 'Approved'),  -- Total cost within budget
(9, 9, 'Office Equipment', 5, 2500.00, 'Pending'),  -- Total cost within budget
(10, 10, 'Advertising Materials', 5, 1500.00, 'Approved'),  -- Total cost within budget
(11, 11, 'Medical Supplies', 5, 2000.00, 'Pending'),  -- Total cost within budget
(12, 12, 'Recruitment Services', 5, 1500.00, 'Approved'),  -- Total cost within budget
(13, 13, 'Construction Materials', 5, 2000.00, 'Pending'),  -- Total cost within budget
(14, 14, 'Electrical Equipment', 2, 1000.00, 'Approved'),  -- Total cost within budget
(15, 15, 'IT Support', 5, 2500.00, 'Pending'),  -- Total cost within budget
(16, 16, 'Stationery Supplies', 10, 500.00, 'Approved'),  -- Total cost within budget
(17, 17, 'Training Programs', 5, 1000.00, 'Pending'),  -- Total cost within budget
(18, 18, 'Health Equipment', 5, 1500.00, 'Approved'),  -- Total cost within budget
(19, 19, 'Management Consulting', 2, 2000.00, 'Pending');  -- Total cost within budget


-- Insert data into Budget table (Using department IDs and allocating budget correctly)
INSERT INTO Budget (DepartmentID, AllocatedBudget, Expenses)
VALUES
(1, 10000.00, 2000.00),
(2, 20000.00, 2000.00),
(3, 15000.00, 3000.00),
(4, 8000.00, 1500.00),
(5, 12000.00, 2500.00),
(6, 9000.00, 1500.00),
(7, 5000.00, 500.00),
(8, 7000.00, 1000.00),
(9, 16000.00, 2000.00),
(10, 11000.00, 3000.00),
(11, 12000.00, 2500.00),
(12, 13000.00, 1000.00),
(13, 14000.00, 3000.00),
(14, 25000.00, 2000.00),
(15, 6000.00, 1000.00),
(16, 5000.00, 500.00),
(17, 4000.00, 1000.00),
(18, 8000.00, 2000.00),
(19, 20000.00, 5000.00);

ALTER TABLE VendorPerformance AUTO_INCREMENT = 1;

-- Insert data into VendorPerformance table (using VendorIDs for evaluation)
INSERT INTO VendorPerformance (VendorID, QualityRating, TimelinessRating, Feedback)
VALUES
(1, 4.5, 4.0, 'Good performance overall'),
(2, 3.5, 4.0, 'Timely but quality could improve'),
(3, 4.0, 4.0, 'Excellent consulting service'),
(4, 4.2, 3.8, 'Security systems delivered well'),
(5, 4.8, 4.5, 'Outstanding software development'),
(6, 3.8, 4.2, 'Logistics services are reliable'),
(7, 3.9, 3.7, 'Cleaning services are satisfactory'),
(8, 4.1, 4.0, 'Catering was top-notch'),
(9, 3.5, 3.9, 'Office equipment was on time, some damages'),
(10, 4.3, 4.2, 'Good advertising materials provided'),
(11, 3.8, 4.0, 'Medical supplies delivered well'),
(12, 4.2, 3.9, 'Recruitment services were quick'),
(13, 4.0, 4.3, 'Construction materials were excellent'),
(14, 4.1, 4.0, 'Electrical equipment provided met expectations'),
(15, 4.5, 4.0, 'IT support was timely and efficient'),
(16, 4.3, 3.8, 'Stationery supplies were adequate'),
(17, 4.2, 4.0, 'Training programs delivered well'),
(18, 4.4, 4.1, 'Health equipment met standards'),
(19, 3.9, 4.0, 'Management consulting performed well');


-- Insert data into User table (linking to departments)
INSERT INTO User (Name, Role, Email, Password, DepartmentID)
VALUES
('John Doe', 'Admin', 'john.doe@example.com', 'john123', 1),
('Jane Smith', 'ProcurementManager', 'jane.smith@example.com', 'jane123', 2),
('Alice Brown', 'DepartmentHead', 'alice.brown@example.com', 'alice123', 3),
('Bob White', 'Admin', 'bob.white@example.com', 'bob123', 4),
('Charlie Green', 'ProcurementManager', 'charlie.green@example.com', 'charlie123', 5),
('Diana Blue', 'DepartmentHead', 'diana.blue@example.com', 'diana123', 6),
('Edward Black', 'Admin', 'edward.black@example.com', 'edward123', 7),
('Fay White', 'ProcurementManager', 'fay.white@example.com', 'fay123', 8),
('George Grey', 'DepartmentHead', 'george.grey@example.com', 'george123', 9),
('Helen Red', 'Admin', 'helen.red@example.com', 'helen123', 10),
('Iris Pink', 'ProcurementManager', 'iris.pink@example.com', 'iris123', 11),
('Jack Yellow', 'DepartmentHead', 'jack.yellow@example.com', 'jack123', 12),
('Karen Purple', 'Admin', 'karen.purple@example.com', 'karen123', 13),
('Larry Orange', 'ProcurementManager', 'larry.orange@example.com', 'larry123', 14),
('Mona Cyan', 'DepartmentHead', 'mona.cyan@example.com', 'mona123', 15),
('Nina Teal', 'Admin', 'nina.teal@example.com', 'nina123', 16),
('Oscar Violet', 'ProcurementManager', 'oscar.violet@example.com', 'oscar123', 17),
('Paul Brown', 'DepartmentHead', 'paul.brown@example.com', 'paul123', 18),
('Quincy Indigo', 'Admin', 'quincy.indigo@example.com', 'quincy123', 19);


INSERT INTO Notifications (UserID, Message, Type)
VALUES 
(1, 'Contract ID 101 is expiring on 2024-12-20.', 'Contract Renewal'),
(2, 'Purchase Order ID 301 is pending approval.', 'Pending PO'),
(3, 'Task ID 401 is overdue.', 'Task Due');



-- Insert data into Permissions table
INSERT INTO Permissions (PermissionName, Description)
VALUES
('Create Contract', 'Allows user to create new contracts'),
('Approve Purchase Order', 'Allows user to approve purchase orders'),
('Modify User', 'Allows user to modify user information'),
('View Budget', 'Allows user to view department budgets');


-- Insert data into RolePermissions table
INSERT INTO RolePermissions (Role, PermissionID)
VALUES
('Admin', 1),
('ProcurementManager', 2),
('DepartmentHead', 3),
('Admin', 4);

-- Insert data into PurchaseOrderAudit table
INSERT INTO PurchaseOrderAudit (POID, ChangedBy, ChangeDescription)
VALUES
(1, 1, 'Purchase order created for laptops'),
(2, 2, 'Purchase order approved for office chairs'),
(3, 3, 'Purchase order for consulting services modified'),
(4, 4, 'Security systems purchase order approved'),
(5, 5, 'Software development purchase order created');
-- Inserting tasks manually into the Task table

INSERT INTO Task (AssignedTo, TaskDescription, DueDate, Status)
VALUES (1, 'Review budget allocation for the new project', '2024-12-05', 'Pending');

INSERT INTO Task (AssignedTo, TaskDescription, DueDate, Status)
VALUES (2, 'Check vendor contract renewal status', '2024-12-10', 'Pending');

INSERT INTO Task (AssignedTo, TaskDescription, DueDate, Status)
VALUES (3, 'Analyze performance of vendors from last quarter', '2024-12-15', 'Pending');

INSERT INTO Task (AssignedTo, TaskDescription, DueDate, Status)
VALUES (4, 'Approve purchase order for office supplies', '2024-12-07', 'Approved');

INSERT INTO Task (AssignedTo, TaskDescription, DueDate, Status)
VALUES (5, 'Update vendor compliance documentation', '2024-12-20', 'Pending');

INSERT INTO Task (AssignedTo, TaskDescription, DueDate, Status)
VALUES (6, 'Prepare vendor performance report for last quarter', '2024-12-12', 'Pending');

INSERT INTO Task (AssignedTo, TaskDescription, DueDate, Status)
VALUES (1, 'Schedule quarterly review meeting with top vendors', '2024-12-25', 'Pending');

INSERT INTO Task (AssignedTo, TaskDescription, DueDate, Status)
VALUES (2, 'Prepare annual budget forecast for next fiscal year', '2024-12-30', 'Pending');

INSERT INTO Task (AssignedTo, TaskDescription, DueDate, Status)
VALUES (3, 'Assess vendor compliance with new regulations', '2024-12-20', 'Pending');

INSERT INTO Task (AssignedTo, TaskDescription, DueDate, Status)
VALUES (4, 'Send renewal notices to vendors with expiring contracts', '2024-12-08', TRIM('Completed'));

-- Insert sample data into the table
INSERT INTO SystemSettings (SettingName, SettingValue, Description) VALUES
('ShowNotifications', 'true', 'Enable or disable notifications for users'),
('ShowVisualizations', 'true', 'Toggle the visibility of all visualizations on the dashboard'),
('ThemePreference', 'light', 'Set the default theme for the user interface (light/dark)'),
('AutoLogoutMinutes', '15', 'Number of inactive minutes before auto-logout');
