/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/6/6
 */
var RestMVC = require('rest-mvc');
var _ = require('underscore');
var $ = require('jquery');
var Common = require('../plugins/common');
var template = require('../templates/index-page.tpl');
var ChatBarView = require('./index-page-chat-bar');
var ContentView = require('./index-page-content');
var MsgOperationsView = require('./msg-operations');

module.exports = RestMVC.View.extend({
  id: 'index-page',
  name: 'IndexPage',
  role: 'page',
  template: _.template(template),
  className: 'page view',
  parts: {
    groupName: '.group-name'
  },
  frameData: {
    groupName: '聊天室'
  },
  events: {
    'tap .show-group-members': 'showGroupMembersBtnEvent',
    'hold .message .content': 'msgContentHoldEvent'
  },
  initialize: function () {
    // TODO
    this.on('memberJoined', this.onMemberJoined);
    this.on('msgRevoked', this.removeMsgEl);
  },
  render: function (data) {
    if (!data) return console.error('View ' + this.name + ': render data is invalid.');

    var groupModel = data[0];
    this.renderPart('groupName', groupModel.get('name'));

    var msgCollection = data[1];
    var chatBarView = new ChatBarView();
    var contentView = new ContentView();

    contentView.listenTo(chatBarView, 'sendingMsg', contentView.appendMsg);
    contentView.listenTo(chatBarView, 'sendMsgError', contentView.markMsgError);
    contentView.listenTo(chatBarView, 'sendMsgSuccess', contentView.markMsgSuccess);
    contentView.listenTo(chatBarView, 'msgInputBlur', contentView.scrollBottom);
    contentView.listenTo(chatBarView, 'msgInputFocus', contentView.scrollBottom);
    contentView.listenTo(chatBarView, 'addFaceBtnEvent', contentView.scrollBottom);
    contentView.listenTo(chatBarView, 'footerExpand', contentView.footerExpand);

    chatBarView.setElement(this.$el.find('.chat-input-bar'));
    contentView.setElement(this.$el.find('.msg-content'));
    chatBarView.render();
    contentView.render({msgCollection: msgCollection});
    return this;
  },
  showGroupMembersBtnEvent: function (e) {
    var $noticeDotEl = this.$el.find('.notice-dot');
    if ($noticeDotEl.hasClass('active')) {
      $noticeDotEl.removeClass('active');
    }

    pollexmomChatApp.navigate("group-members", {trigger: true})
  },
  onMemberJoined: function (user) {
    var $noticeDotEl = this.$el.find('.notice-dot');
    if (!$noticeDotEl.hasClass('active')) {
      $noticeDotEl.addClass('active');
    }
    $noticeDotEl.attr('data-last-joined', user.userId);
  },
  msgContentHoldEvent: function (e) {
    var $msgEl = $(e.currentTarget);
    if (!this.msgOperationsView) {
      this.msgOperationsView = new MsgOperationsView().render();
      this.listenTo(this.msgOperationsView, 'revokeMsg', this.revokeMsg);
      this.listenTo(this.msgOperationsView, 'deleteMsg', this.deleteMsg);
      this.listenTo(this.msgOperationsView, 'clearMsgs', this.clearMsgs);
      this.$el.append(this.msgOperationsView.el);
    }
    this.msgOperationsView.setMsg($msgEl.parent().parent()).show();
  },
  revokeMsg: function (id) {
    var self = this;

    pollexmomChatApp.action('index.revokeMsg', id, function (err) {
      if (err) {
        Common.toast('撤回失败');
        return self.trigger('revokeMsgError', id, err);
      }

      self.removeMsgEl(id);
      Common.toast('已撤回');
      self.trigger('revokeMsgSuccess', id);
    });
  },
  removeMsgEl: function (id) {
    var $msgEl = this.$el.find('.msg-content .message[data-id="' + id + '"]');
    if (!$msgEl || $msgEl.length <= 0) return;

    var isMine = $msgEl.hasClass('mine');
    Common.animatedRemove($msgEl, isMine ? 'right' : 'left');
  },
  deleteMsg: function (id) {

  },
  clearMsgs: function (id) {

  }
});
