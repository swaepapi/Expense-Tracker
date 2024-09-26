'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('expenses', 'date', {
      allowNull: false,
      type: Sequelize.DATEONLY,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('expenses', 'date');
  }
  
};
