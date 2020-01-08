'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    national_id: DataTypes.BIGINT, 
    phone_number: DataTypes.STRING, 
    email: DataTypes.STRING , 
    date_birth: DataTypes.DATE,
    status: DataTypes.STRING,
    position: DataTypes.STRING
  }, {});
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};
