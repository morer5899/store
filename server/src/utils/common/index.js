// const error = require("./error-response")
// const success = require("./success-response")

module.exports = {
  ErrorResponse: (err, message = "something went wrong") => ({
    success: false,
    message,
    data: {},
    error: {
      statusCode: err.statusCode,
      explanation: err.explanation || err.message
    }
  }),

  SuccessResponse: (data, message = "successfully completed the request") => ({
    success: true,
    message,
    data,
    error: {}
  }),
};