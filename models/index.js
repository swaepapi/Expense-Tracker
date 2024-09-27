'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};



let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Read all models in the models directory, except for this index.js file
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file)); // Load the model file
    if (typeof model.init === 'function') {
      model.init(sequelize, Sequelize.DataTypes); // Initialize the model with sequelize
    }
    db[model.name] = model; // Add the model to the db object
  });

// Call the associate function on each model if it exists
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.User = require('./user')(sequelize, Sequelize.DataTypes);
db.Expenses = require('./expenses')(sequelize, Sequelize.DataTypes);

// Add sequelize and Sequelize to the db object for export
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
