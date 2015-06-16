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
  initialize: function () {
    var isMaster = this.model.get('isMaster');
    if (isMaster) {
      this.$el.addClass('master');
    } else {
      this.$el.addClass('member');
    }
    this.model.set('isMe', this.model.get('userId') === pollexmomChatApp.user.id);
  },
  render: function () {
    this.$el.attr('data-id', this.model.id);
    this.$el.attr('data-display-name', this.model.get('displayName'));
    this.$el.attr('data-created', this.model.get('created'));
    return this.frame(this.model.attributes);
  }
});