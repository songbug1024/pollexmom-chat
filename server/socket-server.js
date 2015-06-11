/**
 * @Description: Socket
 * @Author: fuwensong
 * @Date: 2015/6/4
 */
var Socket = {};
var ChatGroupService = require('./services/chat-group');
var ChatMessageService = require('./services/chat-message');
var app = require('./server');

Socket.connect = function (socket) {
  console.log('Socket connect, socket is ' + socket);

  socket.on('join', Socket.join(socket));

  socket.on('public msg', Socket.publicMsg(socket));

  socket.on('disconnect', Socket.disconnect(socket));

}

Socket.disconnect = function (socket) {
  return function (data) {
    console.log('Socket disconnect, data is ' + data);
  }
}

Socket.join = function (socket) {
  return function (data, callback) {
    console.log('Socket send join request, data is ' + data);

    callback = callback || function (err, data) {
      if (err) {
        return socket.emit('error', err);
      }
      socket.emit('ready', data);
    }

    if (!data || !data.userId) {
      return callback(new Error('Join data is invalid.'));
    }
    var userId = data.userId;
    var groupId = data.groupId;

    var ready = function (err, user) {
      if (err) {
        return callback(new Error('Join Group failed.'));
      }
      callback(null, {groupId: user.groupId});

      var groupRoom = 'group' + user.groupId;

      socket.join(groupRoom);
      socket.broadcast.to(groupRoom).emit('member joined', {
        userId: user.id,
        username: user.username,
        avatar: user.avatar
      });
    }

    if (!groupId) {
      ChatGroupService.joinGroup(userId, ready);
    } else {
      var User = app.models.user;

      User.findById(userId, function (err, user) {
        if (err) {
          return ready(err);
        }
        if (!user || !user.groupId) {
          return ready(new Error('Join Group failed, invalid user data.'));
        }
        ready(null, user);
      });
    }
  }
}

Socket.publicMsg = function (socket) {
  return function (msg, callback) {
    console.log('Socket send publicMsg request, msg is ' + msg);

    ChatMessageService.saveMessage(msg, function (err, msg) {
      if (err) {
        return callback(err);
      }
      callback(null, msg);

      // broadcast others
      var groupRoom = 'group' + msg.groupId;
      socket.broadcast.to(groupRoom).emit('public msg', msg);
    });
  }
}

module.exports = Socket;
