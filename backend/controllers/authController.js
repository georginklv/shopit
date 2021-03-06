const User = require('../models/user');

const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// Register a user => /api/v1/register
exports.registerUser = catchAsyncErrors( async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name, 
    email, 
    password,
    avatar: {
      public_id: 'dfgdfg',
      url: 'dfgdfg'
    }
  })

  sendToken(user, 200, res);
})

// Login User => /api/v1/login
exports.loginUser = catchAsyncErrors( async (req, res, next) => {
  const { email, password } = req.body;

  // Checks if email and password is entered by user
  if(!email || !password) {
    return next(new ErrorHandler('Please enter email and password', 400));
  }

  // Finding user in DB =>
  const user = await User.findOne({email}).select('+password')

  if(!user) {
    return next(new ErrorHandler('Invalid email or password', 401));
  }

  // Checks if pass is correct or not
  const isPasswordMatched = await user.comparePassword(password)

  if(!isPasswordMatched) {
    return next(new ErrorHandler('Invalid email or password', 401));
  }
  sendToken(user, 200, res);
})

// Forgot password => /api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors( async (req, res, next) => {
  const user = await User.findOne({email: req.body.email})

  if(!user) {
    return next(new ErrorHandler('Usere not found with this email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false })

  // Create resest password url
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;

  const message = `Your password reset Token is as folow:\n\n${resetUrl}\n\nIf you have not requsted this email, then ignore it.`

  try {
    await sendEmail({
      email: user.email,
      subject: 'ShopIT Password Recovery',
      message
    })

    res.status(200).json({
      success: true,
      message: `Email sent to: ${user.email}`
    })
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resestPasswordExpire = undefined;

    await user.save ({ validateBeforeSave: false});

    return next(new ErrorHandler(error.message, 500))
  }
})

// Reset password => /api/v1/password/reset/:token
exports.resetPassword = catchAsyncErrors( async (req, res, next) => {
  // Hash URL token 
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

  const user = await User.findOne({
    resetPasswordToken, 
    resestPasswordExpire: { $gt: Date.now() }
  })

  if(!user) {
    return next(new ErrorHandler('Password reset token is invali or expired', 400))
  }

  if(req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler('Password does not match', 400))
  }

  // Set up new password
  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resestPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
})

// Logout user => /api/v1/logout
exports.logout = catchAsyncErrors( async (req, res, next) => {
  res.cookie('token', null, { 
    expires: new Date(Date.now()),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out'
  })
})