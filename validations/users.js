'use strict';

const Joi = require('joi');

module.exports.post = {
  body: {
    first_name: Joi.string()
      .label('First name')
      .trim()
      .required()
      .min(0),
    last_name: Joi.string()
      .label('Last name')
      .trim()
      .required()
      .min(0),
    email: Joi.string()
      .label('Email')
      .required()
      .trim()
      .email()
      .min(2)
    password: Joi.string()
      .label('Password')
      .trim()
      .requred()
      .min(8)
  }
}
