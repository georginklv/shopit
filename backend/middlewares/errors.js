
const ErrorHandler = require('../utils/errorHandler');

module.exports = (err, req, res, next) => {
  err.statusCode = err.status || 500;

  if (process.env.NODE_ENV === 'DEVELOPMENT') {
    console.log(err);

    res.status(err.statusCode).json({
        success: false,
        error: err,
        errMessage: err.message,
        stack: err.stack
    })
}

  if(process.env.NODE_ENV === 'PRODUCTION'){
    let error= {...err}

    error.message = err.message;

    // Wrong Mongoose obj ID err
    if (err.name === 'CastError') {
      const message = `Resource not found. Invalid: ${err.path}`
      error = new ErrorHandler(message, 400)
    }

    //Handling Mongoose Validation Error
    if(err.name === 'ValidationError'){
      const message = Object.values(err.errors).map(value => value.message);
      error = new Error(message, 400)
    } 

    res.status(error.statusCode).json({
      success: false,
      message: err.message || "Internal server error"
    })
  } 
  
}