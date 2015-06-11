/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/5/23
 */
var RestMVC = require('rest-mvc');
var _ = require('underscore');
var async = require('async');
var localStorage = RestMVC.plugin('storage').localStorage;

var GroupMembersPageView = require('../views/group-members-page');
var GroupMemberCollection = require('../collections/chat-group-member');

module.exports = {
  index: function () {
    var groupId = this.user.groupId;
    var groupMembersPageView = new GroupMembersPageView();
    var groupInfo = localStorage.getJSON(RestMVC.Settings.locals.userGroupInfo);

    if (groupInfo) {
      groupMembersPageView.frameData.groupName = groupInfo.name;
    }

    async.parallel([
      function loadMasters(callback) {
        var masterCollection = new GroupMemberCollection();
        masterCollection.groupId = groupId;
        masterCollection.url = masterCollection.mastersUrl();

        masterCollection.fetch(function (err) {
          if (err) {
            return callback(err);
          }
          callback(null, this);
        });
      },
      function loadMembers(callback) {
        var memberCollection = new GroupMemberCollection();
        memberCollection.groupId = groupId;
        memberCollection.url = memberCollection.membersUrl();

        memberCollection.fetch(function (err) {
          if (err) {
            return callback(err);
          }
          callback(null, this);
        });
      }
    ], function (err, results) {
      if (err) {
        return groupMembersPageView.error(err);
      }
      groupMembersPageView.render({masters: results[0], members: results[1]});
    })
    return groupMembersPageView;
  }
};