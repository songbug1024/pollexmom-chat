/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/5/9
 */
var RestMVC = require('rest-mvc');
var Model = require('../models/chat-group-member');

module.exports = RestMVC.Collection.extend({
  name: 'ChatGroupMember',
  plural: 'chat-group-members',
  model: Model,
  comparator: 'id',
  mastersUrl: function () {
    var groupId = this.groupId;
    if (!groupId) {
      return console.error('Collection \'' + this.name + '\' groupPublicRecordUrl groupId is invalid.');
    }

    var queryString = this.qWhere({status: 1, groupId: groupId, roleName: RestMVC.Settings.roles.dietitian})
      .qOrder({displayName: 'DESC'})
      .qEnd();

    return this.urlRoot() + '?' + queryString;
  },
  membersUrl: function (sinceId) {
    var groupId = this.groupId;
    if (!groupId) {
      return console.error('Collection \'' + this.name + '\' groupPublicRecordUrl groupId is invalid.');
    }

    this.qWhere({status: 1, groupId: groupId, roleName: RestMVC.Settings.roles.member});
    if (sinceId) {
      this.qWhere({id: {lt: sinceId}});
    }

    var queryString = this.qLimit(RestMVC.Settings.pageSize)
      .qOrder({displayName: 'DESC'})
      .qEnd();

    return this.urlRoot() + '?' + queryString;
  }
});