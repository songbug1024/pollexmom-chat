/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/6/6
 */
var RestMVC = require('rest-mvc');
var _ = require('underscore');
var template = require('../templates/connection-modal.tpl');

module.exports = RestMVC.View.extend({
  name: 'ConnectionModal',
  role: 'modal',
  template: _.template(template),
  className: 'connection-modal',
  parts: {
    connectionText: '.connection-text'
  },
  frameData: {
    connectionText: '连接中...'
  },
  initialize: function () {
    this.shown = false;
  },
  show: function (text) {
    if (!this.shown) {
      this.shown = true;
      this.$el.show();
    }
    text && this.renderPart('connectionText', text);
  },
  hide: function () {
    if (this.shown) {
      this.shown = false;
      this.$el.hide();
    }
  }
});