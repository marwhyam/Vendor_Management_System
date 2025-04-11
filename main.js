const API_BASE_URL = "http://localhost:5000/api";

/* Login function to authenticate user and set role in session storage
async function login(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('userRole', data.role); // Store user role
        if (data.role === 'DepartmentHead') {
            sessionStorage.setItem('departmentID', data.departmentID); // Store department ID for Department Heads
        }
    
        const rolePages = {
            Admin: 'user-management.html',
            ProcurementManager: 'vendor-management.html',
            DepartmentHead: 'budget-tracking.html',
        };
    
        alert('Login successful! Redirecting to your dashboard.');
        window.location.href = rolePages[data.role] || 'dashboard.html';
    }
}   */
    async function login(event) {
        event.preventDefault();
    
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
    
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
    
            if (response.ok) {
                const data = await response.json();
                sessionStorage.setItem('userRole', data.role); // Store user role
                sessionStorage.setItem('userID', data.userID); // Store user ID
    
                const rolePages = {
                    Admin: 'user-management.html',
                    ProcurementManager: 'vendor-management.html',
                    DepartmentHead: 'budget-tracking.html',
                };
    
                alert('Login successful! Redirecting to your dashboard.');
    
                // Check for notifications if the role is Admin
                if (data.role === 'Admin') {
                    const notificationsResponse = await fetch(`${API_BASE_URL}/notifications`);
                    if (notificationsResponse.ok) {
                        const notifications = await notificationsResponse.json();
                        if (notifications.length > 0) {
                            alert('You have new notifications on Dashboard!');
                        }
                    }
                }
                window.location.href = rolePages[data.role] || 'dashboard.html';

            } else {
                const errorMessage = await response.text();
                alert(`Login failed: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred during login.');
        }
    }
    

// Signup Function
async function signup(event) {
    event.preventDefault();

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;

    const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
    });

    if (response.ok) {
        alert('Signup successful! You can now log in.');
        document.getElementById('signup-form').reset(); // Clear form
    } else {
        const errorMessage = await response.text();
        alert(`Signup failed: ${errorMessage}`);
    }
}

// Fetch Vendors
async function fetchVendors() {
    try {
        const response = await fetch(`${API_BASE_URL}/vendor`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const vendors = await response.json();
        console.log('Fetched vendors:', vendors); // Debugging log

        const tableBody = document.getElementById('vendorTable').querySelector('tbody');
        tableBody.innerHTML = ''; // Clear previous data

        vendors.forEach(vendor => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${vendor.VendorID}</td>
                <td>${vendor.Name}</td>
                <td>${vendor.ServiceCategory}</td>
                <td>${vendor.ContactInformation}</td>
                <td>${vendor.Certifications}</td>
                <td>${vendor.ComplianceStatus === 1 ? 'Yes' : 'No'}</td>
                <td>${vendor.PerformanceRating || 'N/A'}</td>
                <td>
                    <button onclick="editVendor(${vendor.VendorID})">Edit</button>
                    <button onclick="deleteVendor(${vendor.VendorID})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching vendors:', error);
    }
}

async function registerOrUpdateVendor(event) {
    event.preventDefault(); // Prevent form submission

    // Get input values from the form
    const vendorID = document.getElementById('vendorID').value;
    const name = document.getElementById('name').value.trim();
    const serviceCategory = document.getElementById('serviceCategory').value.trim();
    const contactInformation = document.getElementById('contactInformation').value.trim();
    const certifications = document.getElementById('certifications').value.trim();
    const complianceStatus = document.getElementById('complianceStatus').checked ? 1 : 0;
    const performanceRating = document.getElementById('performanceRating').value || null;

    // Input validation
    if (!name || !serviceCategory || !contactInformation) {
        alert('Name, Service Category, and Contact Information are required.');
        return;
    }

    // Determine HTTP method (POST for new vendor, PUT for updating an existing vendor)
    const method = vendorID ? 'PUT' : 'POST';
    const apiUrl = vendorID ? `${API_BASE_URL}/vendor` : `${API_BASE_URL}/vendor`;

    try {
        // Make API request to register or update the vendor
        const response = await fetch(apiUrl, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'role': sessionStorage.getItem('userRole'), // Ensure the user's role is sent in headers
            },
            body: JSON.stringify({
                VendorID: vendorID,
                Name: name,
                ServiceCategory: serviceCategory,
                ContactInformation: contactInformation,
                Certifications: certifications,
                ComplianceStatus: complianceStatus,
                PerformanceRating: performanceRating,
            }),
        });

        if (response.ok) {
            const message = vendorID ? 'Vendor updated successfully!' : 'Vendor registered successfully!';
            alert(message);
            fetchVendors(); // Refresh the vendor list
            document.getElementById('vendorForm').reset(); // Clear the form
        } else {
            // Handle server errors
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to save vendor');
        }
    } catch (error) {
        console.error('Error saving vendor:', error);
        alert(`Error saving vendor: ${error.message}`);
    }
}

// Edit Vendor
async function editVendor(vendorID) {
    try {
        const response = await fetch(`${API_BASE_URL}/vendor/${vendorID}`);
        if (!response.ok) {
            throw new Error('Failed to fetch vendor details.');
        }

        const vendor = await response.json();
        document.getElementById('vendorID').value = vendor.VendorID;
        document.getElementById('name').value = vendor.Name;
        document.getElementById('serviceCategory').value = vendor.ServiceCategory;
        document.getElementById('contactInformation').value = vendor.ContactInformation;
        document.getElementById('certifications').value = vendor.Certifications;
        document.getElementById('complianceStatus').checked = vendor.ComplianceStatus === 1;
        document.getElementById('performanceRating').value = vendor.PerformanceRating || '';
    } catch (error) {
        console.error('Error editing vendor:', error);
        alert('Failed to load vendor details for editing.');
    }
}

// Delete Vendor
async function deleteVendor(vendorID) {
    try {
        const response = await fetch(`${API_BASE_URL}/vendor/${vendorID}`, { method: 'DELETE' });
        if (response.ok) {
            alert('Vendor deleted successfully.');
            fetchVendors();
        } else {
            const error = await response.text();
            throw new Error(error);
        }
    } catch (error) {
        console.error('Error deleting vendor:', error);
        alert('Failed to delete vendor!');
    }
}
async function updatePerformanceRating(event) {
    event.preventDefault();

    const vendorID = document.getElementById('vendorPerformanceID').value;
    const performanceRating = parseFloat(document.getElementById('updatePerformanceRating').value);

    if (!vendorID || isNaN(performanceRating)) {
        alert('Please provide valid Vendor ID and Performance Rating.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/vendor/rating`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: vendorID, performanceRating }),
        });

        if (response.ok) {
            alert('Performance rating updated successfully!');
            fetchVendors(); // Refresh vendor list
        } else {
            const errorMessage = await response.text();
            console.error('Failed to update performance rating:', errorMessage);
            alert('Failed to update performance rating.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An unexpected error occurred.');
    }
}





