var inquirer = require('inquirer');
var mysql = require('mysql');
var Table = require('cli-table');
var color = require('colors');

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'bamazon_db'
});

connection.connect();

function queryProducts() {
    connection.query('SELECT id, product_name, price FROM products', function(error, results, fields) {
        if (error) throw error;
        var table = new Table({
            head: ['Id', 'Product Name', 'Price'],
        });
        console.log('PRODUCTS FOR SALE');
        console.log('===========');
        for (var i = 0; i < results.length; i++) {
            table.push([results[i].id, results[i].product_name, results[i].price]);
        }
        console.log(table.toString());
        makePurchase();
    });
}

queryProducts();

function makePurchase() {
    inquirer.prompt([{
        type: 'input',
        name: 'id',
        message: 'What is the ID of the product you would like to purchase?',
        validate: function(value) {
            var regexp = /^\d+$/;
            return regexp.test(value) ? true : "Please enter a number, no letters.";
        }
    }, {
        type: 'input',
        name: 'quantity',
        message: 'How much of this product do you want?',
        validate: function(value) {
            var regexp = /^\d+$/;
            return regexp.test(value) ? true : "Please enter a number, no letters.";
        }
    }]).then(function(data) {
        let id = parseInt(data.id);
        connection.query('SELECT * FROM products WHERE id = ' + id, function(error, results, fields) {
            if (error) {
                console.log('Sorry, none of our records match this product ID.');
                newPurchase();
            } else {
                let selectedProduct = results[0];

                if (data.quantity < selectedProduct.stock_quantity) {
                    let newStock = selectedProduct.stock_quantity - data.quantity;
                    connection.query('UPDATE products SET stock_quantity = ' + newStock + ' WHERE id = ' + id, function(error, results, fields) {
                        console.log('Congrats on your order');
                        addSale(id, data.quantity);
                        newPurchase();
                    });
                } else {
                    console.log("There's not enough in stock to fulfill your order, please try again with a lesser amount or order a different product.");
                    newPurchase();
                }
            }


        });
    });
}

function addSale(product_id, quantity_purchased) {
    connection.query('INSERT INTO sales (product_id, quantity_purchased) VALUES (' + product_id + ',' + quantity_purchased + ')', function(error, results, fields) {
        if (!error) {
            console.log("Sales sheet successfully updated");
        } else {
            console.log("Something went wrong with creating the sale");
        }
    });
}


function newPurchase() {
    inquirer.prompt([{
        type: "confirm",
        name: "purchase",
        message: "Do you want to make another purchase?",
    }]).then(function(data) {

        if (data.purchase) {
            makePurchase();
        } else {
            console.log('Thank you for shopping!');
            connection.end();
        }
    });
}