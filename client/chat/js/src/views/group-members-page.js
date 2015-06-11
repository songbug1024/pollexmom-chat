/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/6/6
 */
var RestMVC = require('rest-mvc');
var $ = require('jquery');
var _ = require('underscore');
var template = require('../templates/group-members-page.tpl');
var ContentView = require('./group-members-page-content');

module.exports = RestMVC.View.extend({
  id: 'group-members-page',
  name: 'GroupMembersPage',
  role: 'page',
  template: _.template(template),
  className: 'page view',
  frameData: {
    groupName: '聊天室'
  },
  events: {
    'tap .sort-btn': 'sortBtnEvent',
    'tap .sort-selections .item': 'sortItemEvent',
    'tap .back-btn': 'backEvent',
    'swiperight .member-content': 'backEvent'
  },
  render: function (data) {
    if (!data) return console.error('View ' + this.name + ': render data is invalid.');
    var group = data.group;
    group && this.renderPart('groupName', group.name);

    var contentView = new ContentView();
    contentView.setElement(this.$el.find('.member-content'));
    contentView.render(data);
    return this;
  },
  backEvent: function (e) {
    pollexmomChatApp.back();
  },
  sortBtnEvent: function (e) {
    var $el = $(e.currentTarget);
    var $sectionsEl = this.$el.find('.sort-selections');

    $el.toggleClass('active');
    if ($el.hasClass('active')) {
      $sectionsEl.addClass('show');
    } else {
      $sectionsEl.removeClass('show');
    }
  },
  sortItemEvent: function (e) {
    var $el = $(e.currentTarget);
    var $sortBtnEl = this.$el.find('.sort-btn');
    var $sectionsEl = this.$el.find('.sort-selections');

    if ($el.hasClass('current')) {
      var order = $el.attr('data-order');
      order = order === 'asc' ? 'desc' : 'asc';
      $el.attr('data-order', order);
    } else {
      var $currentItemEl = $sectionsEl.find('.item.current');
      $currentItemEl.removeClass('current');
    }
    $el.addClass('current');
    $sectionsEl.removeClass('show');
    $sortBtnEl.removeClass('active');

    var orderby = $el.attr('data-orderby');
    var order = $el.attr('data-order');
    // TODO
  }
});