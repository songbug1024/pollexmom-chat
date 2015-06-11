/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/6/6
 */
var RestMVC = require('rest-mvc');
var _ = require('underscore');
var template = require('../templates/member-item.tpl');

module.exports = RestMVC.View.extend({
  name: 'GroupMemberPageItem',
  role: 'list-item',
  template: _.template(template),
  tagName: 'li',
  className: 'item item-avatar item-icon-right',
  events: {
  },
  initialize: function (options) {
    var isMaster = this.model.get('isMaster');
    if (isMaster) {
      this.$el.addClass('master');
    }
  },
  render: function () {
    return this.frame(this.model.attributes);
  }
});