"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("products", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.STRING,
      },
      price: {
        type: Sequelize.INTEGER,
      },
      weight: {
        type: Sequelize.INTEGER,
      },
      imageUrl: {
        type: Sequelize.STRING,
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      booked_stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("products");
  },
};
