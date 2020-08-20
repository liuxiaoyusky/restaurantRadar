// The searchController, which is responsible for handling request to get business/ businesses information

const yelpDBController = require('../modles/YelpDBController');
const firebaseDBController = require('../modles/FirebaseDBController');

module.exports = {

    // usage: handle the client request and respond based on the query parameter
    // example: localhost:8081/  will return default 10 businesses in st. louis
    // example: localhost:8081/search/  will return default 10 businesses in st. louis
    // example: localhost:8081/search/?location=new york&limit=2 gives 2 businesses in New York
    // if no parameters are requested, the response would be the default 10 businesses in st. louis
    // if parameters are requested but do not contain location or (longitude + latitude), the response would be the default 10 businesses in st. louis
    searchByParams: (req, res) => {
        if (req.query === undefined || isEmpty(req.query)) {
            req.query = {
                latitude: 38.6270,
                longitude: -90.1994,
                limit: 10
            }
        }

        yelpDBController
            .getBusinesses(req)
            .then(json => {
                json.success ? res.status(200) : res.status(400);
                res.send(json.msg);
            })

    },

    // usage: handle the client request and respond based on the query parameter
    // example: localhost:8081/search/business?id=<bizId> will respond the business information, who has the corresponding bizId
    // The response contains the bizInfo as well as the bizReview
    // The bizInfo is fetched from the yelpDBController's getBusinessInfo action
    // The bizReview combines both the reviews from the Yelp API and the reviews from the user in the database.
    // Thus, the reviews will be fetched using the yelpDBController's getBusinessReview action and the firebaseDBController's getUserInfo action
    searchBusinessInfo: (req, res) => {
        if (req.query.id === undefined) {
            res.status(400);
            res.send({error: "query businesses failed: invalid query parameter"});
        }
        else {

            Promise
                .all([
                    yelpDBController.getBusinessInfo(req.query.id),
                    yelpDBController.getBusinessReview(req.query.id),
                    firebaseDBController.getUserInfo()
                ])
                .then((values) => {

                    values[0].success && values[1].success && values[2].success ? res.status(200) : res.status(400);

                    let yelpReview = values[1].msg.reviews.map(x => {
                        return {
                            uid: x.user.id,
                            userName: x.user.name,
                            content: x.text,
                            rating: x.rating,
                            timeStamp: x.time_created,
                            reviewId:x.id
                        }});

                    const firebaseJson = values[2].msg.uid;

                    let firebaseReview = [];
                    Object.keys(firebaseJson).forEach(v => {
                        if (firebaseJson[v].reviews !== undefined && firebaseJson[v].reviews !== null) {
                            Object.keys(firebaseJson[v].reviews).forEach((reviewId) => {
                                let reviewInfo = firebaseJson[v].reviews[reviewId];
                                if (reviewInfo !== undefined && reviewInfo !== null && reviewInfo.storeId.localeCompare(req.query.id) === 0) {
                                    firebaseReview.push({
                                        uid: v,
                                        userName: firebaseJson[v].displayName,
                                        content: reviewInfo.review,
                                        rating: reviewInfo.rating,
                                        timeStamp: reviewInfo.time_created,
                                        reviewId:reviewId
                                    })
                                }
                            })
                        }
                    });

                    res.send({
                        bizInfo: values[0].msg,
                        bizReview: yelpReview.concat(firebaseReview)
                    });

                })
                .catch( e => {
                    res.status(400);
                    res.send("Unable to perform query quest");
                })
        }
    },
}

// https://coderwall.com/p/_g3x9q/how-to-check-if-javascript-object-is-empty
function isEmpty(obj) {
    for(let key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}