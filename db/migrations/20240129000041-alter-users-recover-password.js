'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('Users', 'recoverPassword', {
      type: Sequelize.DataTypes.STRING,
      after: 'password',// Deve ser criada depois da coluna password.
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('Users', 'recoverPassword');
  }
};