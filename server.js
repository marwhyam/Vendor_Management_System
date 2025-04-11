const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const db = require('./db');

const app = express();
const SECRET_KEY = 'your_secret_key'; // Replace with a secure secret key

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));
//const { checkPermission } = require('./middleware/permissions');

// Audit Logging Function
function logAction(userID, action, description) {
    console.log('logAction called with:', { userID, action, description });

    const sql = 'INSERT INTO AuditLogs (UserID, Action, Description) VALUES (?, ?, ?)';
    db.query(sql, [userID || null, action, description], (err) => {
        if (err) {
            console.error('Error logging action:', err);
        } else {
            console.log('Action logged successfully.');
        }
    });
}

// Example: Budget Monitoring (Procurement Manager Only)
app.get('/api/budget', (req, res) => {
    const sql = `SELECT * FROM Budget`;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching budgets:', err);
            return res.status(500).send('Error fetching budgets.');
        }
        res.json(results);
    });
});


// Login API
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send('Email and Password are required.');
    }

    const sql = `SELECT * FROM User WHERE Email = ? AND Password = ?`;
    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error('Database error during login:', err.message);
            return res.status(500).send(`Error logging in: ${err.message}`);
        }
        if (results.length === 0) {
            return res.status(401).send('Invalid email or password.');
        }
        const user = results[0];
        res.status(200).json({ role: user.Role, userID: user.UserID });
    });
});



// Signup API
app.post('/api/signup', (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
        return res.status(400).send('All fields are required.');
    }

    const checkUserQuery = `SELECT * FROM User WHERE Email = ?`;
    db.query(checkUserQuery, [email], (err, results) => {
        if (err) return res.status(500).send('Database error.');

        if (results.length > 0) {
            return res.status(409).send('User already exists.');
        }

        const insertUserQuery = `INSERT INTO User (Name, Email, Password, Role) VALUES (?, ?, ?, ?)`;
        db.query(insertUserQuery, [name, email, password, role], (err) => {
            if (err) return res.status(500).send('Error saving user.');
            res.status(201).send('User registered successfully.');
        });
    });
});

// Vendor Management APIs
app.get('/api/vendor', (req, res) => {
    const sql = `SELECT VendorID, Name, ServiceCategory, ContactInformation, Certifications, ComplianceStatus, PerformanceRating FROM Vendor`;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching vendors:', err);
            return res.status(500).send('Error fetching vendors.');
        }
        res.json(results);
    });
});

app.get('/api/vendor/:id', (req, res) => {
    const vendorID = req.params.id;
    const sql = 'SELECT * FROM Vendor WHERE VendorID = ?';
    db.query(sql, [vendorID], (err, result) => {
        if (err) return res.status(500).send('Error fetching vendor');
        if (result.length === 0) return res.status(404).send('Vendor not found');
        res.status(200).json(result[0]);
    });
});


app.post('/api/vendor/register', (req, res) => {
    const { Name, ServiceCategory, ContactInformation, Certifications, ComplianceStatus } = req.body;
    logAction(req.body.adminID, 'Created User', `Added user: ${req.body.name}`);

    if (!Name || !ServiceCategory || !ContactInformation) {
        return res.status(400).send('Missing required fields.');
    }

    const sql = `INSERT INTO Vendor (Name, ServiceCategory, ContactInformation, Certifications, ComplianceStatus) 
                 VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [Name, ServiceCategory, ContactInformation, Certifications || '', ComplianceStatus], (err) => {
        if (err) {
            console.error('Error registering vendor:', err);
            return res.status(500).send('Error registering vendor.');
        }
        res.send('Vendor registered successfully.');
    });
});

app.put('/api/vendor', (req, res) => {
    const { VendorID, Name, ServiceCategory, ContactInformation, Certifications, ComplianceStatus, PerformanceRating } = req.body;
    logAction(req.body.userID, 'Updated Vendor', `Updated Vendor ID: ${req.body.VendorID}`);

    if (!VendorID || !Name || !ServiceCategory || !ContactInformation) {
        return res.status(400).send('Vendor ID, Name, Service Category, and Contact Information are required.');
    }

    const sql = `
        UPDATE Vendor
        SET Name = ?, ServiceCategory = ?, ContactInformation = ?, Certifications = ?, ComplianceStatus = ?, PerformanceRating = ?
        WHERE VendorID = ?
    `;
    db.query(sql, [Name, ServiceCategory, ContactInformation, Certifications, ComplianceStatus, PerformanceRating, VendorID], (err, results) => {
        if (err) {
            console.error('Error updating vendor:', err);
            return res.status(500).send('Error updating vendor.');
        }
        if (results.affectedRows === 0) {
            return res.status(404).send('Vendor not found.');
        }
        res.status(200).send('Vendor updated successfully.');
    });
});
app.post('/api/vendor', (req, res) => {
    const { Name, ServiceCategory, ContactInformation, Certifications, ComplianceStatus } = req.body;
    logAction(req.body.userID, 'Created Vendor', `Vendor Name: ${req.body.Name}`);

    if (!Name || !ServiceCategory || !ContactInformation) {
        return res.status(400).send('Name, Service Category, and Contact Information are required.');
    }

    const sql = `
        INSERT INTO Vendor (Name, ServiceCategory, ContactInformation, Certifications, ComplianceStatus)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(sql, [Name, ServiceCategory, ContactInformation, Certifications || '', ComplianceStatus || 0], (err) => {
        if (err) {
            console.error('Error registering vendor:', err);
            return res.status(500).send('Error registering vendor.');
        }
        res.status(201).send('Vendor registered successfully.');
    });
});



