/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/6/6
 */
var RestMVC = require('rest-mvc');
var _ = require('underscore');
var template = require('../templates/chat-msg.tpl');

module.exports = RestMVC.View.extend({
  name: 'IndexPageChatMsg',
  role: 'list-item',
  template: _.template(template),
  tagName: 'li',
  className: 'message',
  events: {
  },
  initialize: function (options) {
    this._id = options._id;

    var userId = pollexmomChatApp.user.id;
    var userMemberId = pollexmomChatApp.user.memberInfo.id;
    var senderId = this.model.get('senderId');
    var senderUserId = this.model.get('senderUserId');
    var isMine = userId === senderUserId && userMemberId === senderId;

    this.model.set('isMine', isMine);
    if (isMine) {
      this.$el.addClass('mine');
    }
  },
  render: function () {
    this.$el.attr('data-id', this._id);

    return this.frame(this.model.attributes);
  }
});