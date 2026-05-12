const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '../.env' }); // load from parent folder
require('dotenv').config(); // load from current folder if any

let db_url = process.env.DATABASE_URL;

const sequelize = new Sequelize(db_url, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: db_url && db_url.includes('supabase') ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

module.exports = sequelize;
