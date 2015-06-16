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

    this.qWhere({status: 1, groupId: groupId, messageType: RestMVC.Settings.messageTypes.public});
    if (sinceId) {
      this.qWhere({id: {lt: sinceId}});
    }

    var queryString = this.qLimit(RestMVC.Settings.pageSize)
      .qOrder({id: 'DESC'})
      .qEnd();

    return this.urlRoot() + '?' + queryString;
  },
  groupPrivateRecordUrl: function (sinceId, senderId, receiverId) {
    var groupId = this.groupId;
    if (!groupId) {
      return console.error('Collection \'' + this.name + '\' groupPrivateRecordUrl groupId is invalid.');
    }

    if (!senderId || !receiverId) {
      return console.error('Collection \'' + this.name + '\' groupPrivateRecordUrl senderId or receiverId is invalid.');
    }

    this.qWhere({
      status: 1,
      groupId: groupId,
      messageType: RestMVC.Settings.messageTypes.private,
      or: [
        {
          senderId: senderId,
          receiverId: receiverId
        },
        {
          senderId: receiverId,
          receiverId: senderId
        }
      ]
    });

    if (sinceId) {
      this.qWhere({id: {lt: sinceId}});
    }

    var queryString = this.qLimit(RestMVC.Settings.pageSize)
      .qOrder({id: 'DESC'})
      .qEnd();

    return this.urlRoot() + '?' + queryString;
  }
});