app.delete('/api/vendor/:VendorID', (req, res) => {
    const { VendorID } = req.params;
    const sql = `DELETE FROM Vendor WHERE VendorID = ?`;
    logAction(req.body.userID, 'Deleted Vendor', `Deleted Vendor ID: ${req.params.VendorID}`);

    db.query(sql, [VendorID], (err, results) => {
        if (err) return res.status(500).send('Error deleting vendor.');
        if (results.affectedRows === 0) return res.status(404).send('Vendor not found.');
        res.send('Vendor deleted successfully.');
    });
});

// Budget Tracking API
app.post('/api/budget', (req, res) => {
    const { departmentID } = req.body;

    if (!departmentID) return res.status(400).send('Department ID is required.');

    const sql = `SELECT DepartmentID, AllocatedBudget, Expenses, RemainingBudget 
                 FROM Budget WHERE DepartmentID = ?`;
    db.query(sql, [departmentID], (err, results) => {
        if (err) return res.status(500).send('Error fetching budget.');
        if (results.length === 0) return res.status(404).send('No budget found for the given Department ID.');
        res.json(results[0]);
    });
});
app.put('/api/vendor/rating', (req, res) => {
    const { id, performanceRating } = req.body;

    // Validate input
    if (!id || performanceRating === undefined || isNaN(performanceRating)) {
        console.error('Invalid input:', req.body);
        return res.status(400).send('Vendor ID and Performance Rating are required.');
    }

    console.log('Updating Performance Rating:', { id, performanceRating }); // Debug log

    const sql = 'UPDATE Vendor SET PerformanceRating = ? WHERE VendorID = ?';
    db.query(sql, [performanceRating, id], (err, results) => {
        if (err) {
            console.error('Error updating rating:', err);
            return res.status(500).send('Error updating rating.');
        }

        if (results.affectedRows === 0) {
            console.warn('No vendor found with ID:', id);
            return res.status(404).send('Vendor not found.');
        }

        console.log('Performance rating updated successfully for Vendor ID:', id);
        res.status(200).send('Performance rating updated successfully.');
        console.log('Incoming data:', req.body);

    });
});

// Approve a purchase order
app.put('/api/purchase-orders/:id/approve', (req, res) => {
    const poID = req.params.id;
    logAction(req.body.userID, 'Approved Purchase Order', `Purchase Order ID: ${req.params.id}`);

    const sql = `UPDATE PurchaseOrder SET POStatus = 'Approved' WHERE POID = ?`;
    db.query(sql, [poID], (err, result) => {
        if (err) {
            console.error('Error approving purchase order:', err);
            return res.status(500).send('Failed to approve purchase order.');
        }
        res.status(200).send('Purchase order approved successfully.');
    });
});

