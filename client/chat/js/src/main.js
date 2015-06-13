/**
 * @Description: Main
 * @Author: fuwensong
 * @Date: 2015/5/4
 */
var $ = window.$ = window.jQuery = require('jquery');

(function ($) {
  var weChatDataValue = getValueById('wechat-data');
  var routeValue = getValueById('route-data');

  window.userWeChatData = weChatDataValue ? JSON.parse(weChatDataValue) : null;
  window.initRoute = routeValue || '';

  function getValueById(id) {
    var $el = $('#' + id);
    var value = $el.attr('data-value');
    $el.remove();

    console.log('Fn getValueById: id is ' + id + ', value is ' + value);
    return value;
  }
})($);

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

// Register ionic plugins
//RestMVC.plugin('ionic')(ionic);

var sessionStorage = RestMVC.plugin('storage').sessionStorage;
var initWeChatUserPlugin = require('./plugins/init-wechat-user');
var socketPlugin = require('./plugins/socket');
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
    // 打开方式不对

    alert('初始化用户信息失败');
    window.location.href = RestMVC.Settings.weChatMainUrl;
    return;
  }

  socketPlugin(user, function (socket, data) {
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

  var route = window.initRoute || app.main;
  app.navigate(route, {trigger: true, replace: true});
}
