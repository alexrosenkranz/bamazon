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