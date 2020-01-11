# tf-employee-management-backend
This is a backend of an employee management system

## Setup the application
- clone github repo `https://github.com/Dom58/tf-employee-management-backend.git`
- run `npm init` to initialize the node into the application
- run `npm install` to install all dependencies
- run `sequelize init` to initialize a sequelize for ORM database 
- Use Postman to test api on ```localhost:PORT```

## Running the project
- run app `npm run dev` to start the project
- test app `npm run test` to test the application

## Features
* manager should signup. 
* manager should login. 
* manager should create an employee. 
* manager should edit an employee. 
* manager should activate an employee. 
* manager should delete an employee. 
* manager should suspend an employee. 
* manager should forgot & reset his password
* manager should edit his profile

## Prerequisites
  * Node
  * Postman
  * Postgres

### Backend
  * Node
  * Express
  * mocha
  * chai
  * @hapi/joi
  * jsonwebtoken
  * bcrypt
  * swagger
  * sendgrid/mail

  ## API Endpoints

### Version 1 Endpoints

| Method         | Endpoint             | Description  |
| ---         |     ---      |          --- |
| POST   | /manager/signup     | Create an manager   |
| POST     | /manager/login     | Manager Login      |
| GET     | /all/users     | Retrieve All Users      |
| PUT     | /users/profile/:manager_id     | Update manager profile      |
| POST  | /employees     | Create an employee    |
| DELETE     | /employees/:id       | Delete employee      |
| PUT   | /employees/:id    | Update employee   |
| PUT    | /employees/:id/activate      | Activate employee      |
| PUT   | /employees/:id/suspend     | Suspend an employee   |
| GET     | /all/employees      | Get all employee      |
| POST     | /employees/search      | Search employee      |
| POST     | /manager/forgot-password      | Forgot manager password      |
| POST     | /manager/reset-password/:token      | Reset manager password      |



### APIs Endpoints documentation(swagger documentation) test
`http://127.0.0.1:YOUR_PORT/documentation/`


## Author
Ndahimana Dominique Xavier