// Reject a purchase order
app.put('/api/purchase-orders/:id/reject', (req, res) => {
    const poID = req.params.id;
    logAction(req.body.userID, 'Rejected Purchase Order', `Purchase Order ID: ${req.params.id}`);

    const sql = `UPDATE PurchaseOrder SET POStatus = 'Rejected' WHERE POID = ?`;
    db.query(sql, [poID], (err, result) => {
        if (err) {
            console.error('Error rejecting purchase order:', err);
            return res.status(500).send('Failed to reject purchase order.');
        }
        res.status(200).send('Purchase order rejected successfully.');
    });
});





// Contract Management APIs

// Add a new contract
app.get('/api/contract/:id', (req, res) => {
    const contractID = req.params.id;
    logAction(req.body.userID, 'Created Contract', `Vendor ID: ${req.body.VendorID}, Start Date: ${req.body.StartDate}`);

    const sql = 'SELECT * FROM Contract WHERE ContractID = ?';
    db.query(sql, [contractID], (err, results) => {
        if (err) {
            console.error('Error fetching contract details:', err);
            return res.status(500).send('Error fetching contract details.');
        }
        if (results.length === 0) {
            console.warn(`No contract found with ID: ${contractID}`);
            return res.status(404).send('Contract not found.');
        }
        res.status(200).json(results[0]);
    });
});

// Fetch all contracts or filter by VendorID
app.get('/api/contract', (req, res) => {
    const { VendorID } = req.query;

    let sql = `SELECT * FROM Contract`;
    const params = [];

    if (VendorID) {
        sql += ` WHERE VendorID = ?`;
        params.push(VendorID);
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error fetching contracts:', err);
            return res.status(500).send('Error fetching contracts.');
        }
        res.json(results);
    });
});
app.post('/api/contract', (req, res) => {
    const { VendorID, StartDate, EndDate, Terms, SpecialClauses } = req.body;
    logAction(req.body.userID, 'Created Contract', `Vendor ID: ${req.body.VendorID}, Start Date: ${req.body.StartDate}`);

    // Validate required fields
    if (!VendorID || !StartDate || !EndDate || !Terms) {
        return res.status(400).send('VendorID, StartDate, EndDate, and Terms are required.');
    }

    const sql = `
        INSERT INTO Contract (VendorID, StartDate, EndDate, Terms, SpecialClauses)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [VendorID, StartDate, EndDate, Terms, SpecialClauses || ''], (err, results) => {
        if (err) {
            console.error('Error creating contract:', err);
            return res.status(500).send('Error creating contract.');
        }

        res.status(201).send('Contract created successfully.');
    });
});

// Update an existing contract
app.put('/api/contract/:id', (req, res) => {
    const ContractID = req.params.id;
    const { StartDate, EndDate, Terms, SpecialClauses, RenewalStatus, RenewalNotificationDate } = req.body;
    logAction(req.body.userID, 'Updated Contract', `Contract ID: ${req.params.id}`);

    if (!ContractID || (!StartDate && !EndDate && !Terms && !SpecialClauses && RenewalStatus === undefined)) {
        return res.status(400).send('No fields provided for update.');
    }

    const sql = `UPDATE Contract 
                 SET StartDate = COALESCE(?, StartDate), 
                     EndDate = COALESCE(?, EndDate),
                     Terms = COALESCE(?, Terms),
                     SpecialClauses = COALESCE(?, SpecialClauses),
                     RenewalStatus = COALESCE(?, RenewalStatus),
                     RenewalNotificationDate = COALESCE(?, RenewalNotificationDate)
                 WHERE ContractID = ?`;

    db.query(sql, [StartDate, EndDate, Terms, SpecialClauses, RenewalStatus, RenewalNotificationDate, ContractID], (err, results) => {
        if (err) {
            console.error('Error updating contract:', err);
            return res.status(500).send('Error updating contract.');
        }

        if (results.affectedRows === 0) {
            return res.status(404).send('Contract not found.');
        }

        res.status(200).send('Contract updated successfully.');
    });
});

// Delete a contract
app.delete('/api/contract/:id', (req, res) => {
    const ContractID = req.params.id;
    logAction(req.body.userID, 'Deleted Contract', `Contract ID: ${req.params.id}`);

    if (!ContractID) {
        return res.status(400).send('Contract ID is required.');
    }

    const sql = `DELETE FROM Contract WHERE ContractID = ?`;

    db.query(sql, [ContractID], (err, results) => {
        if (err) {
            console.error('Error deleting contract:', err);
            return res.status(500).send('Error deleting contract.');
        }

        if (results.affectedRows === 0) {
            return res.status(404).send('Contract not found.');
        }

        res.status(200).send('Contract deleted successfully.');
    });
});




app.get('/api/department', (req, res) => {
    const sql = 'SELECT DepartmentID, Name, AllocatedBudget, RemainingBudget FROM Department';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching department budgets:', err); // Debug the error
            return res.status(500).send('Error fetching department budgets.');
        }
        console.log('Fetched Departments:', results); // Log fetched data
        res.json(results);
    });
});
app.get('/api/purchase-orders', (req, res) => {
    const sql = `
        SELECT POID, DepartmentID, VendorID, ItemDetails, Quantity, 
               CAST(TotalCost AS DECIMAL(10, 2)) AS TotalCost, POStatus
        FROM PurchaseOrder
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching purchase orders:', err);
            return res.status(500).send('Error fetching purchase orders.');
        }
        res.json(results);
    });
});



