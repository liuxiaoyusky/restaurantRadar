// The FireBaseController, which talks to the Firebase and manipulate the data based on the action

const firebase = require('firebase-admin');
const serviceAccount = require('YOUR_GOOGLE_FIREBASE_JSON');
const firebaseName = "YOUR_FIREBASE_NAME";

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: `https://${firebaseName}.firebaseio.com`
});

let db = firebase.database();
let auth = firebase.auth();

let queryUserInfo = db.ref("users");

module.exports = {

    // The register user action, which create a new user in the Firebase authentication and the user info in the database
    registerUser: function (email, password, name) {
        return auth.createUser({
            email: email,
            password: password,
            displayName: name
        })
            .then( (userRecord) => {
                db.ref('users/uid/firebase-' + userRecord.uid).set({
                    displayName: name
                });
                return {
                    success : true,
                    msg: "register successfully"};
            })
            .catch((e) => {
                return {
                    success: false,
                    msg: e.errorInfo.message};
            })
    },

    // The get user information action, which gets all the user information in the database
    getUserInfo: function () {
        return queryUserInfo.once("value")
            .then((snapshot) => {
                return {
                    success: true,
                    msg: snapshot.toJSON()
                };
            })
            .catch((e) => {
                return {
                    success: false,
                    msg: e.errorInfo.message};
            });
    },

    // The create review action, which creates the review in the firebase under the requested user name
    createReview: (token, review, rating, time_created, storeId) => {
        return auth.verifyIdToken(token)
                .then( decodedToken => {
                    let uid = decodedToken.uid;
                    let dbRef = db.ref('users/uid/firebase-' + uid + '/reviews').push();
                    dbRef.set({
                        storeId: storeId,
                        review: review,
                        rating: rating,
                        time_created: time_created
                    })
                    return {
                        success: true,
                        msg: "created successfully"
                    };
                })
                .catch((e) => {
                    return {
                        success: false,
                        msg: e.errorInfo.message};
                });
    },

    // The delete review action, which deletes the corresponding review in the firebase
    deleteReview: (token, reviewId) => {
        return auth.verifyIdToken(token)
            .then(decodedToken => {
                let uid = decodedToken.uid;
                let dbRef = db.ref(`users/uid/firebase-${uid}/reviews/`);
                dbRef.child(`${reviewId}`).remove();
                return {
                    success: true,
                    msg: "deleted successfully"
                };
            })
    },

    // The edit review action, which edits the corresponding review in the firebase
    editReview: (token, reviewId, review, time_created) => {
        return auth.verifyIdToken(token)
            .then(decodedToken => {
                let uid = decodedToken.uid;
                let dbRef = db.ref(`users/uid/firebase-${uid}/reviews/`);

                dbRef.child(`${reviewId}`).update({
                    review: review,
                    time_created: time_created
                });

                return {
                    success: true,
                    msg: "deleted successfully"
                };
            })
    }
};
