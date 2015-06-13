/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/6/6
 */
var RestMVC = require('rest-mvc');
var _ = require('underscore');
var $ = require('jquery');
var IndexController = require('../controllers/index');
var QQFaceView = require('./qqface');

module.exports = RestMVC.View.extend({
  name: 'IndexPageChatBar',
  role: 'footer',
  parts: {},
  events: {
    'tap .send-msg-btn': 'sendMsgBtnEvent',
    'tap .add-face': 'addFaceBtnEvent',
    'blur .msg-input': 'msgInputBlurEvent',
    'focus .msg-input': 'msgInputFocusEvent'
  },
  initialize: function () {
  },
  render: function (data) {
    // TODO
    return this;
  },
  sendMsgBtnEvent: function (e) {
    var self = this;
    var $msgInputEl = this.$el.find('.msg-input');
    var msgValue = $msgInputEl.val();

    if (!msgValue) {
      return console.warn('sendMsgBtnEvent: msg is empty.');
    }
    $msgInputEl.val('');
    this.hideFooterMore();

    var app = pollexmomChatApp;
    var user = app.user;
    var tempId = new Date().getTime();
    var msg = {
      displayName: user.username,
      avatar: user.avatar,
      roleName: user.roleName,
      groupId: user.groupId,
      senderId: user.memberInfo.id,
      senderUserId: user.id,
      content: _.escape(msgValue),
      contentType: RestMVC.Settings.contentTypes.text,
      messageType: RestMVC.Settings.messageTypes.public
    };

    this.trigger('sendingMsg', tempId, msg);//ion-ios-refresh-empty
    app.action('index.sendMsg', msg, function (err, msg) {
      if (err) {
        return self.trigger('sendMsgError', tempId, err);
      }
      self.trigger('sendMsgSuccess', tempId, msg);
    });
  },
  addFaceBtnEvent: function (e) {
    var $el = this.$el;
    var $footerMoreEl = $el.find('.footer-more');
    var expanded = $el.hasClass('expanded');
    if (expanded) {
      // do hide
      this.hideFooterMore();
    } else {
      this.showFooterMore();

      if (!this.qqFaceView) {
        this.qqFaceView = new QQFaceView();
        $footerMoreEl.append(this.qqFaceView.render().el);
      }
      this.qqFaceView.show(this.faceItemHandler());
    }
    this.trigger('addFaceBtnEvent', expanded);
  },
  msgInputBlurEvent: function () {
    var self = this;
    setTimeout(function () {self.trigger('msgInputBlur');}, 500);
  },
  msgInputFocusEvent: function (e) {
    var self = this;
    setTimeout(function () {self.trigger('msgInputFocus');}, 500);
  },
  faceItemHandler: function () {
    var self = this;
    return function (text) {
      var $msgInputEl = self.$el.find('.msg-input');
      var val = $msgInputEl.val();
      $msgInputEl.val(val + text);

//      self.qqFaceView.hide();
//      self.hideFooterMore();
    }
  },
  hideFooterMore: function () {
    var $el = this.$el;
    var $footerMoreEl = $el.find('.footer-more');

    $el.removeClass('expanded');
    $footerMoreEl.children('.active').removeClass('active');
    this.trigger('footerExpand', false);
  },
  showFooterMore: function () {
    var $el = this.$el;
    $el.addClass('expanded');
    this.trigger('footerExpand', true);
  }
});
