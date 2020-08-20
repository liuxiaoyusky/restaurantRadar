// The user router, which will route to different userController actions:
// 1) the query with register will route to register a new user
// 2) the query with createReview will route to create a review
// 3) the query with deleteReview will route to delete a review
// 4) the query with editReview will route to edit a review

const express = require('express');
const router = express.Router();

let userController = require('../controllers/userController');

router.post('/register', (req, res) => { userController.userRegister(req, res) })

router.post('/createReview', (req, res) => { userController.createReview(req, res) })

router.post('/deleteReview', (req, res) => { userController.deleteReview(req, res) })

router.post('/editReview', (req, res) => { userController.editReview(req, res) })

module.exports = router;