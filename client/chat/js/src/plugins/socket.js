/**
 * Created by fuwensong on 15-6-10.
 */
var RestMVC = require('rest-mvc');

module.exports = function (user, readyCallback) {
  var socket = io.connect(RestMVC.Settings.socketIORoot);

  socket.on('connect', function () {
    if (RestMVC.Settings.env === 'debug') {
      console.log('Socket on connect');
    }

    socket.emit('join', {userId: user.id, groupId: user.groupId});
  });

  socket.on('error', function (err) {
    if (RestMVC.Settings.env === 'debug') {
      console.log('Socket on error, err is' + err);
    }

    if (confirm('服务器连接失败，是否重试？')) {
      socket.emit('join', {userId: user.id, groupId: user.groupId});
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
  });

  socket.on('reconnect_error', function (err) {
    if (RestMVC.Settings.env === 'debug') {
      console.log('Socket on reconnect_error, err is' + err);
    }
  });

  socket.on('reconnect_failed', function (err) {
    if (RestMVC.Settings.env === 'debug') {
      console.log('Socket on reconnect_failed');
    }
  });

  socket.on('ready', function (data) {
    readyCallback(socket, data);
  });
}
