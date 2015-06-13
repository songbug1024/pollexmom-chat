/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/6/13
 */
var _ = require('underscore');
var $ = require('jquery');

module.exports = {
  toast: function (text) {
    var id = 'toast' + (new Date()).getTime();
    $('body').append('<div id="' + id + '" class="toast">' + text + '</div>');
    setTimeout(function () {$('#' + id).remove();}, 2000);
  },
  notice: function (text) {
    var id = 'notice' + (new Date()).getTime();
    $('body').append('<div id="' + id + '" class="notice">' + text + '</div>');
    setTimeout(function () {$('#' + id).remove();}, 2000);
  },
  animatedRemove: function ($el, direction, options) {
    direction = direction || 'left';
    options = _.extend({
      done: function () {
        $(this).remove();
        options.afterRemoved && options.afterRemoved();
      }
    }, options);

    var width = $el.width();
    switch (direction) {
      case 'left':
        $el.animate({marginLeft: -width + 'px'}, options);
        break;
      case 'right':
        $el.animate({marginRight: -width + 'px'}, options);
        break;
    }
  },
  scrollView: function (options) {
    options = options || {};
    var scrollView = new ionic.views.Scroll(options);

    scrollView.scrollTop = function(shouldAnimate) {
      scrollView.resize();
      scrollView.scrollTo(0, 0, !!shouldAnimate);
    };

    scrollView.scrollBottom = function(shouldAnimate) {
      scrollView.resize();
      var max = scrollView.getScrollMax();
      scrollView.scrollTo(max.left, max.top, !!shouldAnimate);
    };

    var refresherMethods = options.refresherMethods;
    if (options.usePullToRefresh && refresherMethods) {
      refresherMethods = _.extend({
        activate: function () {console.log('activate' + arguments)},
        deactivate: function () {console.log('deactivate' + arguments)},
        start: function () {console.log('start' + arguments)},
        show: function () {console.log('show' + arguments)},
        hide: function () {console.log('hide' + arguments)},
        tail: function () {console.log('tail' + arguments)}
      }, refresherMethods);
      scrollView.activatePullToRefresh(48, refresherMethods);
    }

    return scrollView;
  }
}