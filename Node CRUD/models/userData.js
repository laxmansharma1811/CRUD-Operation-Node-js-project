const { DataTypes } = require("sequelize")
const sequelize = require('../db')

const UserData = sequelize.define('UserData', {
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  profession: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'UserData'
});

// You might want to define associations or other model-specific configurations here

module.exports = UserData;
