/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/6/6
 */
var RestMVC = require('rest-mvc');
var _ = require('underscore');
var $ = require('jquery');
var Common = require('../plugins/common');
var template = require('../templates/msg-operations.tpl');
var ChatMessageModel = require('../models/chat-message');
var ForwardMembersView = require('./forward-members');

module.exports = RestMVC.View.extend({
  name: 'MsgOperations',
  role: 'popover',
  template: _.template(template),
  className: 'msg-operations',
  events: {
    'tap .bg': 'hide',
    'tap .forward': 'forwardEvent',
    'tap .revoke': 'revokeEvent',
    'tap .delete': 'deleteEvent',
    'tap .clear': 'clearEvent'
  },
  render: function () {
    var self = this;
    this.frame();

    var client = new ZeroClipboard(this.$el.find('.copy'));
    client.on('ready', function (e) {
      client.on('copy', function (e) {
        var clipboard = e.clipboardData;
        var val = '';
        var $msgEl = self.$msgEl;
        if ($msgEl) {
          val = $msgEl.attr('data-content');
        }
        clipboard.setData('text/plain', val);
      });

      client.on('aftercopy', function (e) {
        self.hide();

        Common.toast('已复制');
      });
    });
    client.on('error', function(e) {
      console.error('ZeroClipboard error of type "' + e.name + '": ' + e.message);
      ZeroClipboard.destroy();
    });
    return this;
  },
  setMsg: function ($msgEl) {
    this.$msgEl = $msgEl;
    this.resetMsgModel();
    return this;
  },
  show: function () {
    var $revokeEl = this.$el.find('.revoke');
    var $deleteEl = this.$el.find('.delete');

    if (!this.$msgEl.hasClass('mine')) {
      $revokeEl.addClass('disabled');
      $deleteEl.addClass('disabled');
    } else {
      if (this.model.couldBeRevoked()) {
        $revokeEl.removeClass('disabled');
      } else {
        $revokeEl.addClass('disabled');
      }
      $deleteEl.removeClass('disabled');
    }
    this.$el.addClass('shown');
  },
  hide: function () {
    this.$el.removeClass('shown');
  },
  forwardEvent: function (e) {
    this.hide();
    this.trigger('forwardMsg', this.model);

    var forwardMembersView = new ForwardMembersView();

  },
  revokeEvent: function (e) {
    var $revokeEl = this.$el.find('.revoke');
    if (!$revokeEl.hasClass('disabled')) {
      if (confirm('你确定要撤回该条消息吗?')) {
        this.trigger('revokeMsg', this.model.id);
        this.hide();
      } else {
        this.hide();
      }
    }
  },
  deleteEvent: function (e) {
    var $deleteEl = this.$el.find('.delete');
    if (!$deleteEl.hasClass('disabled')) {
      if (confirm('你确定要删除该条消息吗?')) {
        this.trigger('deleteMsg', this.model.id);
        this.hide();
      } else {
        this.hide();
      }
    }
  },
  clearEvent: function (e) {
    if (confirm('你确定要清除所有消息吗?')) {
      this.trigger('clearMsgs');
      this.hide();
    } else {
      this.hide();
    }
  },
  resetMsgModel: function () {
    var id = this.$msgEl.attr('data-id');
    var content = this.$msgEl.attr('data-content');
    var contentType = this.$msgEl.attr('data-content-type');
    var created = this.$msgEl.attr('data-created');

    this.model = new ChatMessageModel({
      id: id,
      content: content,
      contentType: contentType,
      created: parseInt(created)
    });
    return this.model;
  }
});