// Approve Purchase Order
app.put('/api/purchase-orders/:poID/approve', (req, res) => {
    const poID = req.params.poID;
    const sql = `UPDATE PurchaseOrder SET POStatus = 'Approved' WHERE POID = ?`;
    logAction(req.body.userID, 'Approved Purchase Order', `Purchase Order ID: ${req.params.id}`);

    db.query(sql, [poID], (err, results) => {
        if (err) {
            console.error('Error approving purchase order:', err);
            return res.status(500).send('Error approving purchase order.');
        }

        if (results.affectedRows === 0) {
            return res.status(404).send('Purchase order not found.');
        }

        res.send('Purchase order approved successfully.');
    });
});

// Reject Purchase Order
app.put('/api/purchase-orders/:poID/reject', (req, res) => {
    const poID = req.params.poID;
    const sql = `UPDATE PurchaseOrder SET POStatus = 'Rejected' WHERE POID = ?`;
    logAction(req.body.userID, 'Rejected Purchase Order', `Purchase Order ID: ${req.params.id}`);

    db.query(sql, [poID], (err, results) => {
        if (err) {
            console.error('Error rejecting purchase order:', err);
            return res.status(500).send('Error rejecting purchase order.');
        }

        if (results.affectedRows === 0) {
            return res.status(404).send('Purchase order not found.');
        }

        res.send('Purchase order rejected successfully.');
    });
});

// Export Department Budgets as CSV
app.get('/api/report/department-budgets', (req, res) => {
    const sql = `SELECT DepartmentID, Name AS DepartmentName, AllocatedBudget, RemainingBudget FROM Department`;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error generating report:', err);
            return res.status(500).send('Error generating report.');
        }

        const csvHeader = 'Department ID,Department Name,Allocated Budget,Remaining Budget\n';
        const csvRows = results.map(row =>
            `${row.DepartmentID},${row.DepartmentName},${row.AllocatedBudget},${row.RemainingBudget}`
        ).join('\n');

        const csvData = csvHeader + csvRows;
        res.header('Content-Type', 'text/csv');
        res.attachment('department_budgets_report.csv');
        res.send(csvData);
    });
});

// Filter Purchase Orders by Department or Vendor
app.get('/api/purchase-orders/filter', (req, res) => {
    const { departmentID, vendorID } = req.query;

    let sql = `SELECT * FROM PurchaseOrder WHERE 1 = 1`;
    const params = [];

    if (departmentID) {
        sql += ` AND DepartmentID = ?`;
        params.push(departmentID);
    }

    if (vendorID) {
        sql += ` AND VendorID = ?`;
        params.push(vendorID);
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error fetching filtered purchase orders:', err);
            return res.status(500).send('Error fetching purchase orders.');
        }

        res.json(results);
    });
});
// Endpoint: Vendor Performance Report
app.get('/api/reports/vendor-performance', (req, res) => {
    const sql = `
        SELECT 
            Vendor.VendorID,
            Vendor.Name AS VendorName,
            AVG(VendorPerformance.QualityRating) AS AverageQualityRating,
            AVG(VendorPerformance.TimelinessRating) AS AverageTimelinessRating,
            COUNT(VendorPerformance.EvaluationID) AS TotalEvaluations
        FROM Vendor
        LEFT JOIN VendorPerformance ON Vendor.VendorID = VendorPerformance.VendorID
        GROUP BY Vendor.VendorID
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error generating vendor performance report:', err);
            return res.status(500).send('Error generating report.');
        }

        res.json(results);
    });
});

// Endpoint: Procurement Report
app.get('/api/reports/procurement', (req, res) => {
    const sql = `
        SELECT 
            PurchaseOrder.POID,
            Department.Name AS DepartmentName,
            Vendor.Name AS VendorName,
            PurchaseOrder.ItemDetails,
            PurchaseOrder.Quantity,
            PurchaseOrder.TotalCost,
            PurchaseOrder.POStatus
        FROM PurchaseOrder
        JOIN Department ON PurchaseOrder.DepartmentID = Department.DepartmentID
        JOIN Vendor ON PurchaseOrder.VendorID = Vendor.VendorID
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error generating procurement report:', err);
            return res.status(500).send('Error generating report.');
        }

        res.json(results);
    });
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});