// Search and Filter Vendors
function filterVendors() {
    const searchValue = document.getElementById('searchBar').value.toLowerCase();
    const filterCategory = document.getElementById('filterCategory').value;

    const rows = document.querySelectorAll('#vendorTable tbody tr');
    rows.forEach((row) => {
        const name = row.cells[1].textContent.toLowerCase();
        const category = row.cells[2].textContent;

        const matchesSearch = name.includes(searchValue);
        const matchesCategory = !filterCategory || category === filterCategory;

        row.style.display = matchesSearch && matchesCategory ? '' : 'none';
    });
}

// Generate Vendor Report
async function generateReport() {
    try {
        const response = await fetch(`${API_BASE_URL}/vendor`);
        const vendors = await response.json();

        let csv =
            'ID,Name,Service Category,Contact Information,Certifications,Compliance,Performance Rating\n';
        vendors.forEach((vendor) => {
            csv += `${vendor.VendorID},${vendor.Name},${vendor.ServiceCategory},${vendor.ContactInformation},${vendor.Certifications},${vendor.ComplianceStatus === 1 ? 'Yes' : 'No'},${vendor.PerformanceRating || 'N/A'}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'vendor_report.csv';
        link.click();
    } catch (error) {
        console.error('Error generating report:', error);
    }
}








// Fetch Contracts
async function fetchContracts() {
    const vendorID = document.getElementById('filterVendorID').value;

    let url = `${API_BASE_URL}/contract`;
    if (vendorID) {
        url += `?VendorID=${vendorID}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch contracts.');
        }

        const contracts = await response.json();
        const tableBody = document.getElementById('contractTable').querySelector('tbody');
        tableBody.innerHTML = ''; // Clear previous data

        contracts.forEach(contract => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${contract.ContractID}</td>
                <td>${contract.VendorID}</td>
                <td>${contract.StartDate}</td>
                <td>${contract.EndDate}</td>
                <td>${contract.Terms}</td>
                <td>${contract.SpecialClauses || 'N/A'}</td>
                <td>${contract.RenewalStatus ? 'Renewed' : 'Not Renewed'}</td>
                <td>
                    <button onclick="editContract(${contract.ContractID})">Edit</button>
                    <button onclick="deleteContract(${contract.ContractID})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching contracts:', error);
    }
}

// Add or Update Contract
async function addOrUpdateContract(event) {
    event.preventDefault();

    const contractID = document.getElementById('contractID').value;
    const vendorID = document.getElementById('vendorID').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const terms = document.getElementById('terms').value;
    const specialClauses = document.getElementById('specialClauses').value;

    const method = contractID ? 'PUT' : 'POST';
    const url = contractID ? `${API_BASE_URL}/contract/${contractID}` : `${API_BASE_URL}/contract`;

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                VendorID: vendorID,
                StartDate: startDate,
                EndDate: endDate,
                Terms: terms,
                SpecialClauses: specialClauses,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to save contract.');
        }

        alert('Contract saved successfully!');
        document.getElementById('contractForm').reset();
        fetchContracts();
    } catch (error) {
        console.error('Error saving contract:', error);
        alert('Error saving contract.');
    }
}

