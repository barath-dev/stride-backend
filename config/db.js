const {Sequelize} = require("sequelize");

const config = require("./config");

// console.log(config);

const sequelize = new Sequelize(config["production"]);

// console.log(sequelize);



module.exports = sequelize;