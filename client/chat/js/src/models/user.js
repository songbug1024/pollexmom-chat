/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/5/9
 */
var _ = require('underscore');
var RestMVC = require('rest-mvc');

module.exports = RestMVC.Model.extend({
  name: 'User',
  plural: 'users',
  weChatUrl: function (relations) {
    var weChatId = this.get('weChatId');

    if (!weChatId) {
      return console.error('Model \'' + this.name + '\' weChatUrl weChatId is invalid.');
    }

    relations = relations || ['personalInfo', 'settings'];

    var queryString = this.qWhere({status: 1, weChatId: weChatId})
      .qIncludes(relations)
      .qEnd();

    return this.urlRoot() + '/findOne?' + queryString;
  }
});