// Fetch Budget for Department Head
app.get('/api/department-head/budget', (req, res) => {
    const userID = req.query.userID; // Pass logged-in user's ID

    const sql = `
        SELECT d.DepartmentID, d.Name AS DepartmentName, d.AllocatedBudget, d.Expenses, d.RemainingBudget
        FROM Department d
        INNER JOIN User u ON u.DepartmentID = d.DepartmentID
        WHERE u.UserID = ?`;

    db.query(sql, [userID], (err, results) => {
        if (err) {
            console.error('Error fetching department budget:', err);
            return res.status(500).send('Error fetching department budget.');
        }
        res.json(results);
    });
});



app.get("/api/purchase-orders", (req, res) => {
    console.log("Fetching all purchase orders...");
    db.query("SELECT * FROM purchaseorders", (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send("Error fetching purchase orders.");
        }
        console.log("Purchase Orders:", results);
        res.json(results);
    });
});



app.post('/api/department-head/purchase-orders', (req, res) => {
    const { DepartmentID, VendorID, ItemDetails, Quantity, TotalCost } = req.body;
    logAction(req.body.userID, 'Created Purchase Order', `Department ID: ${req.body.DepartmentID}, Vendor ID: ${req.body.VendorID}`);

    if (!DepartmentID || !VendorID || !ItemDetails || !Quantity || !TotalCost) {
        return res.status(400).send('All fields are required to create a purchase order.');
    }

    const sql = `
        INSERT INTO PurchaseOrder 
        (DepartmentID, VendorID, ItemDetails, Quantity, TotalCost, POStatus) 
        VALUES (?, ?, ?, ?, ?, "Pending")
    `;

    db.query(sql, [DepartmentID, VendorID, ItemDetails, Quantity, TotalCost], (err) => {
        if (err) {
            console.error('Error creating purchase order:', err);
            return res.status(500).send('Error creating purchase order.');
        }

        res.status(201).send('Purchase order created successfully.');
    });
});


const dbPromise = db.promise(); // Create a promise-enabled connection
app.get('/api/task', (req, res) => {
    const sql = `SELECT * FROM Task`;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching tasks:", err);
            return res.status(500).send("Error fetching tasks.");
        }
        res.json(results);
    });
});


app.post('/api/task', (req, res) => {
    const { AssignedTo, Description, DueDate, Status } = req.body;
    logAction(req.body.userID, 'Created Task', `Task assigned to: ${req.body.AssignedTo}`);

    if (!AssignedTo || !Description || !DueDate || !Status) {
        return res.status(400).send("All fields are required.");
    }

    const sql = `INSERT INTO Task (AssignedTo, TaskDescription, DueDate, Status) VALUES (?, ?, ?, ?)`;
    db.query(sql, [AssignedTo, Description, DueDate, Status], (err) => {
        if (err) {
            console.error("Error creating task:", err);
            return res.status(500).send("Error creating task.");
        }
        res.status(201).send("Task created successfully.");
    });
});

