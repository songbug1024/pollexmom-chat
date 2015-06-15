/**
 * @Description: Index Route
 * @Author: fuwensong
 * @Date: 2015/5/4
 */
var RestMVC = require('rest-mvc');
var IndexController = require('./controllers/index');
var GroupMembersController = require('./controllers/group-members');

module.exports = RestMVC.Router.extend({
  main: 'index',
  controllers: {
    index: IndexController,
    groupMembers: GroupMembersController
  },
  routes: {
    'index': 'index.index',
    'private': 'index.private',
    'group-members': 'groupMembers.index'
  }
});
