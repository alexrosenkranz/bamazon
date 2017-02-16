var inquirer = require('inquirer');
var mysql = require('mysql');
var table = require('console.table');


var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'bamazon_db'
});

connection.connect();

function supervisorMenu() {
    inquirer.prompt([{
        type: "list",
        name: "action",
        message: "What do you want to do, Mrs. Supervisor?",
        choices: [
            "View Product Sales by Department",
            new inquirer.Separator(),
            "Create New Department",
        ]
    }]).then(function(data) {

        switch (data.action) {
            case "View Product Sales by Department":
                productSales();
                break;
            case "Create New Department":
                createDept();
                break;
        }
    });
}

supervisorMenu();

function productSales() {
    connection.query('SELECT departments.id, department_name, over_head_costs, SUM(products.price * sales.quantity_purchased) AS product_sales, (SUM(products.price * sales.quantity_purchased) - over_head_costs) AS total_profit FROM departments, products, sales WHERE products.id = sales.product_id AND departments.id = products.department_id GROUP BY departments.id', function(error, results, fields) {
        if (error) return error;
        console.log('Sales by department.');
        console.log('===========');
        console.table(results);
        console.log('===========');
        returnToMenu();
    });

}

function createDept() {
    connection.query('SELECT department_name FROM departments', function(error, res, fields) {
        let deptList = [];
        for (var i = 0; i < res.length; i++) {
            deptList.push(res[i].department_name);
        }

        inquirer.prompt([{
            type: 'input',
            name: 'name',
            message: "What is this department's name?",
            validate: function(value) {
                return !deptList.includes(value) ? true : "Name is already taken!";
            }
        }, {
            type: 'input',
            name: 'costs',
            message: "What's the overhead cost of running this department?",
            validate: function(value) {
                var regexp = /^\d+$/;
                return regexp.test(value.toLowerCase()) ? true : "Please enter a number, no letters.";
            }
        }]).then(function(data) {
            connection.query('INSERT INTO departments SET ?', {
                department_name: data.name.toLowerCase(),
                over_head_costs: data.costs
            }, function(errors, results, fields) {
                if (error) return error;
                console.log("Department " + data.name + " successfully created!");
                console.log('===========');
                returnToMenu();
            });
        });
    });
}

function returnToMenu() {
    inquirer.prompt([{
        type: "confirm",
        name: "purchase",
        message: "Do you want to do more supervisorial things?",
    }]).then(function(data) {

        if (data.purchase) {
            supervisorMenu();
        } else {
            console.log('Enjoy your day!');
            connection.end();
        }
    });
}