// Update task status
app.put('/api/tasks/:taskID', (req, res) => {
    const { taskID } = req.params;
    const { Status } = req.body;
    logAction(req.body.userID, 'Updated Task Status', `Task ID: ${req.params.taskID}, New Status: ${req.body.Status}`);

    if (!Status) {
        return res.status(400).send('Status is required.');
    }

    const sql = `UPDATE Task SET Status = ? WHERE TaskID = ?`;
    db.query(sql, [Status, taskID], (err, result) => {
        if (err) {
            console.error('Error updating task:', err);
            return res.status(500).send('Error updating task.');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Task not found.');
        }
        res.send('Task updated successfully.');
    });
});

app.delete('/api/tasks/:taskID', (req, res) => {
    const { taskID } = req.params;
    const sql = `DELETE FROM Task WHERE TaskID = ?`;
    logAction(req.body.userID, 'Deleted Task', `Task ID: ${req.params.taskID}`);

    db.query(sql, [taskID], (err, result) => {
        if (err) {
            console.error('Error deleting task:', err);
            return res.status(500).send('Error deleting task.');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Task not found.');
        }
        res.send('Task deleted successfully.');
    });
});

// Fetch a specific task by TaskID
app.get('/api/tasks/:taskID', (req, res) => {
    const { taskID } = req.params;

    const sql = `SELECT * FROM Task WHERE TaskID = ?`;
    db.query(sql, [taskID], (err, result) => {
        if (err) {
            console.error('Error fetching task:', err);
            return res.status(500).send('Error fetching task.');
        }
        if (result.length === 0) {
            return res.status(404).send('Task not found.');
        }
        res.json(result[0]); // Return the first result as JSON
    });
});


// Temporary: Disable permission check for debugging
// app.use('/api/user', checkPermission('Admin', true));

// Add a new user
app.post('/api/user', (req, res) => {
    const { name, email, password, role, departmentID } = req.body;

    if (!name || !email || !password || !role || !departmentID) {
        return res.status(400).send('All fields are required.');
    }

    const sql = 'INSERT INTO User (Name, Email, Password, Role, DepartmentID) VALUES (?, ?, ?, ?, ?)';
    
    db.query(sql, [name, email, password, role, departmentID], (err) => {
        if (err) {
            console.error("Error inserting user:", err);
            return res.status(500).send('Error creating user.');
        }
        logAction(req.body.adminID, 'Added User', `Created user with Email: ${email}`);
        res.status(201).send('User created successfully.');
    });
});

// Get a specific user by ID
app.get('/api/user/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM User WHERE UserID = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send('Error fetching user.');
        }
        if (result.length === 0) {
            return res.status(404).send('User not found.');
        }
        res.json(result[0]);
    });
});

// Get all users
app.get('/api/user', (req, res) => {
    const sql = 'SELECT * FROM User';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).send('Error fetching users.');
        }
        res.json(results);
    });
});

// Update an existing user
app.put('/api/user/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, password, role, departmentID } = req.body;

    if (!name || !email || !role || !departmentID) {
        return res.status(400).send('Name, email, role, and department are required.');
    }

    const sql = `
        UPDATE User
        SET Name = ?, Email = ?, Role = ?, DepartmentID = ?,
            Password = COALESCE(?, Password) -- Update password only if provided
        WHERE UserID = ?
    `;

    db.query(sql, [name, email, role, departmentID, password || null, id], (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).send('Error updating user.');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('User not found.');
        }
        res.status(200).send('User updated successfully.');
    });
});

// Delete a user
app.delete('/api/user/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM User WHERE UserID = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).send('Error deleting user.');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('User not found.');
        }
        logAction(req.body.adminID, 'Deleted User', `Removed user with ID: ${id}`);
        res.status(200).send('User deleted successfully.');
    });
});




// Route to get all system settings
app.get('/api/system-settings', (req, res) => {
    const sql = 'SELECT * FROM SystemSettings';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching system settings:', err);
            return res.status(500).send('Error fetching system settings.');
        }
        res.json(results);
    });
});

// Route to update a system setting
app.put('/api/system-settings/:id', (req, res) => {
    const { id } = req.params;
    const { SettingValue } = req.body;
    logAction(req.body.adminID, 'Updated System Setting', `Setting ID: ${req.params.id}, New Value: ${req.body.SettingValue}`);

    if (!SettingValue) {
        return res.status(400).send('SettingValue is required.');
    }

    const sql = 'UPDATE SystemSettings SET SettingValue = ? WHERE ID = ?';
    db.query(sql, [SettingValue, id], (err) => {
        if (err) {
            console.error('Error updating system setting:', err);
            return res.status(500).send('Error updating system setting.');
        }
        res.send('System setting updated successfully.');

    });
});

