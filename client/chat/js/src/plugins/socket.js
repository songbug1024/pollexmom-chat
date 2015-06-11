/**
 * Created by fuwensong on 15-6-10.
 */
var RestMVC = require('rest-mvc');
var $ = require('jquery');
var ConnectionModalView = require('../views/connection-modal');
var isReconnect = false;

module.exports = function (user, readyCallback) {
  var socket = io(RestMVC.Settings.socketIORoot, RestMVC.Settings.socketIOOptions);
  var connectionModal = new ConnectionModalView();

  $('body').append(connectionModal.frame().el);
  connectionModal.show();
  
  socket.on('connect', function () {
    if (!isReconnect) {
      connectionModal.show('已连接服务器，登录中...');

      if (RestMVC.Settings.env === 'debug') {
        console.log('Socket on connect');
      }

      socket.emit('join', {userId: user.id, groupId: user.groupId}, function (err, data) {
        if (err) {
          connectionModal.show('登录失败，请尝试刷新页面！');
          return console.error(err);
        }
        connectionModal.show('登录成功！');

        delayHideModal();

        readyCallback(socket, data);
      });
    }
  });

  socket.on('error', function (err) {
    if (RestMVC.Settings.env === 'debug') {
      console.log('Socket on error, err is' + err);
    }
  });

  socket.on('disconnect', function () {
    if (RestMVC.Settings.env === 'debug') {
      console.log('Socket on disconnect');
    }
  });

  socket.on('reconnect', function (attempt) {
    if (RestMVC.Settings.env === 'debug') {
      console.log('Socket on reconnect, attempt is ' + attempt);
    }

    isReconnect = true;
    connectionModal.show('重连服务器成功！');
    delayHideModal();

    // TODO refresh messages
  });

  socket.on('reconnect_attempt', function () {
    if (RestMVC.Settings.env === 'debug') {
      console.log('Socket on reconnect_attempt');
    }
  });

  socket.on('reconnecting', function (attempt) {
    if (RestMVC.Settings.env === 'debug') {
      console.log('Socket on reconnecting, attempt is ' + attempt);
    }

    connectionModal.show('网络不给力，第' + attempt + '次重连中...');
  });

  socket.on('reconnect_error', function (err) {
    if (RestMVC.Settings.env === 'debug') {
      console.log('Socket on reconnect_error, err is ' + err);
    }
  });

  socket.on('reconnect_failed', function (err) {
    if (RestMVC.Settings.env === 'debug') {
      console.log('Socket on reconnect_failed');
    }

    connectionModal.show('无法连接服务器...');
  });

  function delayHideModal () {
    setTimeout(function () {
      connectionModal.hide();
    }, RestMVC.Settings.enterChatRoomTimeout);
  }
}