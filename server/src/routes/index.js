// The index router, which serves as the default query and will route to the searcherController

const express = require('express');
const router = express.Router();

let searcherController = require('../controllers/searchController');

router.get('/', (req, res) => { searcherController.searchByParams(req, res) });

module.exports = router;