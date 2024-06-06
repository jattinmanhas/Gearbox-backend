import * as Joi from "joi";

export const userRegistrationSchema = Joi.object({
  username: Joi.string().min(3).max(30).required().messages({
    'any.custom' : 'Invalid username',
  }), // Alphanumeric, min 3, max 30 chars, required, unique(yet to add)
  password: Joi.string().min(6).required(), // Minimum 6 characters, required (ensure proper hashing before storage)
  email: Joi.string().email().required().messages({
    'any.custom' : 'Invalid email',
  }), // Valid email format, required, unique(yet to add)
  name: Joi.string().allow("", null), // Optional string
  mobileNo: Joi.string().length(10).allow("", null), // Optional string
});


export const userLoginSchema = Joi.object({
    username: Joi.string().min(3).max(30), // Alphanumeric, min 3, max 30 chars
    email: Joi.string().email(), // Valid email format,
    password: Joi.string().min(6).required(),  // Minimum 6 characters, required
  }).or('username', 'email').required(); // username or email only one is required...
  

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required() // Valid email formatting and required...
})

export const resetPasswordSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .required()
    .label('Password'),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password')) // Remove unnecessary nesting
    .required()
    .label('Confirm Password')
    .messages({
      'any.only': '{{#label}} does not match the password',
    }),
});



