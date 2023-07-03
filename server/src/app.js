const express = require("express");
const morgan = require('morgan');
const createError = require('http-errors');
const xssClean = require('xss-clean');
const rateLimit = require('express-rate-limit');
const userRouter = require("./routers/userRouter");
const seedRouter = require("./routers/seedRouter");
const { errorResponse } = require("./controllers/responseController");

const app = express();

const rateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute,
    max: 5,
    message: "Too many request from this IP. Please try again later",
});

app.use(rateLimiter);
app.use(xssClean());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRouter);
app.use("/api/seed", seedRouter);

app.get("/", (req, res) => {
    res.status(200).send({
        message: "api testing is working fine",
    });
});

// client error handling 
app.use((req, res, next) => {
    next(createError(404, "route not found"));
})

// server error handling -> All the errors
app.use((err, req, res, next) => {

    return errorResponse(res, {
        statusCode: err.status,
        message: err.message
    });
});

module.exports = app;