// Edit Contract
async function editContract(contractID) {
    try {
        const response = await fetch(`${API_BASE_URL}/contract/${contractID}`);
        if (!response.ok) {
            throw new Error('Failed to fetch contract details.');
        }

        const contract = await response.json();
        const formattedStartDate = contract.StartDate.split('T')[0]; // Extract YYYY-MM-DD
        const formattedEndDate = contract.EndDate.split('T')[0]; // Extract YYYY-MM-DD

        document.getElementById('contractID').value = contract.ContractID;
        document.getElementById('vendorID').value = contract.VendorID;
        document.getElementById('startDate').value = formattedStartDate;
        document.getElementById('endDate').value = formattedEndDate;
        document.getElementById('terms').value = contract.Terms;
        document.getElementById('specialClauses').value = contract.SpecialClauses;
    } catch (error) {
        console.error('Error editing contract:', error);
        alert('Failed to load contract details for editing.');
    }
}

// Delete Contract
async function deleteContract(contractID) {
    try {
        const response = await fetch(`${API_BASE_URL}/contract/${contractID}`, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error('Failed to delete contract.');
        }

        alert('Contract deleted successfully!');
        fetchContracts();
    } catch (error) {
        console.error('Error deleting contract:', error);
        alert('Failed to delete contract.');
    }
}












// Fetch Department Budgets
async function fetchDepartmentBudgets() {
    console.log('Fetching department budgets...');
    try {
        const response = await fetch(`${API_BASE_URL}/department`);
        console.log('Raw Response:', response);

        if (!response.ok) {
            throw new Error('Failed to fetch department budgets.');
        }

        const departments = await response.json();
        console.log('Department Data:', departments);

        const tableBody = document.getElementById('departmentBudgetsTable').querySelector('tbody');
        tableBody.innerHTML = ''; // Clear old rows

        departments.forEach(department => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${department.DepartmentID}</td>
                <td>${department.Name}</td>
                <td>${department.AllocatedBudget}</td>
                <td>${department.RemainingBudget}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching department budgets:', error);
        alert('Failed to load department budgets.');
    }
}
async function fetchPurchaseOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/purchase-orders`);
        if (!response.ok) {
            throw new Error(`Error fetching purchase orders: ${response.statusText}`);
        }

        const purchaseOrders = await response.json();
        console.log('Fetched purchase orders:', purchaseOrders);

        // Ensure the table body exists
        const tableBody = document.getElementById('purchaseOrdersTable');
        if (!tableBody) {
            throw new Error('Table body with ID "purchaseOrdersTable" not found.');
        }

        // Clear any existing rows
        tableBody.innerHTML = '';

        // Populate the table with purchase orders
        purchaseOrders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.POID}</td>
                <td>${order.DepartmentID}</td>
                <td>${order.VendorID}</td>
                <td>${order.ItemDetails}</td>
                <td>${order.Quantity}</td>
                <td>${order.TotalCost}</td>
                <td>${order.POStatus}</td>
                <td>
                    <button onclick="approveOrder(${order.POID})">Approve</button>
                    <button onclick="rejectOrder(${order.POID})">Reject</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching purchase orders:', error);
        alert('Failed to load purchase orders.');
    }
}






// Export Department Budgets as CSV
async function exportDepartmentBudgets() {
    try {
        const response = await fetch(`${API_BASE_URL}/report/department-budgets`);
        if (!response.ok) throw new Error('Failed to download department budgets report.');

        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'department_budgets_report.csv';
        link.click();
    } catch (error) {
        console.error('Error exporting department budgets:', error);
        alert('Failed to export department budgets report.');
    }
}

// Filter Purchase Orders
async function filterPurchaseOrders() {
    const departmentID = document.getElementById('filterDepartmentID').value;
    const vendorID = document.getElementById('filterVendorID').value;

    try {
        const url = new URL(`${API_BASE_URL}/purchase-orders/filter`);
        if (departmentID) url.searchParams.append('departmentID', departmentID);
        if (vendorID) url.searchParams.append('vendorID', vendorID);

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch filtered purchase orders.');

        const purchaseOrders = await response.json();
        console.log('Filtered purchase orders:', purchaseOrders);

        const tableBody = document.getElementById('purchaseOrdersTable').querySelector('tbody');
        tableBody.innerHTML = ''; // Clear previous data

        purchaseOrders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.POID}</td>
                <td>${order.DepartmentID}</td>
                <td>${order.VendorID}</td>
                <td>${order.ItemDetails}</td>
                <td>${order.Quantity}</td>
                <td>${order.TotalCost}</td>
                <td>${order.POStatus}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error filtering purchase orders:', error);
        alert('Failed to filter purchase orders.');
    }
}



// Fetch Vendor Performance Report
async function fetchVendorPerformanceReport() {
    try {
        const response = await fetch(`${API_BASE_URL}/reports/vendor-performance`);
        if (!response.ok) throw new Error('Failed to fetch vendor performance report.');

        const report = await response.json();
        console.log('Vendor Performance Report:', report);

        const tableBody = document.getElementById('vendorPerformanceTable').querySelector('tbody');
        tableBody.innerHTML = '';

        report.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.VendorID}</td>
                <td>${row.VendorName}</td>
                <td>${row.AverageQualityRating || 'N/A'}</td>
                <td>${row.AverageTimelinessRating || 'N/A'}</td>
                <td>${row.TotalEvaluations}</td>
            `;
            tableBody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error fetching vendor performance report:', error);
    }
}

