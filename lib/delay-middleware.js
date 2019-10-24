"use strict";

var timers = require('timers');

var createDelayer = function createDelayer() {
  return function (req, res, next) {
    var end = res.end;

    if (!req.conf || !req.conf.delay) {
      return next();
    }

    var time = req.conf.delay;

    res.end = function () {
      var args = arguments;
      timers.setTimeout(function () {
        end.apply(res, args);
      }, time);
    };

    next();
  };
};

module.exports = createDelayer;