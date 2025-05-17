const {Sequelize} = require("sequelize");

const config = require("./config");

// console.log(config);

const sequelize = new Sequelize(config["development"]);

// console.log(sequelize);



module.exports = sequelize;