/**
 * @Description: Main
 * @Author: fuwensong
 * @Date: 2015/5/4
 */
var _ = require('underscore');
_.templateSettings = {
  evaluate    : /{{([\s\S]+?)}}/g,
  interpolate : /{{=([\s\S]+?)}}/g,
  escape      : /{{-([\s\S]+?)}}/g
};

var Settings = require('./settings.json');
var RestMVC = require('rest-mvc');
RestMVC.config({
  settings: Settings
});

var sessionStorage = RestMVC.plugin('storage').sessionStorage;
var initWeChatUserPlugin = require('./plugins/init-wechat-user');
var App = require('./app');

(function verifyIO() {
  if (!io) {
    console.warn('io-clint lib has not been loaded!');

    setTimeout(verifyIO, RestMVC.Settings.ioVerifyTimeout);
  } else {

    if (RestMVC.Settings.env === 'debug') {
      console.log('io-clint lib loaded successed!');
    }

    initUserData();
  }
})();

function initUserData() {
  var sessionWeChatUserData = sessionStorage.getJSON(RestMVC.Settings.locals.weChatUserData, null);
  var weChatUserData = window.userWeChatData;

  if (weChatUserData && !_.isEmpty(weChatUserData)) {
    if (!weChatUserData.openid) {
      console.error('initUserData failed');
      return alert('获取微信用户信息失败');
    }

    initWeChatUserPlugin(weChatUserData, startClient);
  } else {
    startClient(null, sessionWeChatUserData);
  }
}

function startClient(err, user) {
  if (err || !user || !user.id) {
    return alert('初始化用户信息失败');
  }

  var socket = io.connect(RestMVC.Settings.socketIORoot);

  socket.emit('join', {userId: user.id, groupId: user.groupId});

  socket.on('ready', function (data) {
    data = data || {};

    if (RestMVC.Settings.env === 'debug') {
      console.log('Socket client ready, data is ' + data);
    }

    if (!data.groupId) {
      console.error('User groupId is invalid.');
      return alert('获取分组信息失败');
    }

    user.groupId = data.groupId;
    socketClientReady(socket, user);
  });
}

function socketClientReady(socket, user) {
  sessionStorage.setJSON(RestMVC.Settings.locals.weChatUserData, user);

  var app = new App();
  app.socket = socket;
  app.user = user;

  RestMVC.start(app, {
    globalName: 'pollexmomChatApp',
    pushState: true,
    root: "/chat/"
  });

  var route = window.initRoute || 'index';
  app.navigate(route, {trigger: true, replace: true});
}