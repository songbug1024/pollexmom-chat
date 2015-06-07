/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/6/6
 */
var async = require('async');
var app = require('../server');
var config = require('../config.json');
var Service = {};

Service.joinGroup = function (userId, callback) {
  var ChatGroup = app.models.ChatGroup;
  var user;

  async.waterfall([
    function loadUser(callback) {
      var User = app.models.user;

      User.findById(userId, callback);
    },
    function findLastGroup(_user, callback) {
      if (!_user) {
        return callback(new Error('JoinGroup error, user is invalid.'));
      }
      user = _user;
      ChatGroup.findOne({order: 'created DESC'}, callback);
    },
    function verifyGroupMemberNum(group, callback) {
      var groupSizeLimit = config.chat.groupSizeLimit;

      if (!group || group.memberNum >= groupSizeLimit) {
        ChatGroup.create({
          name: '新建组'
        }, callback);
      } else {
        callback(null, group);
      }
    },
    function joinGroup(group, callback) {
      var ChatGroupMember = app.models.ChatGroupMember;

      ChatGroupMember.create({
        groupId: group.id,
        isMaster: false,
        displayName: user.username,
        avatar: user.avatar,
        desc: user.desc,
        roleName: user.roleName,
        userId: userId
      }, function (err) {
        if (err) {
          return callback(err);
        }
        callback(null, group);
      });
    },
    function updateMemberNumAndUserGroup(group, callback) {
      async.parallel([
        function updateUserGroup(callback) {
          user.updateAttribute('groupId', group.id, callback);
        },
        function updateMemberNum(callback) {
          group.updateAttribute('memberNum', group.memberNum + 1, callback);
        }
      ], function (err) {
        callback(err, group);
      });
    }
  ], function (err, group) {
    callback(err, group, user);
  });
}


module.exports = Service;