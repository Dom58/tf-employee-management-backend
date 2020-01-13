'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    national_id: DataTypes.BIGINT, 
    phone_number: DataTypes.BIGINT, 
    email: DataTypes.STRING , 
    date_birth: DataTypes.DATE,
    status: DataTypes.STRING,
    position: DataTypes.STRING,
    password: DataTypes.STRING
  }, {});
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.Employee, {
      as: 'cart',
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    });
  };
  return User;
};
