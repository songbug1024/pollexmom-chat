/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/5/9
 */
var RestMVC = require('rest-mvc');
var _ = require('underscore');
var Model = require('../models/chat-group-member');

module.exports = RestMVC.Collection.extend({
  name: 'ChatGroupMember',
  plural: 'chat-group-members',
  model: Model,
  displayNameDESC: function (a, b) {
    return a.get('displayName') < b.get('displayName') ? 1 : -1
  },
  displayNameASC: function (a, b) {
    return a.get('displayName') > b.get('displayName') ? 1 : -1
  },
  createdDESC: function (a, b) {
    return a.get('created') < b.get('created') ? 1 : -1
  },
  createdASC: function (a, b) {
    return a.get('created') > b.get('created') ? 1 : -1
  },
  mastersUrl: function (options) {
    options = _.extend({
      order: {displayName: 'DESC'}
    }, options);

    var groupId = this.groupId;
    if (!groupId) {
      return console.error('Collection \'' + this.name + '\' groupPublicRecordUrl groupId is invalid.');
    }

    var queryString = this.qWhere({status: 1, groupId: groupId, roleName: RestMVC.Settings.roles.dietitian})
      .qOrder(options.order)
      .qEnd();

    return this.urlRoot() + '?' + queryString;
  },
  membersUrl: function (sinceId, options) {
    options = _.extend({
      order: {displayName: 'DESC'},
      limit: RestMVC.Settings.pageSize
    }, options);

    var groupId = this.groupId;
    if (!groupId) {
      return console.error('Collection \'' + this.name + '\' groupPublicRecordUrl groupId is invalid.');
    }

    this.qWhere({status: 1, groupId: groupId, roleName: RestMVC.Settings.roles.member});

    var keys = _.keys(options.order);
    var order = options.order[keys[0]];
    var orderBy = keys[0];

    if (sinceId && options.sinceData) {
      var where = {};
      where[orderBy] = (order === 'DESC') ? {lt: options.sinceData} : {gt: options.sinceData};
      where.id = {neq: sinceId};

      this.qWhere(where);
    }

    var queryString = this.qLimit(options.limit)
      .qOrder(options.order)
      .qEnd();

    return this.urlRoot() + '?' + queryString;
  }
});