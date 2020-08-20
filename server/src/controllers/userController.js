// The userController, which handles request specifically requiring the user identity to accomplish

let firebaseDBController = require('../modles/FirebaseDBController');

module.exports = {

    // The user register request, which triggers the register user action of the firebaseDBController and sends response based on the database response
    userRegister: (req, res) => {
        if (req.body.email === undefined || req.body.password === undefined)
          res.send({error: "register user failed: invalid input"});

        firebaseDBController
            .registerUser(
                req.body.email,
                req.body.password,
                req.body.name)
            .then((resp) => {
                res.send({
                    success:resp.success,
                    message:resp.msg
                });
            })
    },

    // The create review request, which triggers the create review action of the firebaseDBController and sends response based on the database response
    createReview: (req, res) => {

        firebaseDBController
            .createReview(req.headers.authorization.split(' ')[1], req.body.review, req.body.rating, req.body.time_created, req.body.storeId)
            .then((response) => {
                res.send(response.msg);
                response.success ? res.status(200) : res.status(400);
            })
            .catch((e) => { console.error(e)});
    },

    // The delete review request, which triggers the delete review action of the firebaseDBController and sends response based on the database response
    deleteReview: (req, res) => {
        firebaseDBController
            .deleteReview(req.headers.authorization.split(' ')[1], req.body.reviewId)
            .then((response) => {
                res.send(response.msg);
                response.success ? res.status(200) : res.status(400);
            })
            .catch((e) => { console.error(e)});
    },

    // The edit review request, which triggers the edit review action of the firebaseDBController and sends response based on the database response
    editReview: (req, res) => {
        firebaseDBController
            .editReview(req.headers.authorization.split(' ')[1], req.body.reviewId, req.body.review, req.body.time_created)
            .then((response) => {
                res.send(response.msg);
                response.success ? res.status(200) : res.status(400);
            })
            .catch((e) => { console.error(e)});
    }
}