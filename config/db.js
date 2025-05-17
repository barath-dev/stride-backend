const {Sequelize} = require("sequelize");

const config = require("./config");

const sequelize = new Sequelize(config["production"]);



module.exports = sequelize;