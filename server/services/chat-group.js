/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/6/6
 */
var async = require('async');
var _ = require('underscore');
var app = require('../server');
var config = require('../config.json');
var Service = {};

Service.joinGroup = function (userId, callback) {
  var ChatGroup = app.models.ChatGroup;
  var User = app.models.user;
  var ChatGroupMember = app.models.ChatGroupMember;

  async.auto({
    loadUser: function (callback) {
      User.findById(userId, callback);
    },
    findLastGroup: [function (callback) {
      ChatGroup.findOne({order: 'created DESC', where: {status: 1}}, callback);
    }],
    verifyGroupMemberNum: ['findLastGroup', function (callback, results) {
      var group = results.findLastGroup;
      var groupSizeLimit = config.chat.groupSizeLimit;

      if (!group || group.memberNum >= groupSizeLimit) {
        async.auto({
          createGroup: function (callback) {
            ChatGroup.create({
              name: '新建组'
            }, callback);
          },
          loadAllMasters: function (callback) {
            User.find({
              fields: {
                id: true,
                username: true,
                avatar: true,
                desc: true,
                roleName: true
              },
              where: {
                status: 1,
                roleName: config.roles.dietitian
              }
            }, callback);
          },
          saveMastersAsMembers: ['createGroup', 'loadAllMasters', function (callback, results) {
            var group = results.createGroup;
            var masters = results.loadAllMasters;
            var tasks = [];

            _.map(masters, function (master) {
              tasks.push(function (callback) {
                ChatGroupMember.create({
                  groupId: group.id,
                  isMaster: true,
                  displayName: master.username,
                  avatar: master.avatar,
                  desc: master.desc,
                  roleName: master.roleName,
                  userId: master.id
                }, callback);
              });
            });

            async.parallelLimit(tasks, config.async.parallelLimit, callback);
          }],
          updateMemberNum: ['createGroup', 'loadAllMasters', function (callback, results) {
            var group = results.createGroup;
            var masters = results.loadAllMasters;

            group.updateAttribute('memberNum', group.memberNum + masters.length, callback);
          }]
        }, function (err, results) {
          callback(err, results ? results.updateMemberNum : undefined);
        });
      } else {
        callback(null, group);
      }
    }],
    joinGroup: ['loadUser', 'verifyGroupMemberNum', function (callback, results) {
      var user = results.loadUser;
      var group = results.verifyGroupMemberNum;

      if (!user) {
        return callback(new Error('JoinGroup error, user is invalid.'));
      }

      ChatGroupMember.create({
        groupId: group.id,
        isMaster: false,
        displayName: user.username,
        avatar: user.avatar,
        desc: user.desc,
        roleName: user.roleName,
        userId: userId
      }, callback);
    }],
    updateUserGroup: ['loadUser', 'verifyGroupMemberNum', 'joinGroup', function (callback, results) {
      var user = results.loadUser;
      var group = results.verifyGroupMemberNum;

      if (!user) {
        return callback(new Error('JoinGroup error, user is invalid.'));
      }
      user.updateAttribute('groupId', group.id, callback);
    }],
    updateMemberNum: ['loadUser', 'verifyGroupMemberNum', 'joinGroup', function (callback, results) {
      var group = results.verifyGroupMemberNum;

      group.updateAttribute('memberNum', group.memberNum + 1, callback);
    }]
  }, function (err, results) {
    callback(err, results.updateMemberNum, results.updateUserGroup);
  });
}

module.exports = Service;
