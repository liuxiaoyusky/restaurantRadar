// The entry point of the sever code.
// The entry point parse the incoming request and redirect to different routers

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = express.Router();

const app = express();
let indexRouter = require('./routes/index');
let searchRouter = require('./routes/search');
let userRouter = require('./routes/user');

app.use(bodyParser.json());
app.use(cors({ origin: true }));
app.use('/', indexRouter);
app.use('/search', searchRouter);
app.use('/user', userRouter);

app.listen(process.env.PORT || 8081);


console.log("Server started!");

module.exports = router;
