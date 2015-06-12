/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/6/6
 */
var RestMVC = require('rest-mvc');
var _ = require('underscore');
var IndexController = require('../controllers/index');
var ChatMsgView = require('./index-page-chat-msg');
var ChatMsgModel = require('../models/chat-message');

module.exports = RestMVC.View.extend({
  name: 'IndexPageContent',
  role: 'content',
  parts: {},
  events: {
  },
  initialize: function (options) {
    var self = this;
    var chatBarView = options.chatBarView;

    this.listenTo(chatBarView, 'sendingMsg', this.appendMsg);
    this.listenTo(chatBarView, 'sendMsgError', this.markMsgError);
    this.listenTo(chatBarView, 'sendMsgSuccess', this.markMsgSuccess);

    pollexmomChatApp.socket.on('public msg', function (msg) {
      self.appendMsg(msg.id, msg);
    });
  },
  render: function (data) {
    if (!data) return console.error('View ' + this.name + ': render data is invalid.');

    var $scrollEl = this.$el.find('.messages');
    var msgCollection = data.msgCollection;
    msgCollection.each(function (model) {
      $scrollEl.append(new ChatMsgView({model: model, _id: model.id}).render().el);
    });

    var scrollView = new ionic.views.Scroll({
      el: this.el
    });
    var max = scrollView.getScrollMax();
    scrollView.scrollTo(max.left, max.top, false);
    return this;
  },
  appendMsg: function (tempId, msg) {
    var $scrollEl = this.$el.find('.messages');
    var model = new ChatMsgModel(msg);
    var msgView = new ChatMsgView({model: model, _id: tempId}).render();

    msgView.$el.append('<i class="send-status icon ion-ios-refresh-empty"></i>');
    msgView.$el.addClass('processing');
    $scrollEl.append(msgView.el);
  },
  markMsgError: function (tempId, err) {
    var $msgEl = this.$el.find('.message.mine[data-id=' + tempId + ']');
    var $statusEl = $msgEl.find('.send-status');

    $msgEl.removeClass('processing');
    $statusEl.addClass('assertive');
  },
  markMsgSuccess: function (tempId, msg) {
    var $msgEl = this.$el.find('.message.mine[data-id=' + tempId + ']');
    var $statusEl = $msgEl.find('.send-status');

    $msgEl.attr('data-id', msg.id);
    $statusEl.remove();
  }
});
