var _ = require('underscore');

module.exports = function(server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router();

  router.get('/', function(req, res) {
    res.render('chat/select-user');
  });

  router.post('/chat', function(req, res) {
    var weChatData = {};

    weChatData.openid = req.body.openid;
    weChatData.nickname = req.body.nickname;
    weChatData.sex = req.body.sex;
    weChatData.headimgurl = req.body.headimgurl;
    weChatData.remark = req.body.remark;

    res.render('chat/index', {weChatData: weChatData});
  });

  router.get('/chat', function(req, res) {
    var weChatData = {};

    weChatData.openid = req.query.openid;
    weChatData.nickname = req.query.nickname;
    weChatData.sex = req.query.sex;
    weChatData.headimgurl = req.query.headimgurl;
    weChatData.remark = req.query.remark;

    res.render('chat/index', {weChatData: weChatData});
  });

  router.get('/chat/:route', function(req, res) {
    var route = req.params[route];
    res.render('chat/index', {initRoute: route});
  });

  server.use(router);
};
