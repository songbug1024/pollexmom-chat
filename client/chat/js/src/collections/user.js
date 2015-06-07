/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/5/9
 */
var RestMVC = require('rest-mvc');
var Model = require('../models/user');

module.exports = RestMVC.Collection.extend({
  name: 'User',
  plural: 'users',
  model: Model
});