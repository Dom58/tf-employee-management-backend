'use strict';
module.exports = (sequelize, DataTypes) => {
  const Employee = sequelize.define('Employee', {
    name: DataTypes.STRING,
    national_id: DataTypes.BIGINT, 
    phone_number: DataTypes.BIGINT, 
    email: DataTypes.STRING , 
    date_birth: DataTypes.DATE,
    status: DataTypes.STRING,
    position: DataTypes.STRING
  }, {});
  Employee.associate = function(models) {
    // associations can be defined here
  };
  return Employee;
};
