/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/6/6
 */
var RestMVC = require('rest-mvc');
var _ = require('underscore');
var IndexController = require('../controllers/index');

module.exports = RestMVC.View.extend({
  name: 'IndexPageChatBar',
  role: 'footer',
  parts: {},
  events: {
    'click .send-msg-btn': 'sendMsgBtnEvent'
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
      content: msgValue,
      contentType: RestMVC.Settings.contentTypes.text,
      messageType: RestMVC.Settings.messageTypes.public
    };

    this.trigger('sendingMsg', tempId, msg);
    app.action('index.sendMsg', msg, function (err, msg) {
      if (err) {
        return self.trigger('sendMsgError', tempId, err);
      }
      self.trigger('sendMsgSuccess', tempId, msg);
    });
  }
});