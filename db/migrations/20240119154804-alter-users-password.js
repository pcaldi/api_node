'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'password', {
      type: Sequelize.DataTypes.STRING,
      after: 'email', // Deve ser criada depois da coluna email.
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Users', 'password')
  }
};
