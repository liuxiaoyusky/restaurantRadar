// The Yelp controller, which talks to the Yelp Fusion API and fetch corresponding data

const yelp = require('yelp-fusion');
const client = yelp.client("YOUR_YELP_FUSION_API_KEY");

const QUERY = new Set(['term', 'location', 'latitude', 'longitude', 'radius', 'categories',
    'locale', 'limit', 'offset', 'sort_by', 'price', 'open_now', 'open_at', 'attributes']);


module.exports = {

    // The get businesses action, which gets the search results based on the query input.
    getBusinesses: (req) => {

        const queryParams = constructQueryParams(req);
        if (queryParams === undefined)
            return {error: "invalid query parameter"};
        else {
            return client
                .search(queryParams)
                .then(res => {
                    return {
                        success: true,
                        msg: res.jsonBody.businesses} })
                .catch(e => {
                    console.error(e);
                    return {
                        success: false,
                        msg: e.message};
                })
        }
    },

    // The action to get the information of a certain business based on the input biz id
    getBusinessInfo: (id) => {
        return client.business(id)
            .then(res => {
                return {
                    success: true,
                    msg: res.jsonBody
                }})
            .catch(e => {
                console.error(e);
                return {
                    success: false,
                    msg: e.message}
            })
    },

    // The action to get the information of a certain business based on the input biz id
    getBusinessReview: (id) => {
        return client.reviews(id)
            .then(res => {
                return {
                    success: true,
                    msg: res.jsonBody
                } })
            .catch(e => {
                console.error(e);
                return {
                    success: false,
                    msg: e.message}
            })
    }
}

// Helper function to construct the query dictionary.
// Based on the pass in query string, parse all valid query parameter and construct the query dictionary
// if the pass in req string is invalid, then the default location (st. louis city) will be used for query
function constructQueryParams(req) {
    let queryParams = {};
    for (let queryKey in req.query) {
        if (QUERY.has(queryKey)) {
            if (queryKey.localeCompare('latitude') === 0
                || queryKey.localeCompare('longitude') === 0)
                queryParams[queryKey] = parseFloat(req.query[queryKey])
            else if (queryKey.localeCompare('radius') === 0
                || queryKey.localeCompare('limit') === 0
                || queryKey.localeCompare('offset') === 0
                || queryKey.localeCompare('open_at') === 0)
                queryParams[queryKey] = parseInt(req.query[queryKey])
            else if (queryKey.localeCompare('open_now') === 0)
                queryParams[queryKey] = queryKey.localeCompare('true') === 0
            else {
                if (req.query[queryKey] !== undefined && req.query[queryKey] !== null && req.query[queryKey].length > 0) {
                    queryParams[queryKey] = req.query[queryKey]
                }
            }
        }
        else {
            return undefined;
        }
    }

    if (queryParams.hasOwnProperty('location') ||
        (queryParams.hasOwnProperty('latitude') && queryParams.hasOwnProperty('longitude'))) {
        return queryParams;
    }

    return {
        latitude: 38.6270,
        longitude: -90.1994,
        limit: 10
    };
}