// Fetch Procurement Report
async function fetchProcurementReport() {
    try {
        const response = await fetch(`${API_BASE_URL}/reports/procurement`);
        if (!response.ok) throw new Error('Failed to fetch procurement report.');

        const report = await response.json();
        console.log('Procurement Report:', report);

        const tableBody = document.getElementById('procurementReportTable').querySelector('tbody');
        tableBody.innerHTML = '';

        report.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.POID}</td>
                <td>${row.DepartmentName}</td>
                <td>${row.VendorName}</td>
                <td>${row.ItemDetails}</td>
                <td>${row.Quantity}</td>
                <td>${row.TotalCost}</td>
                <td>${row.POStatus}</td>
            `;
            tableBody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error fetching procurement report:', error);
    }
}

function downloadCSV(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) {
        alert('Table not found!');
        return;
    }

    let csv = [];
    const rows = table.querySelectorAll('tr');

    // Iterate over table rows
    rows.forEach(row => {
        let rowData = [];
        const cols = row.querySelectorAll('th, td');
        cols.forEach(col => rowData.push(`"${col.textContent.trim()}"`)); // Escape content with quotes
        csv.push(rowData.join(',')); // Join columns with commas
    });

    // Convert array to Blob for download
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    // Create a download link and trigger click
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}









// Fetch and Display Department Budget for Department Head
async function fetchDepartmentHeadBudget(userID) {
    try {
        const response = await fetch(`${API_BASE_URL}/department-head/budget?userID=${userID}`);
        if (!response.ok) {
            throw new Error('Failed to fetch department budget.');
        }

        const budgets = await response.json();
        const tableBody = document.getElementById('departmentBudgetTable').querySelector('tbody');
        tableBody.innerHTML = '';

        budgets.forEach((budget) => {
            const row = `
                <tr>
                    <td>${budget.DepartmentID}</td>
                    <td>${budget.DepartmentName}</td>
                    <td>${budget.AllocatedBudget}</td>
                    <td>${budget.RemainingBudget}</td>
                </tr>`;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error fetching department budget:', error);
        alert('Failed to fetch department budget.');
    }
}
async function fetchAllPurchaseOrders() {
    console.log('Starting to fetch purchase orders...');
    
    try {
        // Attempt to fetch data from the server
        const response = await fetch("http://localhost:5000/api/purchase-orders");
        
        // Check if the response is ok
        if (!response.ok) {
            throw new Error(`Error fetching purchase orders: ${response.statusText}`);
        }

        // Parse JSON response
        const purchaseOrders = await response.json();
        console.log('Fetched all purchase orders:', purchaseOrders);

        // Access table body element
        const tableBody = document.getElementById("purchaseOrdersTable");

        if (!tableBody) {
            console.error("Table body not found.");
            return;
        }

        // Clear any existing rows
        tableBody.innerHTML = "";

        // Loop through the orders and append rows to the table
        purchaseOrders.forEach(order => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${order.POID}</td>
                <td>${order.DepartmentID}</td>
                <td>${order.VendorID}</td>
                <td>${order.TotalCost}</td>
                <td>${order.POStatus}</td>
                <td>
                    <button onclick="approveOrder(${order.POID})">Approve</button>
                    <button onclick="rejectOrder(${order.POID})">Reject</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching all purchase orders:", error);
        alert("Failed to load purchase orders.");
    }
}





async function createPurchaseOrder(event) {
    event.preventDefault();

    // Fetch values from the form
    const departmentID = document.getElementById('departmentID').value;
    const vendorID = document.getElementById('vendorID').value;
    const itemDetails = document.getElementById('itemDetails').value;
    const quantity = parseInt(document.getElementById('quantity').value, 10);
    const totalCost = parseFloat(document.getElementById('totalCost').value);

    // Validation
    if (!departmentID || !vendorID || !itemDetails || isNaN(quantity) || isNaN(totalCost)) {
        alert('Please fill in all fields with valid values.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/department-head/purchase-orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ DepartmentID: departmentID, VendorID: vendorID, ItemDetails: itemDetails, Quantity: quantity, TotalCost: totalCost }),
        });

        if (!response.ok) {
            throw new Error(`Failed to create purchase order: ${response.statusText}`);
        }

        alert('Purchase order created successfully.');
        fetchPurchaseOrders(departmentID); // Refresh the list
    } catch (error) {
        console.error('Error creating purchase order:', error);
        alert('Failed to create purchase order.');
    }
}

async function approveOrder(poID) {
    try {
        const response = await fetch(`${API_BASE_URL}/purchase-orders/${poID}/approve`, { method: 'PUT' });
        if (!response.ok) {
            throw new Error('Failed to approve the order.');
        }

        alert('Order approved successfully.');
        fetchPurchaseOrders(); // Refresh all purchase orders without relying on departmentID
    } catch (error) {
        console.error('Error approving order:', error);
        alert('Failed to approve the order.');
    }
}

async function rejectOrder(poID) {
    try {
        const response = await fetch(`${API_BASE_URL}/purchase-orders/${poID}/reject`, { method: 'PUT' });
        if (!response.ok) {
            throw new Error('Failed to reject the order.');
        }

        alert('Order rejected successfully.');
        fetchPurchaseOrders(); // Refresh all purchase orders without relying on departmentID
    } catch (error) {
        console.error('Error rejecting order:', error);
        alert('Failed to reject the order.');
    }
}
async function createTask(event) {
    event.preventDefault(); // Prevent form submission

    const assignedTo = document.getElementById("assignedTo").value;
    const description = document.getElementById("taskDescription").value;
    const dueDate = document.getElementById("dueDate").value;
    const status = document.getElementById("status").value;

    try {
        const response = await fetch("http://localhost:5000/api/task", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                AssignedTo: assignedTo,
                Description: description,
                DueDate: dueDate,
                Status: status
            })
        });

        if (!response.ok) {
            throw new Error(`Error creating task: ${response.statusText}`);
        }

        alert("Task created successfully.");
        fetchTasks(); // Refresh the task list
    } catch (error) {
        console.error("Error creating task:", error);
        alert("Failed to create task.");
    }
}



async function deleteTask(taskID) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskID}`, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error('Failed to delete task.');
        }

        alert('Task deleted successfully.');
        fetchTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task.');
    }
}


