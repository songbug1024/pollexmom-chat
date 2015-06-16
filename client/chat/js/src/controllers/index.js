/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/5/23
 */
var RestMVC = require('rest-mvc');
var _ = require('underscore');
var async = require('async');
var localStorage = RestMVC.plugin('storage').localStorage;

var IndexPageView = require('../views/index-page');
var ChatGroupModel = require('../models/chat-group');
var ChatGroupMemberModel = require('../models/chat-group-member');
var ChatMessageCollection = require('../collections/chat-message');
var ChatMessageModel = require('../models/chat-message');

module.exports = {
  index: function () {
    var user = this.user;
    var groupId = user.groupId;
    var userId = user.id;
    var indexPageView = new IndexPageView();
    var chatMessageCollection = new ChatMessageCollection();
    var charGroupModel = new ChatGroupModel({id: groupId});
    var chatGroupMemberModel = new ChatGroupMemberModel({groupId: groupId, userId: userId});

    async.parallel([
      function loadGroupData(callback) {
        charGroupModel.url = charGroupModel.idUrl();
        charGroupModel.fetch(function (err) {
          if (err) {
            return callback(err);
          }
          callback(null, this);
        });
      },
      function loadMessages(callback) {
        chatMessageCollection.groupId = groupId;
        chatMessageCollection.comparator = chatMessageCollection.idDESC;
        chatMessageCollection.url = chatMessageCollection.groupPublicRecordUrl();
        chatMessageCollection.fetch(function (err) {
          if (err) {
            return callback(err);
          }
          callback(null, this);
        });
      },
      function loadGroupMemberData(callback) {
        chatGroupMemberModel.url = chatGroupMemberModel.userGroupUrl();
        chatGroupMemberModel.fetch(function (err) {
          if (err) {
            return callback(err);
          }
          callback(null, this);
        });
      }
    ], function (err, results) {
      if (err) {
        return indexPageView.error(err);
      }
      localStorage.setJSON(RestMVC.Settings.locals.userGroupInfo, results[0].toJSON());

      user.memberInfo = results[2].attributes;
      indexPageView.render(results);
    })

    this.socket.on('member joined', function (user) {
      indexPageView.trigger('memberJoined', user);
    });
    this.socket.on('msg revoked', function (msgId) {
      indexPageView.trigger('msgRevoked', msgId);
    });
    return indexPageView;
  },
  sendMsg: function (msg, callback) {
    if (!msg || !_.isObject(msg)) return console.error('sendMessage msg is invalid.');

    var socket = this.socket;
    var messageModel = new ChatMessageModel(msg);

    if (!messageModel.isValid()) {
      return callback(messageModel.validationError);
    }

    socket.emit('public msg', msg, callback);
  },
  revokeMsg: function (id, callback) {
    if (!id) return console.error('revokeMsg msg id is invalid.');

    this.socket.emit('revoke msg', {
      msgId: id,
      userId: this.user.id
    }, callback);
  },
  loadMoreMsgs: function (sinceId, callback) {
    var chatMessageCollection = new ChatMessageCollection();

    chatMessageCollection.comparator = chatMessageCollection.idAsc;
    chatMessageCollection.groupId = this.user.groupId;
    chatMessageCollection.url = chatMessageCollection.groupPublicRecordUrl(sinceId);
    chatMessageCollection.fetch(function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, this);
    });
  }
};