/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/5/9
 */
var _ = require('underscore');
var RestMVC = require('rest-mvc');

module.exports = RestMVC.Model.extend({
  name: 'ChatGroupMember',
  plural: 'chat-group-members',
  userGroupUrl: function () {
    var userId = this.get('userId');
    var groupId = this.get('groupId');
    if (!userId || !groupId) {
      return console.error('Model \'' + this.name + '\' userGroupUrl userId or groupId is invalid.');
    }

    var queryString = this.qWhere({status: 1, userId: userId, groupId: groupId}).qEnd();
    return this.urlRoot() + '/findOne?' + queryString;
  }
});