async function updateTaskStatus(taskID) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskID}`);
        if (!response.ok) {
            throw new Error('Error fetching task.');
        }
        const task = await response.json();

        // Toggle status
        const newStatus = task.Status === 'Pending' ? 'Completed' : 'Pending';

        const updateResponse = await fetch(`${API_BASE_URL}/tasks/${taskID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Status: newStatus }),
        });

        if (!updateResponse.ok) {
            throw new Error('Error updating task status.');
        }

        alert('Task status updated successfully.');
        fetchTasks();
    } catch (error) {
        console.error('Error updating task status:', error);
        alert('Failed to update task status.');
    }
}

async function fetchTasks() {
    try {
        const response = await fetch(`${API_BASE_URL}/task`);
        if (!response.ok) {
            throw new Error('Error fetching tasks');
        }
        const tasks = await response.json();
        const tableBody = document.getElementById('taskList');
        tableBody.innerHTML = ''; // Clear previous rows

        tasks.forEach(task => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${task.TaskID}</td>
                <td>${task.AssignedTo}</td>
                <td>${task.TaskDescription}</td>
                <td>${task.DueDate.split('T')[0]}</td>
                <td>${task.Status}</td>
                <td>
                    <button onclick="deleteTask(${task.TaskID})">Delete</button>
                    <button onclick="updateTaskStatus(${task.TaskID})">Toggle Status</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        alert('Failed to load tasks.');
    }
}
// Add or Update User
// Add or Update User
async function saveUser(event) {
    event.preventDefault(); // Prevent form submission

    const userID = document.getElementById('userID').value; // Hidden input field for UserID
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim(); // Optional
    const role = document.getElementById('role').value;
    const departmentID = document.getElementById('departmentID').value;

    // Input validation
    if (!name || !email || !role || !departmentID) {
        alert('Name, email, role, and department are required.');
        return;
    }

    // Determine whether to add or update
    const method = userID ? 'PUT' : 'POST';
    const url = userID ? `${API_BASE_URL}/user/${userID}` : `${API_BASE_URL}/user`;

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role, departmentID }),
        });

        if (response.ok) {
            const successMessage = userID ? 'User updated successfully.' : 'User added successfully.';
            alert(successMessage);

            // Clear form and refresh user list
            document.getElementById('userForm').reset();
            document.getElementById('userID').value = ''; // Reset hidden field
            fetchUsers(); // Refresh user list
        } else {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to save user.');
        }
    } catch (error) {
        console.error('Error saving user:', error);
        alert(`Error saving user: ${error.message}`);
    }
}

