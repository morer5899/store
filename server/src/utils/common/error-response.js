const error = (err,message="something went wrong at server") => {
  return {
    success: false,
    message: message,
    data: {},
    error: {
      statusCode:err.statusCode,
      explanation:err.explanation || err.message
    }
  }
}

module.exports = error;