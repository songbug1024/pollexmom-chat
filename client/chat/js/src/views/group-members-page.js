/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/6/6
 */
var RestMVC = require('rest-mvc');
var $ = require('jquery');
var _ = require('underscore');
var Common = require('../plugins/common');
var template = require('../templates/group-members-page.tpl');
var ContentView = require('./group-members-page-content');

module.exports = RestMVC.View.extend({
  id: 'group-members-page',
  name: 'GroupMembersPage',
  role: 'page',
  template: _.template(template),
  className: 'page view',
  frameData: {
    groupName: '聊天室',
    order: RestMVC.Settings.defaults.membersOrder,
    orderBy: RestMVC.Settings.defaults.membersOrderBy
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

    var $selectionEl = this.$el.find('.sort-selections .item[data-orderby="' + this.frameData.orderBy + '"]');
    $selectionEl.addClass('current').attr('data-order', this.frameData.order);

    var contentView = new ContentView();
    contentView.setElement(this.$el.find('.member-content'));
    contentView.listenTo(this, 'resort', contentView.render);

    this.listenTo(contentView, 'delegateResort', this.delegateResort);
    this.listenTo(contentView, 'loadMoreMembersSuccess', this.loadMoreMembersSuccess);
    this.trigger('resort', data);
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
  resortMembers: function ($el, callback) {
    var self = this;
    var $sortBtnEl = this.$el.find('.sort-btn');
    var $sectionsEl = this.$el.find('.sort-selections');

    if ($el.hasClass('current')) {
      var order = $el.attr('data-order');
      order = order === 'ASC' ? 'DESC' : 'ASC';
      $el.attr('data-order', order);
    } else {
      var $currentItemEl = $sectionsEl.find('.item.current');
      $currentItemEl.removeClass('current');
    }
    $el.addClass('current');
    $sectionsEl.removeClass('show');
    $sortBtnEl.removeClass('active');

    var orderBy = $el.attr('data-orderby');
    var order = $el.attr('data-order');

    if (order && orderBy) {
      pollexmomChatApp.action('groupMembers.resort', {
        order: order,
        orderBy: orderBy
      }, function (err, data) {
        if (err) {
          callback && callback(err);
          return Common.notice('刷新失败');
        }
        Common.notice('刷新成功');
        self.trigger('resort', data);
        callback && callback(null, data);
      });
    }
  },
  sortItemEvent: function (e) {
    this.resortMembers($(e.currentTarget));
  },
  delegateResort: function (callback) {
    this.resortMembers(this.$el.find('.item.current'), callback);
  },
  loadMoreMembersSuccess: function (members, sinceId) {
    // TODO
  }
});