// Populate Form for Editing
async function editUser(userID) {
    try {
        const response = await fetch(`${API_BASE_URL}/user/${userID}`);
        if (!response.ok) throw new Error('Failed to fetch user details.');

        const user = await response.json();

        // Populate form fields with user data
        document.getElementById('userID').value = user.UserID; // Hidden field for updates
        document.getElementById('name').value = user.Name;
        document.getElementById('email').value = user.Email;
        document.getElementById('password').value = ''; // Leave empty for security
        document.getElementById('role').value = user.Role;
        document.getElementById('departmentID').value = user.DepartmentID;

        alert('Edit user details in the form and save changes.');
    } catch (error) {
        console.error('Error editing user:', error);
        alert('Failed to load user details for editing.');
    }
}

// Fetch users and update the list
async function fetchUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/user`);
        if (!response.ok) throw new Error('Failed to fetch users.');

        const users = await response.json();
        const userListElement = document.getElementById('user-list');
        userListElement.innerHTML = ''; // Clear existing data

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.UserID}</td>
                <td>${user.Name}</td>
                <td>${user.Email}</td>
                <td>${user.Role}</td>
                <td>${user.DepartmentID}</td>
                <td>
                    <button onclick="editUser(${user.UserID})">Edit</button>
                    <button onclick="deleteUser(${user.UserID})">Delete</button>
                </td>
            `;
            userListElement.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        alert('Error fetching users.');
    }
}


