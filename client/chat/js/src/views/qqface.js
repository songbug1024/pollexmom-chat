/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/6/6
 */
var RestMVC = require('rest-mvc');
var _ = require('underscore');
var $ = require('jquery');
var template = require('../templates/qqface.tpl');

module.exports = RestMVC.View.extend({
  name: 'QQFace',
  role: 'content',
  template: _.template(template),
  className: 'qqface',
  events: {
    'tap .col': 'itemColEvent'
  },
  frameData: {
    faceRoot: RestMVC.Settings.faceIconsRoot,
    rows: 10,
    cols: 8,
    max: 75
  },
  render: function () {
    this.frame();
    this.scrollView = new ionic.views.Scroll({el: this.el});
    return this;
  },
  show: function (receiver) {
    this.receiver = receiver;
    this.$el.addClass('active');

    if (!this.loaded) {
      this.$el.find('.col img').each(function () {
        $(this).attr('src', $(this).attr('data-src'));
      });
      this.loaded = true;
    }
  },
  hide: function () {
    this.$el.removeClass('active');
  },
  itemColEvent: function (e) {
    var $el = $(e.currentTarget);
    var index = $el.attr('data-index');

    if (!index || index === '') return;
    this.receiver && this.receiver(this.encode(index));
  },
  encode: function (index) {
    return '[em_' + index + ']';
  }
});
