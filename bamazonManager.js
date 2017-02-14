var inquirer = require('inquirer');
var mysql = require('mysql');
var Table = require('cli-table');
var color = require('colors');
var productList = [];

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'bamazon_db'
});

connection.connect();

function managerMenu() {
    inquirer.prompt([{
        type: "list",
        name: "action",
        message: "What do you want to do, Mr. Manager?",
        choices: [
            "View Products for Sale",
            new inquirer.Separator(),
            "View Low Inventory",
            new inquirer.Separator(),
            "Add To Inventory",
            new inquirer.Separator(),
            "Add New Product"
        ]
    }]).then(function(data) {
        console.log(data.action);
        switch (data.action) {
            case "View Products for Sale":
                showProducts();
                break;
            case "View Low Inventory":
                lowInventory();
                break;
            case "Add To Inventory":
                updateInventory();
                break;
            case "Add New Product":
                addProduct();
                break;
        }
    });
}

managerMenu();

function showProducts() {
    var table = new Table({
        head: ['Id', 'Product Name', 'Price', 'Qty'],
    });
    connection.query('SELECT id, product_name, price, stock_quantity FROM products', function(error, results, fields) {
        if (error) throw error;

        console.log('PRODUCTS FOR SALE');
        console.log('===========');
        for (var i = 0; i < results.length; i++) {
            table.push([results[i].id, results[i].product_name, results[i].price, results[i].stock_quantity]);
        }
        console.log(table.toString());
        returnToMenu();
    });
}

function lowInventory() {
    var table = new Table({
        head: ['Id', 'Product Name', 'Price', 'Qty'],
    });
    connection.query('SELECT id, product_name, price, stock_quantity FROM products WHERE stock_quantity < 5', function(error, results, fields) {
        if (error) throw error;

        console.log('PRODUCTS FOR SALE');
        console.log('===========');
        for (var i = 0; i < results.length; i++) {
            table.push([results[i].id, results[i].product_name, results[i].price, results[i].stock_quantity]);
        }
        console.log(table.toString());
        returnToMenu();
    });
}



function updateInventory() {

    connection.query('SELECT product_name FROM products', function(error, results, fields) {
        if (error) throw error;
        productList = [];
        for (var i = 0; i < results.length; i++) {
            productList.push(results[i].product_name);
        }
        inquirer.prompt([{
            type: "list",
            name: "product",
            message: "What product do you want to add stock to?",
            choices: productList
        }, {
            type: 'input',
            name: 'quantity',
            message: 'How much of this product do you want to add?',
            validate: function(value) {
                var regexp = /^\d+$/;
                return regexp.test(value) ? true : "Please enter a number, no letters.";
            }
        }]).then(function(data) {
            let productPicked = data.product;
            connection.query('SELECT id, product_name, stock_quantity FROM products WHERE product_name = "' + productPicked + '"', function(error, results, fields) {

                let selectedProduct = results[0];
                let amountAdded = parseInt(selectedProduct.stock_quantity) + parseInt(data.quantity);
                connection.query('UPDATE products SET stock_quantity = ' + amountAdded + ' WHERE id = ' + selectedProduct.id, function(error, results, fields) {
                    if (error) throw error;

                    console.log('Stock for ' + selectedProduct.product_name + ' has been updated!');
                    returnToMenu();
                });

            });
        });
    });
}

function addProduct() {
    inquirer.prompt([{
        type: "input",
        name: "name",
        message: "What is the name of your product?",
    }, {
        type: "list",
        name: "dept",
        message: "What department does your product belong to?",
        choices: ["Home Automation", "Music", "Sporting Equipment"]
    }, {
        type: "input",
        name: "price",
        message: "What is the price of your product?",
    }, {
        type: "input",
        name: "quantity",
        message: "How much of this product do you have (quantity)?",
    }]).then(function(data) {
        let dept;
        if (data.dept == "Home Automation") {
            dept = 1;
        } else if (data.dept == "Music") {
            dept = 2;
        } else if (data.dept == "Sporting Equipment") {
            dept = 3;
        }
        console.log(dept);
        connection.query('INSERT INTO products (product_name, department_id, price, stock_quantity) VALUES ("' + data.name + '",' + dept + ',' + data.price + ',' + data.quantity + ')', function(error, results, fields) {
            if (error) return error;
            console.log('New product (' + data.name + ') created!');
            returnToMenu();
        });

    });
}

function returnToMenu() {
    inquirer.prompt([{
        type: "confirm",
        name: "purchase",
        message: "Do you want to do more managerial things?",
    }]).then(function(data) {

        if (data.purchase) {
            managerMenu();
        } else {
            console.log('Enjoy your day!');
            connection.end();
        }
    });
}