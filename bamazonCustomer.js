var inquirer = require('inquirer');
var mysql = require('mysql');

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
        console.log('PRODUCTS FOR SALE');
        console.log('===========');
        for (var i = 0; i < results.length; i++) {
            console.log(results[i].product_name + ' || Price: $' + results[i].price + ' || ID: ' + results[i].id);
            console.log('---------');
        }
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
        connection.query('SELECT * FROM products WHERE id LIKE ' + data.id, function(error, results, fields) {
            if (error) {
                console.log('Sorry, none of our records match this product ID.');
                newPurchase();
            } else {
                // if (data.)
            }


        });
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
        }
    });
}