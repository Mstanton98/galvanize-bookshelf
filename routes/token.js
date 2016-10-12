'use strict';

const boom = require('boom');
const bcrypt = require('bcrypt-as-promised');
const jwt = require('jsonwebtoken');
const express = require('express');
const knex = require('../knex');
const { camelizeKeys } = require('humps');
const ev = require('express-validation');
const validations = require('../validations/token');

const router = express.Router();

router.post('/token', ev(validations.post), (req, res, next) => {
  const { email, password } = req.body;
  let user;

  knex('users')
    .where('email', email)
    .first()
    .then((row) => {
      if (!row) {
        throw boom.create(400, 'Bad email or password');
      }

      user = camelizeKeys(row);

      return bcrypt.compare(password, user.hashedPassword);
    })
    .then(() => {
      delete user.hashedPassword;

      const expiry = new Date(Date.now() + 1000 * 60 * 60 * 3);
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '3h'
      });

      res.cookie('token', token, {
        httpOnly: true,
        expires: expiry,
        secure: router.get('env') === 'production'
      });

      res.send(user);
    })
    .catch(bcrypt.MISMATCH_ERROR, () => {
      throw boom.create(400, 'Bad email or password');
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/token', (req, res) => {
  jwt.verify(req.cookies.token, process.env.JWT_SECRET, (err) => {
    if (err) {
      res.send(false);

      return;
    }
    res.send(true);
  });
});

router.delete('/token', (req, res) => {
  res.clearCookie('token');
  res.send(true);
});

module.exports = router;
