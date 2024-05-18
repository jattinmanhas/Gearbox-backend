import * as Joi from "joi";
import { User } from "../../models/user";

export const userRegistrationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
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
    username: Joi.string().alphanum().min(3).max(30), // Alphanumeric, min 3, max 30 chars
    email: Joi.string().email(), // Valid email format,
    password: Joi.string().min(6).required(),  // Minimum 6 characters, required
  }).or('username', 'email').required(); // username or email only one is required...
  

