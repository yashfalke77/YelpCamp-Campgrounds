const express = require('express');
const router = express.Router();
const category = require('../controllers/category')

router.get('/', category.index)

router.get('/:id', category.showCamp)


module.exports = router