// API to fetch all audit logs

app.get('/api/audit-logs', (req, res) => {
    console.log('API Endpoint /api/audit-logs called');

    const sql = `SELECT * FROM AuditLogs ORDER BY ActionDateTime ASC`;
    console.log('Executing SQL:', sql);

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching audit logs:', err);
            return res.status(500).send('Error fetching audit logs.');
        }
        console.log('Audit Logs Fetched:', results);
        res.json(results);
    });
});



 
 //Notifications API
app.get('/api/notifications', (req, res) => {
    console.log("Received request to fetch notifications");

    // SQL query to fetch notifications
    const contractQuery = `
        SELECT 'Contract Renewal' AS Type,
               CONCAT('Contract ID ', ContractID, ' is expiring on ', EndDate, '.') AS Message
        FROM Contract
        WHERE EndDate BETWEEN CURRENT_DATE AND DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY)
    `;

    const poQuery = `
        SELECT 'Pending PO' AS Type,
               CONCAT('Purchase Order ID ', POID, ' from Department ', DepartmentID, ' is pending approval.') AS Message
        FROM PurchaseOrder
        WHERE POStatus = 'Pending'
    `;

    const taskQuery = `
        SELECT 'Task Due' AS Type,
               CONCAT('Task ID ', TaskID, ' is overdue (Due Date: ', DueDate, ').') AS Message
        FROM Task
        WHERE DueDate < CURRENT_DATE AND Status != 'Completed'
    `;

    // Combine all notifications
    const combinedQuery = `
        (${contractQuery})
        UNION ALL
        (${poQuery})
        UNION ALL
        (${taskQuery})
    `;

    // Execute the combined query
    db.query(combinedQuery, (err, results) => {
        if (err) {
            console.error("Error fetching notifications:", err);
            return res.status(500).send("Error fetching notifications.");
        }

        console.log("Fetched Notifications:", results);
        res.json(results); // Return the fetched notifications
    });
});

// Middleware to check role permissions
function checkPermission(requiredRoles) {
    return (req, res, next) => {
        const userRole = req.session.userRole; // Assuming role is stored in session
        if (!requiredRoles.includes(userRole)) {
            return res.status(403).send("Permission Denied");
        }
        next();
    };
}

// Example route with role-based permission
app.get("/api/sensitive-data", checkPermission(["Admin"]), (req, res) => {
    res.send("Sensitive data only accessible to Admins.");
});


//visualizations
app.get('/reports/vendor-overall-performance', (req, res) => {
    console.log('API Request Received: /reports/vendor-overall-performance');

    // SQL query to calculate overall average ratings
    const sql = `
        SELECT 
            AVG(QualityRating) AS OverallQualityRating, 
            AVG(TimelinessRating) AS OverallTimelinessRating 
        FROM VendorPerformance
    `;

    console.log('Executing SQL Query:', sql);

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).send('Error fetching overall performance data.');
        }

        console.log('Query Results:', results);

        res.json(results[0]); // Return the first row
    });
});
//budget visualization
app.get('/reports/department-budget-utilization', (req, res) => {
    console.log('API Request Received: /reports/department-budget-utilization');

    const sql = `
        SELECT 
            d.Name AS DepartmentName, 
            b.AllocatedBudget, 
            b.Expenses
        FROM Budget b
        JOIN Department d ON b.DepartmentID = d.DepartmentID
    `;

    console.log('Executing SQL Query:', sql);

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching department budget data:', err);
            return res.status(500).send('Error fetching department budget data.');
        }

        console.log('Query Results:', results);
        res.json(results);
    });
});
// API Endpoint to get purchase order status counts
app.get('/reports/purchase-order-status', (req, res) => {
    console.log('API Request Received: /reports/purchase-order-status');

    // SQL query to count purchase orders by status
    const sql = `
        SELECT 
            POStatus, 
            COUNT(*) AS StatusCount 
        FROM PurchaseOrder 
        GROUP BY POStatus;
    `;

    console.log('Executing SQL Query:', sql);

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).send('Error fetching purchase order status data.');
        }

        console.log('Query Results:', results);

        res.json(results); // Send the results
    });
});

