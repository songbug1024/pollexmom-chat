/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/6/6
 */
var RestMVC = require('rest-mvc');
var _ = require('underscore');
var $ = require('jquery');
var Common = require('../plugins/common');
var ChatMsgView = require('./index-page-chat-msg');
var ChatMsgModel = require('../models/chat-message');

module.exports = RestMVC.View.extend({
  name: 'IndexPageContent',
  role: 'content',
  initialize: function (options) {
    var self = this;

    options = options || {};
    this.chatType = options.chatType || RestMVC.Settings.messageTypes.public;
    this.chatTo = options.chatTo || null;

    if (this.chatType === RestMVC.Settings.messageTypes.public) {

      pollexmomChatApp.socket.on('public msg', function (msg) {
        self.appendMsg(msg.id, msg);
      });

    } else if (this.chatType === RestMVC.Settings.messageTypes.private
      && this.chatTo && this.chatTo.id && this.chatTo.userId) {

      pollexmomChatApp.socket.on('private msg', function (msg) {
        if (self.chatTo.id === msg.receiverId && self.chatTo.userId === msg.receiverUserId) {
          self.appendMsg(msg.id, msg);
        }
      });

    }
    this.on('loadMoreMsgsSuccess', this.loadMoreMsgsSuccess);
  },
  render: function (data) {
    if (!data) return console.error('View ' + this.name + ': render data is invalid.');

    var self = this;
    var scrollView = this.scrollView = Common.scrollView({
      el: this.el,
      usePullToRefresh: true,
      refresherMethods: {
        activate: function () {
          if (self.loadingMore) {
            return;
          }
          self.loadingMore = true;
          self.acceptData = true;
          var sinceId = self.$el.find('.messages .message:first').attr('data-id');
          var data = {sinceId: sinceId};

          if (self.chatType === RestMVC.Settings.messageTypes.private
            && self.chatTo && self.chatTo.id && self.chatTo.userId) {
            data.toId = self.chatTo.id;
            data.toUserId = self.chatTo.userId;
          }
          pollexmomChatApp.action('index.loadMoreMsgs', data, function (err, msgs) {
            if (!self.acceptData) return console.warn('User canceled');
            if (err) {
              Common.notice('刷新失败');
              self.trigger('loadMoreMsgsError', err);
              return setTimeout(function () {scrollView.finishPullToRefresh()}, 300);
            }

            var count = msgs.length;
            if (count > 0) {
              Common.notice('获取到 ' + count + ' 条消息');
            } else {
              Common.notice('无更早的数据');
            }
            self.trigger('loadMoreMsgsSuccess', msgs, sinceId);
            setTimeout(function () {
              scrollView.finishPullToRefresh();
              self.loadingMore = false;
            }, 300);
          });
        },
        deactivate: function () {
          self.acceptData = false;
        }
      }
    });
    // triggerPullToRefresh finishPullToRefresh
    var $scrollEl = this.$el.find('.messages');
    var msgCollection = data.msgCollection;

    msgCollection.each(function (model) {
      $scrollEl.append(new ChatMsgView({model: model, _id: model.id}).render().el);
      scrollView.scrollBottom();
    });

    return this;
  },
  scrollBottom: function () {
    this.scrollView.scrollBottom();
  },
  footerExpand: function (expanded) {
    if (expanded) {
      this.$el.addClass('footer-expanded');
    } else {
      this.$el.removeClass('footer-expanded');
    }
  },
  appendMsg: function (tempId, msg) {
    var $scrollEl = this.$el.find('.messages');
    var model = new ChatMsgModel(msg);
    model.set('created', (new Date()).getTime());

    var msgView = new ChatMsgView({model: model, _id: tempId}).render();

    msgView.$el.append('<i class="send-status icon ion-ios-refresh-empty"></i>');
    msgView.$el.addClass('processing');
    $scrollEl.append(msgView.el);
    this.scrollBottom();
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
  },
  loadMoreMsgsSuccess: function (msgs, sinceId) {
    if (msgs.length > 0) {
      var $lastSinceEl = this.$el.find('.messages .message[data-id="' + sinceId + '"]');
      var $scrollEl = this.$el.find('.messages');
      msgs.each(function (model) {
        $scrollEl.prepend(new ChatMsgView({model: model, _id: model.id}).render().el);
      });

      var offset = $lastSinceEl.offset();
      this.scrollView.scrollTo(offset.left, offset.top);
    }
  }
});
