'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    // Cadastrar o registro na tabela "Users"
    return queryInterface.bulkInsert('Users', [
      {
        name: 'Paulo',
        email: 'paulo@email.com',
        situationId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Paulo 2',
        email: 'paulo2@email.com',
        situationId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 3',
        email: 'paulo3@email.com',
        situationId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 4',
        email: 'paulo4@email.com',
        situationId: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 5',
        email: 'paulo5@email.com',
        situationId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 6',
        email: 'paulo6@email.com',
        situationId: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 7',
        email: 'paulo7@email.com',
        situationId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 8',
        email: 'paulo8@email.com',
        situationId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 9',
        email: 'paulo9@email.com',
        situationId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 10',
        email: 'paulo10@email.com',
        situationId: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 11',
        email: 'paulo11@email.com',
        situationId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 12',
        email: 'paulo12@email.com',
        situationId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 13',
        email: 'paulo13@email.com',
        situationId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 14',
        email: 'paulo14@email.com',
        situationId: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 15',
        email: 'paulo15@email.com',
        situationId: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 16',
        email: 'paulo16@email.com',
        situationId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 17',
        email: 'paulo17@email.com',
        situationId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 18',
        email: 'paulo18@email.com',
        situationId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 19',
        email: 'paulo19@email.com',
        situationId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 20',
        email: 'paulo20@email.com',
        situationId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 21',
        email: 'paulo21@email.com',
        situationId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 22',
        email: 'paulo22@email.com',
        situationId: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 23',
        email: 'paulo23@email.com',
        situationId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 24',
        email: 'paulo24@email.com',
        situationId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 25',
        email: 'paulo25@email.com',
        situationId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 26',
        email: 'paulo26@email.com',
        situationId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 27',
        email: 'paulo27@email.com',
        situationId: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 28',
        email: 'paulo28@email.com',
        situationId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 29',
        email: 'paulo29@email.com',
        situationId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        name: 'Paulo 30',
        email: 'paulo30@email.com',
        situationId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Paulo 31',
        email: 'paulo31@email.com',
        situationId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },

  async down(queryInterface, Sequelize) {

  }
};
