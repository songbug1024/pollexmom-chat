/**
 * @Description: Socket
 * @Author: fuwensong
 * @Date: 2015/6/4
 */
var Socket = {};
var _ = require('underscore');
var ChatGroupService = require('./services/chat-group');
var ChatMessageService = require('./services/chat-message');
var app = require('./server');

Socket.connect = function (socket) {
  console.log('Socket connect, socket is ' + socket.id);

  socket.on('join', Socket.join(socket));

  socket.on('public msg', Socket.publicMsg(socket));
  socket.on('private msg', Socket.privateMsg(socket));
  socket.on('revoke msg', Socket.revokeMsg(socket));

  socket.on('disconnect', Socket.disconnect(socket));

}

Socket.disconnect = function (socket) {
  return function (reason) {
    console.log('Socket disconnect, reason is ' + reason);

    if (socket.userLogged) {
      var groupRoom = 'group' + socket.groupId;
      socket.leave(groupRoom);
      socket.broadcast.to(groupRoom).emit('member left', {
        userId: socket.userId,
        username: socket.username,
        avatar: socket.userAvatar
      });
      socket.userLogged = false;
    }
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
    var existedSocket = __getSocketByUserId(socket, userId);

    if (existedSocket) {
      console.log('User has logged at other place.');
      existedSocket.disconnect();
    }

    var ready = function (err, user) {
      if (err) {
        return callback(new Error('Join Group failed.'));
      }
      callback(null, {groupId: user.groupId});

      socket.userLogged = true;
      socket.userId = _.isObject(user.id) ? user.id.toString() : user.id;
      socket.groupId = user.groupId;
      socket.username = user.username;
      socket.userAvatar = user.avatar;

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

Socket.privateMsg = function (socket) {
  return function (msg, callback) {
    console.log('Socket send privateMsg request, msg is ' + msg);
    // TODO verify
    ChatMessageService.saveMessage(msg, function (err, msg) {
      if (err) {
        return callback(err);
      }
      callback(null, msg);

      // notice receiver
      var receiverUserId = msg.receiverUserId;
      var toSocket = __getSocketByUserId(socket, _.isObject(receiverUserId) ? receiverUserId.toString() : receiverUserId);
      toSocket.emit('private msg', msg);
    });
  }
}

Socket.revokeMsg = function (socket) {
  return function (data, callback) {
    console.log('Socket send revokeMsg request, msg id is ' + data.msgId);

    ChatMessageService.revokeMessage(data, function (err, msg) {
      if (err) {
        return callback(err);
      }
      callback(null);

      var messageType = msg.messageType;
      if (messageType === 'public') {
        // broadcast others
        var groupRoom = 'group' + msg.groupId;
        socket.broadcast.to(groupRoom).emit('msg revoked', msg.id);
      } else if (messageType === 'private') {
        // TODO
      }
    });
  }
}

function __getSocketByUserId (socket, userId) {
  return _.findWhere(_.values(socket.server.sockets.connected), {userId: userId});
}

module.exports = Socket;
