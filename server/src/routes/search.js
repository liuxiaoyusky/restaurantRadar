// The search router, which will route to different searcherController actions:
// 1) the default query will be assumed to search many businesses, which then asks the searcherController to take searchByParams action
// 2) the query with business will be assumed to search a particular business, which then asks the searcherController to take searchBusinessInfo action

const express = require('express');
const router = express.Router();

let searcherController = require('../controllers/searchController');

router.get('/', (req, res) => { searcherController.searchByParams(req, res) })

router.get('/business/', (req, res) => { searcherController.searchBusinessInfo(req, res) })

module.exports = router;