'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Expenses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
       // Each expense belongs to a User
       Expenses.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  // Initialize the Expenses model with the sequelize instance and DataTypes
  Expenses.init({
    date: {
      allowNull: false,
      type: DataTypes.DATEONLY, 
    },
    description: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    amount: {
      allowNull: false,
      type: DataTypes.FLOAT,
    },
    userId: {  // Add userId as a foreign key to reference Users
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'Users', // Refer to the Users model
        key: 'id',      // Match with the 'id' column in Users
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    }
  }, {
    sequelize, // Make sure the sequelize instance is passed here
    modelName: 'Expenses',
    timestamps: true, // Enable timestamps to automatically handle createdAt and updatedAt
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    defaultScope: {
      attributes: { exclude: ['createdAt', 'updatedAt'] }, // Exclude these fields in queries if needed
    }
  });

  return Expenses; // Return the Expenses model
};
