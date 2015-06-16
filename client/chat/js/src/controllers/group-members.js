/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/5/23
 */
var RestMVC = require('rest-mvc');
var _ = require('underscore');
var async = require('async');
var localStorage = RestMVC.plugin('storage').localStorage;
var sessionStorage = RestMVC.plugin('storage').sessionStorage;
var Common = require('../plugins/common');
var GroupMembersPageView = require('../views/group-members-page');
var GroupMemberCollection = require('../collections/chat-group-member');
var ForwardMembersView = require('../views/forward-members');
var UserSettingsModel = require('../models/user-settings');

var Controller = module.exports = {
  __loadMasterAndMember: function (options, callback) {
    var groupId = this.user.groupId;
    options = _.extend({
      master: {
        order: RestMVC.Settings.defaults.membersOrder,
        orderBy: RestMVC.Settings.defaults.membersOrderBy
      },
      member: {
        sinceId: null,
        order: RestMVC.Settings.defaults.membersOrder,
        orderBy: RestMVC.Settings.defaults.membersOrderBy
      }
    }, options);

    async.parallel([
      function loadMasters(callback) {
        var masterCollection = new GroupMemberCollection();
        var queryOptions = {};
        var orderBy = options.master.orderBy;
        var order = options.master.order;

        masterCollection.groupId = groupId;
        masterCollection.comparator = masterCollection[orderBy + order];
        queryOptions.order = {};
        queryOptions.order[orderBy] = order;
        masterCollection.url = masterCollection.mastersUrl(queryOptions);
        masterCollection.fetch(function (err) {
          if (err) {
            return callback(err);
          }
          callback(null, this);
        });
      },
      function loadMembers(callback) {
        var memberCollection = new GroupMemberCollection();
        var queryOptions = {};
        var orderBy = options.member.orderBy;
        var order = options.member.order;

        memberCollection.groupId = groupId;
        memberCollection.comparator = memberCollection[orderBy + order];
        queryOptions.order = {};
        queryOptions.order[orderBy] = order;
        memberCollection.url = memberCollection.membersUrl(options.member.sinceId, queryOptions);

        memberCollection.fetch(function (err) {
          if (err) {
            return callback(err);
          }
          callback(null, this);
        });
      }
    ], function (err, results) {
      if (err) {
        return callback(err);
      }
      callback(null, {masters: results[0], members: results[1]});
    })
  },
  index: function () {
    var userSettings = this.user.settings;
    var groupMembersPageView = new GroupMembersPageView();
    var groupInfo = localStorage.getJSON(RestMVC.Settings.locals.userGroupInfo);
    var order = userSettings && userSettings.groupListOrder;
    var orderBy = userSettings && userSettings.groupListOrderBy;

    if (groupInfo) groupMembersPageView.frameData.groupName = groupInfo.name;
    if (order) groupMembersPageView.frameData.order = order;
    if (orderBy) groupMembersPageView.frameData.orderBy = orderBy;

    Controller.__loadMasterAndMember.call(this, {
      master: {
        order: groupMembersPageView.frameData.order,
        orderBy: groupMembersPageView.frameData.orderBy
      },
      member: {
        order: groupMembersPageView.frameData.order,
        orderBy: groupMembersPageView.frameData.orderBy
      }
    }, function (err, data) {
      if (err) {
        return groupMembersPageView.error(err);
      }
      groupMembersPageView.render(data);
    });
    return groupMembersPageView;
  },
  resort: function (data, callback) {
    var self = this;
    // task 1: refresh data
    Controller.__loadMasterAndMember.call(this, {
      master: {
        order: data.order,
        orderBy: data.orderBy
      },
      member: {
        order: data.order,
        orderBy: data.orderBy
      }
    }, function (err, data) {
      if (err) {
        return callback(err);
      }
      callback(null, data);

      // update cache
      localStorage.setJSON(RestMVC.Settings.locals.groupMasters, data.masters.toJSON());
      localStorage.setJSON(RestMVC.Settings.locals.groupMembers, data.members.toJSON());
    });

    // task 2: update user settings
    var user = this.user;
    var userSettingModel = new UserSettingsModel({
      id: user.settings && user.settings.id ? user.settings.id : undefined,
      userId: user.id,
      groupListOrder: data.order,
      groupListOrderBy: data.orderBy
    });
    userSettingModel.url = userSettingModel.relationUrl('users');
    userSettingModel.save(function (err) {
      if (err) {
        return Common.toast('更新配置失败');
      }
      // update user info
      user.settings = this.attributes;
      sessionStorage.setJSON(RestMVC.Settings.locals.weChatUserData, user);
    });
  },
  loadMoreMembers: function (data, callback) {
    var sinceId = data.sinceId;
    var sinceDatas = data.sinceDatas;
    var user = this.user;
    var memberCollection = new GroupMemberCollection();
    var queryOptions = {};
    var orderBy = user.settings && user.settings.groupListOrderBy || RestMVC.Settings.defaults.membersOrderBy;
    var order = user.settings && user.settings.groupListOrder || RestMVC.Settings.defaults.membersOrder;

    memberCollection.groupId = user.groupId;
    memberCollection.comparator = memberCollection[orderBy + order];
    queryOptions.order = {};
    queryOptions.order[orderBy] = order;
    queryOptions.sinceData = sinceDatas[orderBy];
    memberCollection.url = memberCollection.membersUrl(sinceId, queryOptions);
    memberCollection.fetch(function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, this);
    });
  },
  forwardMembers: function (msg, callback) {
    var groupId = this.user.groupId;
    var forwardMembersView = new ForwardMembersView({msg: msg});

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
  }
};