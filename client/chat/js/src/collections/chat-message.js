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