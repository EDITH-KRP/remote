const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '../.env' }); // load from parent folder
require('dotenv').config(); // load from current folder if any

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase') ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

module.exports = sequelize;
