document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll("[data-section]"); //sidebar buttons
    const sections = document.querySelectorAll("main > section");

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const targetSection = button.dataset.section;
            sections.forEach((section) => {
                section.classList.add("hidden");
            });
            document.getElementById(targetSection).classList.remove("hidden");
        }); // this method first makes all section invisible then shows the chosen section when the user clicked section's button..
    });

    //Farmer parts with Local Strorage
    const farmerForm = document.getElementById("farmerForm");
    const farmerTableBody = document.querySelector("#farmerTable tbody");
    const farmerIdDropdown = document.getElementById("farmerIdDropdown");
    const farmersInfo = "farmersData";
    let nextFarmerId = 1; //starting id is 1 
    let isUpdating = false; // when i want to update a farmer i have to keep its farmer id and should not change the id
    let rowToUpdate = null; // it provides to restrict the row which we want to change

    const loadFarmers = () => {
        const farmers = JSON.parse(localStorage.getItem(farmersInfo)) || [];
        farmers.forEach((farmer) => {
            addFarmerToTable(farmer);
            addFarmerToDropdown(farmer);
        });
        if (farmers.length > 0) {
            nextFarmerId = Math.max(...farmers.map(farmer => parseInt(farmer.id, 10))) + 1;
        }
    };

    const saveFarmer = (farmer) => {
        const farmers = JSON.parse(localStorage.getItem(farmersInfo)) || [];
        farmers.push(farmer);
        localStorage.setItem(farmersInfo, JSON.stringify(farmers));
    };

    const addFarmer= () => {

        const farmerData = {
            id: nextFarmerId.toString(),
            name: document.getElementById("farmerName").value,
            contact: document.getElementById("farmerContact").value,
            location: document.getElementById("farmerLocation").value,
        };

        addFarmerToTable(farmerData);
        addFarmerToDropdown(farmerData);
        saveFarmer(farmerData);

        nextFarmerId++;
        farmerForm.reset();
    };

    // updating method for an exist farmer
    const updateFarmer = () => {
        const updatedFarmer = {
            id: document.getElementById("farmerid").value,
            name: document.getElementById("farmerName").value,
            contact: document.getElementById("farmerContact").value,
            location: document.getElementById("farmerLocation").value,
        };

        //update the farmer's information in the table
        rowToUpdate.innerHTML = `
            <td>${updatedFarmer.id}</td>
            <td>${updatedFarmer.name}</td>
            <td>${updatedFarmer.contact}</td>
            <td>${updatedFarmer.location}</td>
            <td>
                <button class="update">Update</button>
                <button class="delete">Delete</button>
            </td>
        `;

        rowToUpdate.querySelector(".delete").addEventListener("click", () => {
            deleteFarmer(updatedFarmer.id);
            rowToUpdate.remove();

        });

        rowToUpdate.querySelector(".update").addEventListener("click", () => {
            startUpdateProcess(updatedFarmer, rowToUpdate);
        });

        //updating local storage
        const farmers = JSON.parse(localStorage.getItem(farmersInfo)) || [];
        const farmerIndex = farmers.findIndex((f) => f.id === updatedFarmer.id);
        farmers[farmerIndex] = updatedFarmer;
        localStorage.setItem(farmersInfo, JSON.stringify(farmers));
    
        //updating dropdown option
        const optionToUpdate = farmerIdDropdown.querySelector(`option[value="${updatedFarmer.id}"]`);
        if (optionToUpdate) optionToUpdate.textContent = `${updatedFarmer.name} (${updatedFarmer.id})`;

    
        farmerForm.reset();
        //removing duplicate submission
        farmerForm.removeEventListener("submit", updateFarmer);
        document.getElementById("farmerid").readOnly = false;
        isUpdating = false;

    };

    //starting update a farmer
    const startUpdateProcess = (farmer, row) => {
        isUpdating = true;
        rowToUpdate = row;

        document.getElementById("farmerid").value = farmer.id;
        document.getElementById("farmerid").readOnly = true; //provides any changes on id
        document.getElementById("farmerName").value = farmer.name;
        document.getElementById("farmerContact").value = farmer.contact;
        document.getElementById("farmerLocation").value = farmer.location;

        farmerForm.removeEventListener("submit", addFarmer);
        farmerForm.addEventListener("submit", updateFarmer);
    };

    farmerForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (isUpdating) {
            updateFarmer();
        } else {
            addFarmer();
        }
    });

    function addFarmerToTable(farmer) {
        const row = document.createElement("tr");

        row.innerHTML= `
            <td>${farmer.id}</td>
            <td>${farmer.name}</td>
            <td>${farmer.contact}</td>
            <td>${farmer.location}</td>
            <td>
              <button class="update">Update</button>
              <button class="delete">Delete</button>
            </td>
        `;

        row.querySelector(".delete").addEventListener("click", () => {
            deleteFarmer(farmer.id);
            row.remove();
        });

        row.querySelector(".update").addEventListener("click", () => {
            startUpdateProcess(farmer, row);
        });

        farmerTableBody.appendChild(row);
    }

    function addFarmerToDropdown(farmer) {
        const option = document.createElement("option");
        option.value = farmer.id;
        option.textContent = `${farmer.name} (${farmer.id})`;
        farmerIdDropdown.appendChild(option);
    }

    const deleteFarmer = (id) => {
        const farmers = JSON.parse(localStorage.getItem(farmersInfo)) || [];
        const updatedFarmers = farmers.filter((farmer) => farmer.id !== id);
        /* if we delete a specific farmer, we can use its id for ease. 
        We can filter all farmers data without that farmer's data by its id, 
        and then set the new farmers data and show the filtered version of original data */ 
        localStorage.setItem(farmersInfo, JSON.stringify(updatedFarmers));
        
        //removing the farmer from dropdown options
        const optionToRemove = farmerIdDropdown.querySelector(`option[value="${id}"]`);
        if (optionToRemove) optionToRemove.remove();
    };
    
    loadFarmers();

    //farmer info exporting to pdf
    const exportFarmersToPDF = () => {
        const farmers = JSON.parse(localStorage.getItem(farmersInfo)) || [];
        if (farmers.length === 0) {
            alert("There is any farmer to export.");
            return;
        }

        //starting to convert pdf
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("Farmers' Infos", 10, 10);

        const headers = [["ID", "Name", "Contact", "Location"]];
        const data = farmers.map(farmer => [farmer.id, farmer.name, farmer.contact, farmer.location]);

        //inserting datas to inside of pdf
        doc.autoTable({
            head: headers,
            body: data,
            startY: 20,
        });
        
        //saving pdf like
        doc.save("Farmers_Informations.pdf");
    };

    document.getElementById("exportFarmersPDF").addEventListener("click", exportFarmersToPDF);

    // managing purchases 
    const purchaseForm = document.getElementById("purchaseForm");
    const purchaseTableBody = document.querySelector("#purchaseTable tbody");
    const sortPurchasesSelected = document.getElementById("sortPurchases");
    const purchasesInfo = "purchasesData";
    const totalBlueberriesInfo = "totalBlueberries";
    const budgetDisplay = document.getElementById("budgetDisplay");
    const leftoverDisplay = document.getElementById("leftoverDisplay");

    
    const loadPurchases = () => {
        const purchases = JSON.parse(localStorage.getItem(purchasesInfo)) || [];
        displayPurchases(purchases);
    };

    const displayPurchases = (purchases) => {
        purchaseTableBody.innerHTML = ""; //for clearing previouse table body
        purchases.forEach((purchase) => addPurchaseToTable(purchase));
    }

    const savePurchase = (purchase) => {
        const purchases = JSON.parse(localStorage.getItem(purchasesInfo)) || [];
        purchases.push(purchase);
        localStorage.setItem(purchasesInfo, JSON.stringify(purchases));
        console.log(localStorage.getItem(purchasesInfo));
        //loadPurchases(); //refresh the table after adding new purchase
    };

    //budget has to have a default value!!
    const defaultBudget = 25000.00;
    let currentBudget = parseFloat(localStorage.getItem('currentBudget')) || defaultBudget;
    budgetDisplay.dataset.value = currentBudget.toFixed(2);
    budgetDisplay.textContent = `$${currentBudget.toLocaleString()}`; 
    
    const updateBudget = (totalCost) => {
        let currentBudget = parseFloat(budgetDisplay.dataset.value);
        if (currentBudget - totalCost < 0) {
            alert("Not enough budget for this purchase!!");
            return false;
        }
        currentBudget -= totalCost;
        // save the lastest value of budget
        localStorage.setItem('currentBudget', currentBudget.toFixed(2));
        budgetDisplay.dataset.value = currentBudget.toFixed(2);
        budgetDisplay.textContent = `$${currentBudget.toLocaleString()}`;
        return true;
    };

    //a method for starting blueberry stock
    const startingBlueberryStock = () => {
        if (!localStorage.getItem(totalBlueberriesInfo)) {
            localStorage.setItem(totalBlueberriesInfo, JSON.stringify(0));
        }
        updateLeftoverDisplay();
    };

    const updateLeftoverDisplay = () => {
        const totalBlueberries = JSON.parse(localStorage.getItem(totalBlueberriesInfo)) || 0;
        leftoverDisplay.textContent = `${totalBlueberries} Kg`; 
    };

    purchaseForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const farmers = JSON.parse(localStorage.getItem(farmersInfo)) || [];
        const selectedFarmerId = document.getElementById("farmerIdDropdown").value;
        const selectedFarmer = farmers.find(farmer => farmer.id === selectedFarmerId);

        const quantity = parseFloat(document.getElementById("quantity").value);
        const pricePerKg = parseFloat(document.getElementById("pricePerKg").value);
        const totalCost = quantity * pricePerKg;

        if (isNaN(quantity) || quantity <= 0 || isNaN(pricePerKg) || pricePerKg <= 0) {
            alert("Please enter valid values for quantity and price per kg.");
            return;
        }

        const purchaseData = {
            id: Date.now().toString(),
            farmerName: selectedFarmer ? selectedFarmer.name : "Unknown",
            date: new Date().toLocaleDateString(),
            quantity: quantity,
            pricePerKg: pricePerKg,
            totalCost: totalCost,
        };

        addPurchaseToTable(purchaseData);
        savePurchase(purchaseData);
        updateBudget(totalCost);

        //save the lastest changes about blueberry stock..
        let currentBlueberries = JSON.parse(localStorage.getItem(totalBlueberriesInfo)) || 0;
        currentBlueberries += quantity; //after purchase operation, the new stock value of purchased blueberries updated
        localStorage.setItem(totalBlueberriesInfo, JSON.stringify(currentBlueberries));

        updateLeftoverDisplay();

        alert(`Purchase recorded! Added ${quantity} Kg of blueberries to stock..`);
        purchaseForm.reset();
    });


    const addPurchaseToTable = (purchase) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${purchase.id}</td>
            <td>${purchase.farmerName}</td>
            <td>${purchase.date}</td>
            <td>${purchase.quantity}</td>
            <td>${purchase.pricePerKg}</td>
            <td>${purchase.totalCost.toFixed(2)}</td>
        `;

        purchaseTableBody.appendChild(row);
    };

    const sortPurchases = (criteria) => {
        const purchases = JSON.parse(localStorage.getItem(purchasesInfo)) || [];
        purchases.sort((a,b) => {
            if (criteria === "date") {
                return new Date(a.date) - new Date(b.date); 
            } else if (criteria === "farmer") {
                return a.farmerName.localeCompare(b.farmerName);
            } else if (criteria === "amount") {
                return b.totalCost - a.totalCost; //descending order
            }
        });
        displayPurchases(purchases);
    };

    sortPurchasesSelected.addEventListener("change", (event) => {
        const criteria = event.target.value;
        sortPurchases(criteria);
    });

    startingBlueberryStock();
    loadPurchases();
    
    //calculate the total expense according to give date arrival
    document.getElementById("calculateExpenses").addEventListener("click", () => {
        const startDate = new Date(document.getElementById("startDate").value);
        const endDate = new Date(document.getElementById("endDate").value);
        let totalExpenses= 0;

        const purchases = JSON.parse(localStorage.getItem(purchasesInfo)) || [];
        console.log(localStorage.getItem(purchasesInfo));
        purchases.forEach(purchase =>{
            const purchaseDate = new Date(purchase.date);
            if (purchaseDate >= startDate && purchaseDate <= endDate) {
                totalExpenses += purchase.totalCost;
            }
        });

        //save the totalExpense value to display on screen
        document.getElementById("totalExpenses").innerText = `$${totalExpenses.toFixed(2)}`;
    });

    // generate pdf report for expenses in date interval
    document.getElementById("generateExpenseReport").addEventListener("click", () => {
        const {jsPDF} = window.jspdf;
        const doc = new jsPDF();

        const purchases = JSON.parse(localStorage.getItem(purchasesInfo)) || [];
        if (purchases.length === 0) {
            alert("There is any puchase to export.");
            return;
        }
        
        const purchaseTableData = purchases.map(purchase => [
            purchase.id,
            purchase.farmerName,
            purchase.date,
            purchase.quantity,
            purchase.pricePerKg,
            purchase.totalCost.toFixed(2),
        ]);

        doc.text("Expense Report in Choosen Time Interval", 14, 10);
        doc.autoTable({
            head:[["Purchase ID", "Farmer Name", "Purchase Date", "Quantity (kg)", "Price per kg ($)", "Total Cost of the Purchase($)"]],
            body: purchaseTableData,
        });

        doc.save("expenseReport_givenTimeInterval.pdf");
    });

   

    
    // Packaging Management with Local Storage
    const packagingForm = document.querySelector("#packaging form");
    const premiumKgInputDiv = document.getElementById("premiumKgInputDiv");
    const packagedProductsTable = document.querySelector("#packagedProductsTable tbody");
    const categoryStockInfo = "categoryStock";
    const minStockLevel = { //defining minimum stock levels for alerting
        small:20,
        medium: 15,
        large: 10,
        extraLarge: 5,
        familyPack: 3,
        bulkPack:1 //there is no premium min stock level because it is changable up to the costumers wishes
    };

    const loadPackaging = () => {
        const categoryStock = JSON.parse(localStorage.getItem(categoryStockInfo)) || {};
        
        Object.entries(categoryStock).forEach(([category, values]) => {
            const {quantity, weight, pricePerPackage} = values;
            displayPackagingItem({ category,quantity, weight, pricePerPackage});
        });
    };

    const savePackagingItem = (packageData) => {
        const categoryStock = JSON.parse(localStorage.getItem(categoryStockInfo)) || {};
        if (!categoryStock[packageData.category]) {
            categoryStock[packageData.category] = { quantity: 0, weight: 0, pricePerPackage:0 }; // if not exist
        }
        
        //categoryStock[packageData.category] = (categoryStock[packageData.category] || 0) + packageData.quantity;
        categoryStock[packageData.category].quantity += packageData.quantity;
        categoryStock[packageData.category].weight += packageData.weight; // total weight (kg)
        categoryStock[packageData.category].pricePerPackage += parseFloat(packageData.pricePerPackage);
        localStorage.setItem(categoryStockInfo, JSON.stringify(categoryStock));
        console.log("Category Stock After Update:", categoryStock); // check the values comes or still undefined??
    };

    const displayPackagingItem = (packageData) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${packageData.category}</td>
                <td>${packageData.quantity}</td>
                <td>${packageData.weight} Kg</td>
                <td>${packageData.pricePerPackage} $</td>
            `;

            packagedProductsTable.appendChild(row);   
    };


    const updateWarehouseInfo = () => {
        const categoryStock = JSON.parse(localStorage.getItem(categoryStockInfo)) || {};
        const leftoverDisplay = document.getElementById("leftoverDisplay");
        const packagedProductsTable = document.querySelector("#packagedProductsTable tbody");

        const totalBlueberries = JSON.parse(localStorage.getItem(totalBlueberriesInfo)) || 0;
        leftoverDisplay.textContent = `${totalBlueberries} Kg`;

        packagedProductsTable.innerHTML = "";
        Object.entries(categoryStock).forEach(([category,values]) => {
            const { quantity, weight, pricePerPackage } = values;
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${category}</td>
                <td>${quantity}</td>
                <td>${weight} (Kg)</td>
                <td>${pricePerPackage} ($)</td>
            `;
            packagedProductsTable.appendChild(row);
        });
    }; 

    const checkStockLevels = () => {
        const categoryStock = JSON.parse(localStorage.getItem(categoryStockInfo)) || {};
        Object.entries(categoryStock).forEach(([category, quantity]) => {
            if (quantity < (minStockLevel[category] || 0)) {
                alert(`Warning! ${category} stock is under the min level!!!`);
            }
        });
    };

    packagingForm.addEventListener("change", (event) => {
        const selectedCategory = document.querySelector("input[name='categories']:checked");
        // premium kg input
        if (selectedCategory && selectedCategory.value === "premium") {
            premiumKgInputDiv.style.display = "block";
            
            const premiumKgInput = document.getElementById("premiumKg");
            //default premium package weight..
            let premiumKgValue = parseFloat(premiumKgInput.value) || 5.1;

            premiumKgInput.addEventListener("input", () => {
                const newPremiumKg = parseFloat(premiumKgInput.value);

                // defined or not?
                if (!isNaN(newPremiumKg) && newPremiumKg >= 5.1) {
                    premiumKgValue = newPremiumKg;
                    localStorage.setItem("premiumKg", JSON.stringify(premiumKgValue));
                    alert(`Updated premium kg to ${premiumKgValue} kg..`);
                }
            });

        } else {
            premiumKgInputDiv.style.display = "none";
        }
    });
    

    // packaging form adding
    packagingForm.addEventListener("submit", (event) => {
        event.preventDefault();
         
        const selectedCategory = document.querySelector("input[name='categories']:checked");
        const packageNumber = parseInt(document.getElementById("packageNumber").value, 10);
      
         if (!selectedCategory || !packageNumber) {
            alert("Please select a category and enter a valid package number.");
            return;
        }

        const category = selectedCategory.value;


        let kgPerPackage = 0;
        let pricePerPackage = 0;
        
        switch (category) {
            case "small":
                kgPerPackage = 0.1; //100g
                pricePerPackage = 3.50;
                break;
            case "medium":
                kgPerPackage = 0.25; //250g
                pricePerPackage = 9.50;
                break;
            case "large":
                kgPerPackage = 0.5; //500g
                pricePerPackage = 18.00;
                break;  
            case "extraLarge":
                kgPerPackage = 1;
                pricePerPackage = 34.00;
                break;
            case "familyPack":
                kgPerPackage = 2;
                pricePerPackage = 64.00;
                break;
            case "bulkPack":
                kgPerPackage = 5;
                pricePerPackage = 150.00;
                break;
            case "premium":
                const newPremiumKg = parseFloat(document.getElementById("premiumKg").value);
                kgPerPackage = newPremiumKg && !isNaN(newPremiumKg) ? parseFloat(newPremiumKg) : 5.1;
                pricePerPackage = kgPerPackage * 30.00;
                break;
            default:
                throw new Error("Unknown category!");                
        }  
      
        const totalKg = packageNumber * kgPerPackage;
        //update the stock
        let currentBlueberries = JSON.parse(localStorage.getItem(totalBlueberriesInfo)) || 0;
        if (currentBlueberries < totalKg) {
            alert("Blueberry amount is not enough for packaging operation!!");
            return;
        }

        currentBlueberries -= totalKg;
        localStorage.setItem(totalBlueberriesInfo, JSON.stringify(currentBlueberries));

        //package data for saving and displaying   
        const packageData = {
            category,
            quantity: parseInt(packageNumber,10),
            weight: parseInt(packageNumber,10) * parseFloat(kgPerPackage),
            pricePerPackage: parseFloat(pricePerPackage),
        };

         
        savePackagingItem(packageData);
        displayPackagingItem(packageData);

        updateWarehouseInfo();
        checkStockLevels();

        alert(`Packaged ${packageData.quantity}  ${packageData.category}..`);
        packagingForm.reset();
    });

    updateWarehouseInfo();
    loadPackaging();

    //checking stock amount of packages..
    const checkStockForOrder = (category, quantityOrdered) => {
        const categoryStock = JSON.parse(localStorage.getItem(categoryStockInfo)) || {};
        console.log(localStorage.getItem(categoryStockInfo));
        if (!categoryStock[category] || categoryStock[category].quantity < quantityOrdered) {
            alert("Not enough package stock for ordering!!");
            return false;
        }

        categoryStock[category].quantity -= quantityOrdered;
        localStorage.setItem(categoryStockInfo, JSON.stringify(categoryStock));
    }

    //SALES MANAGEMENT SECTION..
    const orderForm = document.getElementById("newOrderForm");
    const orderTable = document.getElementById("orderTable").getElementsByTagName("tbody")[0];
    //let totalOrderCost = document.getElementById("totalOrderCost"); //shows every order's total cost bottom of the order form html elemet
    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    // for creating order id
    const generatedOrderId = () => {
        return "ORD" + Math.floor(Math.random()* 1000000);
    }

    // order form eventListener
    orderForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const customerName = document.getElementById("customerName").value;
        const contact = document.getElementById("contact").value;
        const shippingAddress = document.getElementById("shippingAddress").value;
        const productCategory = document.getElementById("productCategory").value;
        const quantityOrdered = parseInt(document.getElementById("quantityOrdered").value);
        const unitPrice = parseFloat(document.getElementById("unitPrice").value);

        const totalPrice = (quantityOrdered * unitPrice).toFixed(2);

        

        // new order object
        const newOrder = {
            orderId: generatedOrderId(),
            customerName,
            contact,
            shippingAddress,
            productCategory,
            quantityOrdered,
            totalPrice,
            orderStatus: 'Pending' //default value of this property
        }
        
        //if stock is not enough
        if (!checkStockForOrder(productCategory, quantityOrdered)) {
            alert("Not enough package stock for ordering!!");
        }

        //store new order in local storage 
        orders.push(newOrder);
        localStorage.setItem("orders", JSON.stringify(orders));

        //show the order on the order table
        addOrderToTable(newOrder);

        //reset the form
        orderForm.reset();


    });

    const updateUnitPrice = () => {
        const productCategory = document.getElementById("productCategory").value;
        const categoryStock = JSON.parse(localStorage.getItem(categoryStockInfo)) || [];

        if (categoryStock[productCategory]) {
            const unitPrice = categoryStock[productCategory].pricePerPackage;
            document.getElementById("unitPrice").value = parseFloat(unitPrice).toFixed(2);
        } else {
            document.getElementById("unitPrice").value = "0.00";
        }
    };

    document.getElementById("productCategory").addEventListener("change", updateUnitPrice);



    //adding orders to order table
    const addOrderToTable = (order) => {
        const row = orderTable.insertRow();
        row.innerHTML = `
            <td>${order.orderId}</td>
            <td>${order.customerName}</td>
            <td>${order.contact}</td>
            <td>${order.shippingAddress}</td>
            <td>${order.productCategory}</td>
            <td>${order.quantityOrdered}</td>
            <td>$${order.totalPrice}</td>
            <td>
                <select class="order-status" data-order-id="${order.orderId}">
                    <option value="Pending" ${order.orderStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Processed" ${order.orderStatus === 'Processed' ? 'selected' : ''}>Processed</option>
                    <option value="Shipped" ${order.orderStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="Delivered" ${order.orderStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
                </select>
            </td>
            <td>
                <button class="delete-order" data-order-id="${order.orderId}">Delete</button>
            </td>
        `;

        //update action the order status
        row.querySelector(".order-status").addEventListener("change", (event) => {
            updateOrderStatus(order.orderId, event.target.value);
        });

        //deleting the order
        row.querySelector(".delete-order").addEventListener("click", () => {
            deleteOrder(order.orderId);
        });
    };

    const updateOrderStatus = (orderId, status) => {
        const order = orders.find(order => order.orderId === orderId);
        if (order) {
            order.orderStatus = status;
            localStorage.setItem("orders", JSON.stringify(orders));
        }
    };

    const deleteOrder = (orderId) => {
        orders = orders.filter(order=> order.orderId !== orderId);
        localStorage.setItem("orders", JSON.stringify(orders));

        updateOrderTable(); // refreshing the order table after deletion..
    };

    const updateOrderTable =() => {
        orderTable.innerHTML = '';
        orders.forEach(order => {
            addOrderToTable(order);
        });
    };

    //order initialization
    const loadOrders = () => {
        orders.forEach(order => {
            addOrderToTable(order);
        });
    };

    loadOrders(orders);


    // INVENTORY MANAGEMENT...
    const inventoryKey = "inventoryData";
    const inventoryTable = document.querySelector("#inventoryTable tbody");
    const inventoryForm = document.getElementById("inventoryForm");
    const generateInventoryReportButton = document.getElementById("generateInventoryReport");
    
    // Load Inventory Data
    const loadInventory = () => {
        const inventory = JSON.parse(localStorage.getItem(inventoryKey)) || [];
        displayInventory(inventory);
    };
    
    // Display Inventory Items in Table
    const displayInventory = (inventory) => {
        inventoryTable.innerHTML = ""; // Clear existing rows
        inventory.forEach((item) => addInventoryToTable(item));
    };
    
    // Add Inventory Item to Table
    const addInventoryToTable = (item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.category}</td>
            <td>${item.quantity} Kg</td>
            <td>${item.reorderLevel} Kg</td>
            <td>${item.restockDate || "N/A"}</td>
            <td>${item.storageLocation || "N/A"}</td>
            <td>
                <button class="edit-item" data-category="${item.category}">Edit</button>
                <button class="delete-item" data-category="${item.category}">Delete</button>
            </td>
        `;
    
        // Edit and Delete Actions
        row.querySelector(".edit-item").addEventListener("click", () => editInventoryItem(item));
        row.querySelector(".delete-item").addEventListener("click", () => deleteInventoryItem(item.category));
    
        inventoryTable.appendChild(row);
    };
    
    // Save Inventory Item
    const saveInventoryItem = (item) => {
        const inventory = JSON.parse(localStorage.getItem(inventoryKey)) || [];
        const existingIndex = inventory.findIndex((i) => i.category === item.category);
    
        if (existingIndex >= 0) {
            inventory[existingIndex] = item; // Update existing category
        } else {
            inventory.push(item); // Add new category
        }
    
        localStorage.setItem(inventoryKey, JSON.stringify(inventory));
        loadInventory();
    };
    
    // Edit Inventory Item
    const editInventoryItem = (item) => {
        document.getElementById("productCategory").value = item.category;
        document.getElementById("quantity").value = item.quantity;
        document.getElementById("reorderLevel").value = item.reorderLevel;
        document.getElementById("restockDate").value = item.restockDate || "";
        document.getElementById("storageLocation").value = item.storageLocation || "";
    };
    
    // Delete Inventory Item
    const deleteInventoryItem = (category) => {
        const inventory = JSON.parse(localStorage.getItem(inventoryKey)) || [];
        const updatedInventory = inventory.filter((item) => item.category !== category);
        localStorage.setItem(inventoryKey, JSON.stringify(updatedInventory));
        loadInventory();
    };
    
    // Submit Inventory Form
    inventoryForm.addEventListener("submit", (event) => {
        event.preventDefault();
    
        const category = document.getElementById("productCategory").value;
        const quantity = parseFloat(document.getElementById("quantity").value);
        const reorderLevel = parseFloat(document.getElementById("reorderLevel").value);
        const restockDate = document.getElementById("restockDate").value;
        const storageLocation = document.getElementById("storageLocation").value;
    
        // Validate Quantity (Ensure it is a positive number)
        if (quantity <= 0) {
            alert("Quantity must be a positive value.");
            return;
        }
    
        const inventoryItem = { category, quantity, reorderLevel, restockDate, storageLocation };
    
        saveInventoryItem(inventoryItem);
        
        inventoryForm.reset(); // Reset the form after submission
    });
    
    // Generate Inventory Report
    generateInventoryReportButton.addEventListener("click", () => {
        const inventory = JSON.parse(localStorage.getItem(inventoryKey)) || [];
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
    
        doc.setFontSize(16);
        doc.text("Inventory Report", 10, 10);
    
        let yPosition = 20;
        inventory.forEach((item) => {
            doc.text(
                `Category: ${item.category}, Quantity: ${item.quantity} Kg, Reorder Level: ${item.reorderLevel} Kg, Restock Date: ${item.restockDate || "N/A"}, Storage Location: ${item.storageLocation || "N/A"}`,
                10,
                yPosition
            );
            yPosition += 10;
        });
    
        if (inventory.length === 0) {
            doc.text("No inventory data available.", 10, yPosition);
        }
    
        doc.save("Inventory_Report.pdf");
    });
    
    // Load inventory on page load
    loadInventory();


    //FINANCIAL ANALYSIS SECTION
    const totalIncomeElement = document.getElementById("totalIncome");
    const totalExpensesElement = document.getElementById("totalExpenses");
    const taxAppliedElement = document.getElementById("taxApplied");
    const netProfitElement = document.getElementById("netProfit");
    const generateReportButton = document.getElementById("generateFinancialReport");

    const ordersInfo = "orders";
    const budgetInfo = "currentBudget";

    // Financial Data Calculation
    const calculateFinancials = () => {
        const purchases = JSON.parse(localStorage.getItem(purchasesInfo)) || [];
        const orders = JSON.parse(localStorage.getItem(ordersInfo)) || [];
        const currentBudget = parseFloat(localStorage.getItem(budgetInfo)) || 0;

        // Calculate Total Expenses (from Purchases)
        const totalExpenses = purchases.reduce((sum, purchase) => sum + purchase.totalCost, 0);

        // Calculate Total Income (from Orders)
        const totalIncome = orders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0);

        // Calculate Tax (e.g., 15% of income)
        const taxRate = 0.15;
        const taxApplied = totalIncome * taxRate;

        // Calculate Net Profit
        const netProfit = totalIncome - totalExpenses - taxApplied;

        // Update the DOM
        totalIncomeElement.textContent = `$${totalIncome.toFixed(2)}`;
        totalExpensesElement.textContent = `$${totalExpenses.toFixed(2)}`;
        taxAppliedElement.textContent = `$${taxApplied.toFixed(2)}`;
        netProfitElement.textContent = `$${netProfit.toFixed(2)}`;
    };

    // Generate Financial Report as PDF
    const generateFinancialReport = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Fetch current values
        const totalIncome = totalIncomeElement.textContent;
        const totalExpenses = totalExpensesElement.textContent;
        const taxApplied = taxAppliedElement.textContent;
        const netProfit = netProfitElement.textContent;
        const currentBudget = `$${(parseFloat(localStorage.getItem(budgetInfo)) || 0).toFixed(2)}`;

        // Title
        doc.setFontSize(16);
        doc.text("Financial Analysis Report", 10, 10);

        // Financial Summary
        doc.setFontSize(12);
        doc.text(`Total Income: ${totalIncome}`, 10, 30);
        doc.text(`Total Expenses: ${totalExpenses}`, 10, 40);
        doc.text(`Tax Applied: ${taxApplied}`, 10, 50);
        doc.text(`Net Profit: ${netProfit}`, 10, 60);
        doc.text(`Current Budget: ${currentBudget}`, 10, 70);

        // Save PDF
        doc.save("Financial_Analysis_Report.pdf");
    };

  
    generateReportButton.addEventListener("click", generateFinancialReport);
    calculateFinancials();


    //DETAILED REPORT....
    const exportDetailedReportButton = document.getElementById("exportDetailedReport");

    const exportDetailedReport = () => {
        const purchases = JSON.parse(localStorage.getItem(purchasesInfo)) || [];
        const orders = JSON.parse(localStorage.getItem(ordersInfo)) || [];
        const categoryStock = JSON.parse(localStorage.getItem(categoryStockInfo)) || {};

        // Initialize jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Title
        doc.setFontSize(16);
        doc.text("Detailed Report", 10, 10);

        // Section 1: Inventory Details
        doc.setFontSize(14);
        doc.text("Inventory Details", 10, 20);

        let yPosition = 30;
        Object.entries(categoryStock).forEach(([category, { quantity }]) => {
            doc.text(`${category}: ${quantity} units`, 10, yPosition);
            yPosition += 10;
        });

        if (Object.keys(categoryStock).length === 0) {
            doc.text("No inventory data available.", 10, yPosition);
            yPosition += 10;
        }

        // Section 2: Sales Details
        doc.text("Sales Details", 10, yPosition + 10);
        yPosition += 20;

        if (orders.length > 0) {
            orders.forEach((order) => {
                doc.text(
                    `Order ID: ${order.orderId}, Category: ${order.productCategory}, Quantity: ${order.quantityOrdered}, Total Price: $${order.totalPrice}`,
                    10,
                    yPosition
                );
                yPosition += 10;
            });
        } else {
            doc.text("No sales data available.", 10, yPosition);
            yPosition += 10;
        }

        // Section 3: Financial Analysis
        doc.text("Financial Analysis", 10, yPosition + 10);
        yPosition += 20;

        const totalIncome = orders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0);
        const totalExpenses = purchases.reduce((sum, purchase) => sum + purchase.totalCost, 0);
        const taxRate = 0.15;
        const taxApplied = totalIncome * taxRate;
        const netProfit = totalIncome - totalExpenses - taxApplied;

        doc.text(`Total Income: $${totalIncome.toFixed(2)}`, 10, yPosition);
        doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`, 10, yPosition + 10);
        doc.text(`Tax Applied: $${taxApplied.toFixed(2)}`, 10, yPosition + 20);
        doc.text(`Net Profit: $${netProfit.toFixed(2)}`, 10, yPosition + 30);

        // Save the PDF
        doc.save("Detailed_Report.pdf");
    };

    // Add event listener for the button
    exportDetailedReportButton.addEventListener("click", exportDetailedReport);



    //...SEARCHING METHODS...
    //farmer searching by name || location..
    const searchFarmers = (query) => {
        const rows = document.querySelectorAll("#farmerTable tbody tr");
        rows.forEach((row) => {
            const name = row.children[1].textContent.toLowerCase();
            const location = row.children[3].textContent.toLowerCase();
            row.style.display = name.includes(query) || location.includes(query) ? "" : "none";
        });
    };

    document.querySelector("input[data-search='farmersInfo']").addEventListener("input", (event) =>  {
        searchFarmers(event.target.value.toLowerCase());
    });


    //order search
    const searchOrder = (query) => {
        const rows = document.querySelectorAll("#orderTable tbody tr");
        rows.forEach((row)  => {
            const customerName = row.children[1].textContent.toLowerCase();
            const productCategory = row.children[4].textContent.toLowerCase();
            const orderStatus = row.children[7].textContent.toLowerCase();
            row.style.display = customerName.includes(query) || productCategory.includes(query) || orderStatus.includes(query) ? "" : "none";

        });
    };

    document.querySelector("input[data-search='searchOrder']").addEventListener("input", (event) => {
        searchOrder(event.target.value.toLowerCase());
    });
    
    
    
    
    
    
/*    //CHECK THESE CODES WHEN YOU ARE FREE!!!


// Satış raporu - Gelir Kategorileri
const generateSalesReport = () => {
    const categories = {};
    
    orders.forEach(order => {
        if (!categories[order.productCategory]) {
            categories[order.productCategory] = { unitsSold: 0, revenue: 0 };
        }
        categories[order.productCategory].unitsSold += order.quantityOrdered;
        categories[order.productCategory].revenue += parseFloat(order.totalPrice);
    });
    
    console.log('Sales Report: ', categories);
    
    // Raporu görsel hale getirebilirsiniz burada, örn: bar chart, pie chart vb.
    
    return categories;
};

// Satış raporunu PDF formatında dışa aktarma
const exportSalesReportToPDF = () => {
    const report = generateSalesReport();
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const headers = ['Category', 'Units Sold', 'Revenue'];
    const rows = Object.keys(report).map(category => [
        category, 
        report[category].unitsSold, 
        `$${report[category].revenue.toFixed(2)}`
    ]);
    
    doc.autoTable({ head: [headers], body: rows });
    doc.save('sales_report.pdf');
};

// Satış raporunu PDF'e aktarma butonunu bağlama
document.getElementById('exportOrdersPDF').addEventListener('click', exportSalesReportToPDF);*/




    
});



