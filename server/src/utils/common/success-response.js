const success = ( data,message = "successfully completed the request") => {
  return {
    success: true,
    message: message,
    data,
    error: {}
  }
}

module.exports = success;