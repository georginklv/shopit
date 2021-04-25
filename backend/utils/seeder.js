const Product = require('../models/product');
const dotenv = require('dotenv');
const connectDatebase = require('../config/database');

const products = require('../data/product');
const { connect } = require('../app');
const connectDatabase = require('../config/database');

// Setting dotenv file
dotenv.config({ path: 'backend/config/config.env' })

connectDatabase();

const seedProducts = async () => {
  try {
    await Product.deleteMany();
    console.log('Products are deleted');

    await Product.insertMany(products)
    console.log('All Products are added');

    process.exit();

  } catch (error) {
    console.error(error.massage);
    process.exit();
  }
}

seedProducts();