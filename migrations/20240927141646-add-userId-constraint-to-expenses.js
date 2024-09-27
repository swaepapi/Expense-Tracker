'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('Expenses', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'Expenses_userId_foreign_idx',
      references: {
        table: 'Users',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Expenses', 'Expenses_userId_foreign_idx');
  }
};
