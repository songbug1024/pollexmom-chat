/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/6/6
 */
var async = require('async');
var app = require('../server');
var Service = {};

Service.saveMessage = function (msg, callback) {
  var ChatMessage = app.models.ChatMessage;

  // TODO
  ChatMessage.create(msg, callback);
}

module.exports = Service;