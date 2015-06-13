/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/6/6
 */
var RestMVC = require('rest-mvc');
var Util = RestMVC.plugin('util');
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
    this.$el.attr('data-content', this.model.get('content'));
    this.$el.attr('data-content-type', this.model.get('contentType'));
    this.$el.attr('data-created', Util.dateStr2Times(this.model.get('created')));

    this.model.set('content', this.replaceFace2Img(this.model.get('content')));
    return this.frame(this.model.attributes);
  },
  replaceFace2Img: function (content) {
    return content.replace(/\[em_([0-9]*)\]/g,'<img class="face" src="' + RestMVC.Settings.faceIconsRoot + '/$1.gif" />')
  }
});
