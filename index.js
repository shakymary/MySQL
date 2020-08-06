require("console.table");
const inquirer = require("inquirer");
const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "coding2020",
  database: "employees_db",
});

connection.connect((err) => {
  if (err) {
    throw err;
  }
  runSearch();
});

function runSearch() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View All Departments",
        "View All Roles",
        "View All Employees",
        "Add Department",
        "Add Role",
        "Add Employee",
        "Update Employee Role",
        "Exit",
      ],
    })
    .then(function (answer) {
      switch (answer.action) {
        case "View All Departments":
          showDepartments();
          break;
        case "View All Roles":
          showRoles();
          break;
        case "View All Employees":
          showEmployees();
          break;
        case "Add Department":
          addDepartment();
          break;
        case "Add Role":
          addRole();
          break;
        case "Add Employee":
          addEmployee();
          break;
        case "Update Employee Role":
          updateEmployeeRole();
          break;
        case "Exit":
        default:
          connection.end();
          break;
      }
    });
}

function showDepartments() {
  connection.query("SELECT * FROM department", function (err, departments) {
    if (err) throw err;
    console.table(departments);
    runSearch();
  });
}

function showRoles() {
  let query =
    "SELECT role.id, title, salary, department.name AS department_name ";
  query +=
    "FROM role INNER JOIN department ON (role.department_id = department.id)";
  connection.query(query, function (err, roles) {
    if (err) throw err;
    console.table(roles);
    runSearch();
  });
}

function showEmployees() {
  let query = `SELECT e.id, e.first_name, e.last_name, role.title AS title, department.name AS department, salary, CONCAT(m.first_name, " ", m.last_name) AS manager
FROM employee e INNER JOIN role ON (e.role_id = role.id) 
INNER JOIN department ON (role.department_id = department.id)
LEFT JOIN employee m ON (e.manager_id = m.id)`;
  connection.query(query, function (err, employees) {
    if (err) throw err;
    console.table(employees);
    runSearch();
  });
}

function addDepartment() {
  inquirer
    .prompt({
      name: "name",
      type: "input",
      message: "What is the department name?",
    })
    .then(function (answer) {
      let query = "INSERT INTO `department` (name) VALUES ?";
      var values = [[answer.name]];
      connection.query(query, [values], function (err, res) {
        if (err) throw err;
        console.log("Added department.");
        runSearch();
      });
    });
}

function addRole() {
  connection.query("SELECT * FROM department", function (err, departments) {
    if (err) throw err;

    inquirer
      .prompt([
        {
          name: "title",
          type: "input",
          message: "What is the role title?",
        },
        {
          name: "salary",
          type: "input",
          message: "What is the role salary?",
        },
        {
          name: "department",
          type: "list",
          message: "What is the role department?",
          choices: departments.map((dep) => ({
            name: dep.name,
            value: dep.id,
          })),
        },
      ])
      .then(function (answer) {
        let query =
          "INSERT INTO `role` (title, salary, department_id) VALUES ?";
        var values = [[answer.title, answer.salary, answer.department]];
        connection.query(query, [values], function (err, res) {
          if (err) throw err;
          console.log("Added role.");
          runSearch();
        });
      });
  });
}

function addEmployee() {
  let roleQuery = `SELECT * FROM role`;
  connection.query(roleQuery, function (err, roles) {
    if (err) throw err;
    let employeeQuery = `SELECT * FROM employee`;
    connection.query(employeeQuery, function (err, employees) {
      if (err) throw err;
      inquirer
        .prompt([
          {
            name: "firstName",
            type: "input",
            message: "What is the employee's first name?",
          },
          {
            name: "lastName",
            type: "input",
            message: "What is the employee's last name?",
          },
          {
            name: "role",
            type: "list",
            message: "What is the employee's role?",
            choices: roles.map((role) => ({
              name: role.title,
              value: role.id,
            })),
          },
          {
            name: "manager",
            type: "list",
            message: "Who is the employee's manager?",
            choices: [
              { name: "None", value: null },
              ...employees.map((emp) => ({
                name: `${emp.first_name} ${emp.last_name}`,
                value: emp.id,
              })),
            ],
          },
        ])
        .then((answer) => {
          let query =
            "INSERT INTO `employee` (first_name, last_name, role_id, manager_id) VALUES ?";
          var values = [
            [answer.firstName, answer.lastName, answer.role, answer.manager],
          ];
          connection.query(query, [values], function (err, res) {
            if (err) throw err;
            console.log("Added employee.");
            runSearch();
          });
        });
    });
  });
}

function updateEmployeeRole() {
  let roleQuery = `SELECT * FROM role`;
  connection.query(roleQuery, function (err, roles) {
    if (err) throw err;
    let employeeQuery = `SELECT * FROM employee`;
    connection.query(employeeQuery, function (err, employees) {
      if (err) throw err;
      inquirer
        .prompt([
          {
            name: "employee",
            type: "list",
            message: "Which employee's role would you like to update?",
            choices: employees.map((emp) => ({
              name: `${emp.first_name} ${emp.last_name}`,
              value: emp.id,
            })),
          },
          {
            name: "role",
            type: "list",
            message: "What is the employee's new role?",
            choices: roles.map((role) => ({
              name: role.title,
              value: role.id,
            })),
          },
        ])
        .then((answer) => {
          let query = `UPDATE employee SET role_id = ? WHERE id = ?`;
          var values = [answer.role, answer.employee];
          connection.query(query, values, function (err, res) {
            if (err) throw err;
            console.log("Updated employee.");
            runSearch();
          });
        });
    });
  });
}
