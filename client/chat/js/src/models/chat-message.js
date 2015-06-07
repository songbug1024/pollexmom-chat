/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/5/9
 */
var _ = require('underscore');
var RestMVC = require('rest-mvc');

module.exports = RestMVC.Model.extend({
  name: 'ChatMessage',
  plural: 'chat-messages',
  validate: function (attrs) {

  }
});