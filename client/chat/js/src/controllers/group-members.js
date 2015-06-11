/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/5/23
 */
var RestMVC = require('rest-mvc');
var _ = require('underscore');
var async = require('async');
var GroupMembersPageView = require('../views/group-members-page');

module.exports = {
  index: function () {
    var groupMembersPageView = new GroupMembersPageView();

    return groupMembersPageView;
  }
};