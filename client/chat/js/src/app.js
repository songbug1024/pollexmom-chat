/**
 * @Description: Index Route
 * @Author: fuwensong
 * @Date: 2015/5/4
 */
var RestMVC = require('rest-mvc');
var IndexController = require('./controllers/index');

module.exports = RestMVC.Router.extend({
  actions: {
    'sendMsg': IndexController.sendMsg
  },
  initialize: function () {
    this.route('index', 'index', IndexController.index);
    this.route('group-members', 'groupMembers', IndexController.groupMembers);
  }
});