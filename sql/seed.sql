-- Creates new rows containing data in all named columns --
INSERT INTO `department` (name) VALUES
("dep1"),
("dep2"),
("dep3"),
("dep4");

INSERT INTO `role` (title, salary, department_id) VALUES
("title1", 10000, 1),
("title2", 20000, 1),
("title3", 30000, 2),
("title4", 40000, 3),
("title5", 50000, 4);

INSERT INTO `employee` (first_name, last_name, role_id, manager_id) VALUES
("first1", "last1", 1, NULL),
("first2", "last2", 5, NULL),
("first3", "last3", 3, NULL),
("first4", "last4", 2, NULL),
("first5", "last5", 4, NULL);