async function fetchSystemSettings() {
    try {
        const response = await fetch(`${API_BASE_URL}/system-settings`);
        if (!response.ok) {
            alert('Error fetching system settings');
            return;
        }
        const settings = await response.json();
        const tableBody = document.getElementById('settings-table').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = ''; // Clear the table body

        settings.forEach(setting => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${setting.SettingName}</td>
                <td><input type="text" value="${setting.SettingValue}" id="setting-${setting.ID}" /></td>
                <td>${setting.Description}</td>
                <td><button onclick="updateSetting(${setting.ID})">Update</button></td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching system settings:', error);
    }
}

// Update a system setting
async function updateSetting(id) {
    const newValue = document.getElementById(`setting-${id}`).value;

    try {
        const response = await fetch(`${API_BASE_URL}/system-settings/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ SettingValue: newValue })
        });

        if (response.ok) {
            alert('System setting updated successfully');
            fetchSystemSettings(); // Refresh the settings
        } else {
            alert('Failed to update system setting');
        }
    } catch (error) {
        console.error('Error updating setting:', error);
    }
}
//apply the updated system settings 
// Function to fetch all system settings and apply them dynamically
async function applySystemSettings() {
    try {
        const response = await fetch('http://localhost:5000/api/system-settings');
        if (!response.ok) throw new Error('Failed to fetch system settings.');

        const settings = await response.json();

        // Apply each setting dynamically
        settings.forEach(setting => {
            switch (setting.SettingName) {
                case 'ShowNotifications':
                    toggleNotifications(setting.SettingValue === 'true');
                    break;

                case 'ShowVisualizations':
                    toggleVisualizations(setting.SettingValue === 'true');
                    break;

                case 'ThemePreference':
                    applyTheme(setting.SettingValue);
                    break;

                case 'AutoLogoutMinutes':
                    setAutoLogout(setting.SettingValue);
                    break;

                default:
                    console.log(`Unknown setting: ${setting.SettingName}`);
            }
        });
    } catch (error) {
        console.error('Error applying system settings:', error);
    }
}

// Function to toggle notifications visibility
function toggleNotifications(show) {
    const notificationsButton = document.querySelector('button[onclick="fetchNotifications()"]');
    const notificationsContainer = document.getElementById('notifications-container');

    if (show) {
        notificationsButton.style.display = 'block';
        notificationsContainer.style.display = 'block';
    } else {
        notificationsButton.style.display = 'none';
        notificationsContainer.style.display = 'none';
    }
}

// Toggle visualizations visibility
function toggleVisualizations(show) {
    const visualizationSections = [
        document.querySelector('#visualization-container').closest('.container'),
        document.querySelector('#budget-visualization-container').closest('.container'),
        document.querySelector('#po-visualization-container').closest('.container'),
    ];

    visualizationSections.forEach(section => {
        if (show) {
            section.style.display = 'block'; // Show the entire section (button, legends, graphs)
        } else {
            section.style.display = 'none'; // Hide the entire section
        }
    });
}
// Function to apply theme preference
// Function to apply theme preference (simple version)
function applyTheme(theme) {
    const body = document.body;

    if (theme === 'dark') {
        body.style.backgroundColor = '#000000'; // Black background
        body.style.color = '#ffffff'; // Optional: Change text color if needed
    } else {
        body.style.backgroundColor = '#f3eaf7'; // Default light theme
        body.style.color = '#4a355a'; // Reset to default text color
    }
}

// Fetch the theme setting and apply it when the page loads
async function initializeTheme() {
    try {
        const response = await fetch('http://localhost:5000/api/system-settings');
        if (!response.ok) throw new Error('Failed to fetch system settings.');
        
        const settings = await response.json();
        const themeSetting = settings.find(setting => setting.SettingName === 'ThemePreference');
        if (themeSetting) applyTheme(themeSetting.SettingValue);
    } catch (error) {
        console.error('Error initializing theme:', error);
    }
}

// Run the theme initialization on page load
document.addEventListener('DOMContentLoaded', initializeTheme);


let logoutTimer = null;

function resetLogoutTimer(minutes) {
    // Clear any existing logout timer
    if (logoutTimer) {
        clearTimeout(logoutTimer);
    }

    // Set a new logout timer
    logoutTimer = setTimeout(() => {
        alert('You have been logged out due to inactivity.');
        window.location.href = 'login.html'; // Redirect to the login page
    }, minutes * 60 * 1000); // Convert minutes to milliseconds
}

function setAutoLogout(minutes) {
    if (!minutes || isNaN(minutes) || minutes <= 0) {
        console.error('Invalid AutoLogoutMinutes value:', minutes);
        return;
    }

    // Reset the timer whenever there's user activity
    ['click', 'mousemove', 'keypress', 'scroll'].forEach(event => {
        window.addEventListener(event, () => resetLogoutTimer(minutes));
    });

    // Start the logout timer immediately
    resetLogoutTimer(minutes);
}

// Fetch AutoLogoutMinutes setting and initialize it
async function initializeAutoLogout() {
    try {
        const response = await fetch('http://localhost:5000/api/system-settings');
        if (!response.ok) throw new Error('Failed to fetch system settings.');

        const settings = await response.json();
        const autoLogoutSetting = settings.find(setting => setting.SettingName === 'AutoLogoutMinutes');
        if (autoLogoutSetting) {
            setAutoLogout(parseInt(autoLogoutSetting.SettingValue, 10));
        }
    } catch (error) {
        console.error('Error initializing auto logout:', error);
    }
}

// Initialize auto-logout on page load
document.addEventListener('DOMContentLoaded', initializeAutoLogout);


// Call `applySystemSettings` when the page loads
document.addEventListener('DOMContentLoaded', () => {
    applySystemSettings();
});


document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname;

    if (currentPage.includes('user-management.html')) {
        fetchUsers();
    } else if (currentPage.includes('settings.html')) {
        fetchSystemSettings();
    } else if (currentPage.includes('vendor-management.html')) {
        fetchVendors();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const userRole = sessionStorage.getItem("userRole"); // Example: "Admin", "ProcurementManager", "DepartmentHead"

    // Define role-based access for each link
    const roleAccess = {
        Admin: ["dashboard.html", "vendor-management.html", "contract-management.html", "purchase-order.html", "task-management.html", "system-settings.html", "budget-tracking.html", "user-management.html", "reports.html", "audit-logs.html","login.html"],
        ProcurementManager: ["dashboard.html", "vendor-management.html", "contract-management.html", "purchase-order.html", "task-management.html", "budget-tracking.html", "reports.html","login.html"],
        DepartmentHead: ["dashboard.html", "purchase-order.html", "task-management.html", "budget-tracking.html", "reports.html","login.html"],
    };

    // Get all navigation links
    const allNavLinks = document.querySelectorAll("nav ul li a");

    // Attach event listeners to all links
    allNavLinks.forEach(link => {
        link.addEventListener("click", event => {
            const targetPage = link.getAttribute("href");

            if (!roleAccess[userRole]?.includes(targetPage)) {
                event.preventDefault(); // Prevent navigation
                alert("Permission Denied: You do not have access to this page.");
            }
        });
    });
});

async function fetchAuditLogs() {
    try {
        console.log('fetchAuditLogs called');

        const response = await fetch(`${API_BASE_URL}/audit-logs`);
        console.log('API Response:', response);

        if (!response.ok) {
            throw new Error('Failed to fetch audit logs.');
        }

        const logs = await response.json();
        console.log('Fetched Audit Logs:', logs);

        const tableBody = document.getElementById('auditLogsTable').querySelector('tbody');
        tableBody.innerHTML = ''; // Clear existing rows

        logs.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${log.LogID}</td>
                <td>${log.Action}</td>
                <td>${new Date(log.ActionDateTime).toLocaleString()}</td>
                <td>${log.Description}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        alert('Failed to load audit logs.');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('audit-logs.html')) {
        fetchAuditLogs();
    }
});




// Fetch and display notifications
async function fetchNotifications() {
    try {
        // Call the backend API
        const response = await fetch("http://localhost:5000/api/notifications");

        console.log("Raw Response Object:", response);

        if (!response.ok) {
            throw new Error("Failed to fetch notifications.");
        }

        // Parse the JSON response
        const notifications = await response.json();

        console.log("Fetched Notifications from Backend:", notifications);

        // Update the notification table
        const tableBody = document.getElementById("notifications-table");
        tableBody.innerHTML = ""; // Clear previous notifications

        if (notifications.length === 0) {
            tableBody.insertAdjacentHTML(
                "beforeend",
                `<tr><td colspan="2">No notifications available.</td></tr>`
            );
        } else {
            notifications.forEach(notification => {
                tableBody.insertAdjacentHTML(
                    "beforeend",
                    `<tr><td>${notification.Type}</td><td>${notification.Message}</td></tr>`
                );
            });
        }

        // Update the notification count
        const notificationCount = document.getElementById("notification-count");
        notificationCount.textContent = `(${notifications.length})`;
    } catch (error) {
        console.error("Error fetching notifications:", error);
        alert("Failed to load notifications.");
    }
}


let chartInstance = null; // For performance chart
let budgetChartInstance = null; // For budget chart


// Average Performance Ratings Visualization
document.getElementById('show-visualization').addEventListener('click', async () => {
    const container = document.getElementById('visualization-container');
    const ctx = document.getElementById('vendor-performance-chart').getContext('2d');

    if (container.style.display === 'block') {
        container.style.display = 'none';
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/reports/vendor-overall-performance');
        if (!response.ok) throw new Error('Failed to fetch overall performance data.');

        const data = await response.json();

        container.style.display = 'block';

        if (chartInstance) chartInstance.destroy();

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Overall Quality Rating', 'Overall Timeliness Rating'],
                datasets: [
                    {
                        label: 'Overall Quality Rating',
                        data: [data.OverallQualityRating, null], // Data specific to this label
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                    {
                        label: 'Overall Timeliness Rating',
                        data: [null, data.OverallTimelinessRating], // Data specific to this label
                        backgroundColor: 'rgba(153, 102, 255, 0.6)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'left', // Move legend to the left
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });
    } catch (error) {
        console.error('Error displaying overall performance visualization:', error);
        alert('Failed to display overall performance visualization.');
    }
});


// Percentage of Budget Utilized Visualization
document.getElementById('show-budget-visualization').addEventListener('click', async () => {
    const container = document.getElementById('budget-visualization-container');
    const ctx = document.getElementById('budget-utilization-chart').getContext('2d');

    if (container.style.display === 'block') {
        container.style.display = 'none';
        if (budgetChartInstance) {
            budgetChartInstance.destroy();
            budgetChartInstance = null;
        }
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/reports/department-budget-utilization');
        if (!response.ok) throw new Error('Failed to fetch department budget data.');

        const data = await response.json();
        const labels = data.map(item => item.DepartmentName);
        const utilization = data.map(item => ((item.Expenses / item.AllocatedBudget) * 100).toFixed(2));
        const colors = labels.map(() => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`);

        container.style.display = 'block';

        if (budgetChartInstance) budgetChartInstance.destroy();

        budgetChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Budget Utilization (%)',
                        data: utilization,
                        backgroundColor: colors,
                        borderColor: colors.map(color => color.replace('0.6', '1')),
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.label}: ${context.raw}% utilized`,
                        },
                    },
                    legend: {
                        position: 'left', // Move legend to the left
                    },
                },
            },
        });
    } catch (error) {
        console.error('Error displaying budget visualization:', error);
        alert('Failed to display budget utilization visualization.');
    }
});
let purchaseOrderChartInstance = null; // Unique instance for the doughnut chart

document.getElementById('show-po-visualization').addEventListener('click', async () => {
    const container = document.getElementById('po-visualization-container');
    const ctx = document.getElementById('purchase-order-status-chart').getContext('2d');

    // Toggle chart visibility
    if (container.style.display === 'block') {
        console.log('Hiding chart...');
        container.style.display = 'none'; // Hide the chart
        if (purchaseOrderChartInstance) {
            console.log('Destroying existing chart instance...');
            purchaseOrderChartInstance.destroy(); // Destroy the existing chart instance
            purchaseOrderChartInstance = null; // Reset the chart instance
        }
        return;
    }

    try {
        console.log('Fetching purchase order status data...');
        const response = await fetch('http://localhost:5000/reports/purchase-order-status');
        if (!response.ok) throw new Error('Failed to fetch purchase order status data.');

        const data = await response.json();
        console.log('Fetched Purchase Order Status Data:', data);

        // Parse data for Chart.js
        const labels = data.map(item => item.POStatus);
        const counts = data.map(item => item.StatusCount);

        // Display container
        container.style.display = 'block';

        // Destroy existing chart if it exists
        if (purchaseOrderChartInstance) {
            console.log('Destroying previous chart instance...');
            purchaseOrderChartInstance.destroy();
        }

        // Render chart
        console.log('Rendering chart...');
        purchaseOrderChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [
                    {
                        data: counts,
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                        borderColor: '#fff',
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'left', // Legend on the left
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value}`;
                            },
                        },
                    },
                },
            },
        });
    } catch (error) {
        console.error('Error displaying purchase order status visualization:', error);
        alert('Failed to display purchase order status visualization.');
    }
});
