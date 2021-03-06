'use strict';

const boom = require('boom');
const express = require('express');
const jwt = require('jsonwebtoken');
const knex = require('../knex');
const { camelizeKeys, decamelizeKeys } = require('humps');
const ev = require('express-validation');
const validations = require('../validations/favorites');

// eslint-disable-next-line new-cap
const router = express.Router();

const authorize = function(req, res, next) {
  jwt.verify(req.cookies.token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(boom.create(401, 'Unauthorized'));
    }

    req.token = decoded;
    next();
  });
};

router.get('/favorites', authorize, (req, res, next) => {
  const { userId } = req.token;

  knex('favorites')
    .innerJoin('books', 'books.id', 'favorites.book_id')
    .where('favorites.user_id', userId)
    .orderBy('books.title', 'ASC')
    .then((rows) => {
      const favorites = camelizeKeys(rows);

      res.send(favorites);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/favorites/:id', authorize, (req, res, next) => {
  const id = parseInt(req.query.bookId, 10);
  if (Number.isNaN(id)) {
    throw boom.create(400, 'Book ID must be an integer');
  }
  knex('favorites')
    .innerJoin('books', 'books.id', 'favorites.book_id')
    .where('favorites.book_id', req.query.bookId)
    .orderBy('books.title', 'ASC')
    .then((rows) => {
      const favorites = camelizeKeys(rows);

      if (favorites.length === 0) {
        throw res.send(false);
      }

      res.send(true);
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/favorites', authorize, ev(validations.post), (req, res, next) => {
  const { bookId } = req.body;
  const favorite = { bookId, userId: req.token.userId };

  knex('favorites')
    .insert(decamelizeKeys(favorite), '*')
    .then((row) => {
      favorite.id = row[0].id;

      res.send(favorite);
    })
    .catch((err) => {
      next(err);
    });
});

router.delete('/favorites', authorize, (req, res, next) => {
  const { bookId } = req.body;
  let favorites;

  knex('favorites')
    .where('book_id', bookId)
    .first()
    .then((row) => {
      if (!row) {
        throw boom.create(404, 'Favorite not found');
      }

      favorites = camelizeKeys(row);

      return knex('favorites')
        .del()
        .where('favorites.book_id', bookId);
    })
    .then(() => {
      delete favorites.id;

      res.send(favorites);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
