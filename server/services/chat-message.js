/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/6/6
 */
var async = require('async');
var app = require('../server');
var config = require('../config.json');
var Service = {};

Service.saveMessage = function (msg, callback) {
  var ChatMessage = app.models.ChatMessage;

  // TODO
  ChatMessage.create(msg, callback);
}

Service.revokeMessage = function (data, callback) {
  var ChatMessage = app.models.ChatMessage;
  var msgId = data.msgId;
  var userId = data.userId;

  if (!data || !msgId || !userId) return callback(new Error('RevokeMessage data is invalid.'));
  async.auto({
    verifyMsg: function (callback) {
      ChatMessage.findById(msgId, function (err, msg) {
        if (err || !msg) return callback(err);

        if (msg.senderUserId != userId) return callback(new Error('No permission revoke other member\'s msg.'));

        var created = (new Date(msg.created)).getTime();
        var nowTimes = (new Date()).getTime();
        var msgRevokeLimit = config.chat.msgRevokeLimit;
        var couldBeRevoked = created + msgRevokeLimit >= nowTimes;

        if (!couldBeRevoked) {
          callback(new Error('Msg revoke timeout.'));
        } else {
          callback(null, msg);
        }
      });
    },
    doRevoke: ['verifyMsg', function (callback, results) {
      var msg = results.verifyMsg;

      msg.updateAttributes({
        status: ChatMessage.allStatus.revoked, // revoked
        modified: Date.now()
      }, callback);
    }]
  }, function (err, results) {
    if (err) return callback(err);
    callback(null, results.doRevoke);
  })
}

module.exports = Service;