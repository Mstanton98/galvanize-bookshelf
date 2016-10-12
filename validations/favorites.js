'use strict';

const Joi = require('joi');

module.exports.post = {
  body: {
    book_id: Joi.number()
      .integer()
      .min(0)
      .label('Book ID')
      .required(),
    user_id: Joi.number()
      .integer()
      .min(0)
      .label('User ID')
      .required()
  }
};
