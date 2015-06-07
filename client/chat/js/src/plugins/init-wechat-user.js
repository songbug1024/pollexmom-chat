/**
 * Created by fuwensong on 15-5-13.
 */
var RestMVC = require('rest-mvc');
var async = require('async');
var UserModel = require('../models/user');
var UserPersonalInfoModel = require('../models/user-personal-info');

module.exports = function (weChatData, callback) {
  if (RestMVC.Settings.env === 'debug') {
    console.log('initWeChatUserInfo: weChatData is ' + weChatData.toString());
  }

  var weChatId = weChatData.openid;
  var username = weChatData.nickname;
  var gender = !!weChatData.sex;
  var avatar = weChatData.headimgurl;
  var desc = weChatData.remark;

  async.waterfall([
    function loadUserInfo(callback) {
      var userModel = new UserModel({weChatId: weChatId});
      userModel.url = userModel.weChatUrl();
      userModel.fetch(function (err) {
        if (err && err.status != '404') {
          return callback(err);
        }
        callback(null, this);
      });
    },
    function verifyRegisterWeChatUser(user, callback) {
      if (user.id) {
        callback(null, user);
      } else {
        async.waterfall([
          function saveUser(callback) {
            user.url = user.urlRoot();
            user.save({
              userNumber: user.get('weChatId'),
              username: username,
              avatar: avatar,
              desc: desc,
              status: 1,
              roleName: RestMVC.Settings.roles.member
            }, function (err) {
              if (err) {
                return callback(err);
              }
              callback(null, this);
            });
          },
          function saveUserPersonalInfo(user, callback) {
            var personalInfoModel = new UserPersonalInfoModel({
              userId: user.id,
              gender: gender
            });

            personalInfoModel.save(function (err) {
              if (err) {
                return callback(err);
              }
              user.set({
                personalInfo: this.attributes
              });

              callback(null, user);
            });
          }
        ], callback);
      }
    }
  ], function (err, user) {
    if (err) {
      console.error('initWeChatUserInfo error ' + err);
      return callback(err);
    }

    callback(null, user.toJSON());
  });
};
