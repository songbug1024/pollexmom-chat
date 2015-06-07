/**
 * @Description: Socket
 * @Author: fuwensong
 * @Date: 2015/6/4
 */
var clientSize = 0;
var Socket = {};
var ChatGroupService = require('./services/chat-group');
var ChatMessageService = require('./services/chat-message');
var app = require('./server');

Socket.connect = function (socket) {
  console.log('Socket connect, socket is ' + socket);
  clientSize++;
}

Socket.disconnect = function (data) {
  console.log('Socket disconnect, data is ' + data);
  clientSize--;
}

Socket.join = function (data) {
  var socket = this;
  console.log('Socket send join request, data is ' + data);

  if (!data || !data.userId) {
    console.error('Socket join error, data is invalid');
    return socket.emit('error', {err: 'Join data is invalid.', code: 400});
  }
  var userId = data.userId;
  var groupId = data.groupId;

  var ready = function (err, groupId, user) {
    if (err) {
      return socket.emit('error', {err: 'Join Group failed.', code: 500});
    }
    socket.emit('ready', {groupId: groupId});

    var groupRoom = 'group' + groupId;

//    socket.id = user.id;
    socket.join(groupRoom);
    socket.broadcast.to(groupRoom).emit('member joined', {
      userId: user.id,
      username: user.username,
      avatar: user.avatar
    });
  }

  if (!groupId) {
    ChatGroupService.joinGroup(userId, function (err, group, user) {
      ready(err, group.id, user);
    });
  } else {
    var User = app.models.user;

    User.findById(userId, function (err, user) {
      if (err) {
        return ready(err);
      }
      if (!user || !user.groupId) {
        return ready(new Error('Join Group failed, invalid user data.'));
      }
      ready(err, user.groupId, user);
    });
  }
}

Socket.publicMsg = function (msg, callback) {
  var socket = this;
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

module.exports = Socket;