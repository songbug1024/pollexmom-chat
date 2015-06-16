/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/5/9
 */
var RestMVC = require('rest-mvc');
var Model = require('../models/chat-message');

module.exports = RestMVC.Collection.extend({
  name: 'ChatMessage',
  plural: 'chat-messages',
  model: Model,
  comparator: 'id',
  idDESC: function (a, b) {
    return a.id > b.id ? 1 : -1
  },
  idASC: function (a, b) {
    return a.id < b.id ? 1 : -1
  },
  groupPublicRecordUrl: function (sinceId) {
    var groupId = this.groupId;
    if (!groupId) {
      return console.error('Collection \'' + this.name + '\' groupPublicRecordUrl groupId is invalid.');
    }

    this.qWhere({status: 1, groupId: groupId});
    if (sinceId) {
      this.qWhere({id: {lt: sinceId}});
    }

    var queryString = this.qLimit(RestMVC.Settings.pageSize)
      .qOrder({id: 'DESC'})
      .qEnd();

    return this.urlRoot() + '?' + queryString;
  }
});