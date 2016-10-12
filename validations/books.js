'use strict';

const Joi = require('joi');

module.exports.post = {
  body: {
    title: Joi.string()
      .min(0)
      .required()
      .trim()
      .label('Title'),
    author: Joi.string()
      .min(0)
      .required()
      .trim()
      .label('Author'),
    genre: Joi.string()
      .min(0)
      .required()
      .trim()
      .label('Genre'),
    description: Joi.string()
      .min(0)
      .requred()
      .trim()
      .label('Description'),
    cover_url: Joi.string()
      .min(0)
      .required()
      .trim()
      .label('Cover URL')
  }
};
