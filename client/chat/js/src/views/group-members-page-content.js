/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/6/6
 */
var RestMVC = require('rest-mvc');
var Common = require('../plugins/common');
var MemberItemView = require('./group-members-page-item');

module.exports = RestMVC.View.extend({
  name: 'IndexPageContent',
  role: 'content',
  parts: {
    masterCounter: '.master-divider .counter',
    memberCounter: '.member-divider .counter'
  },
  initialize: function () {
    this.on('scrollBottom', this.loadMoreMembers);
    this.on('loadMoreMembersSuccess', this.loadMoreMembersSuccess);
  },
  render: function (data) {
    if (!data) return console.error('View ' + this.name + ': render data is invalid.');
    var masters = data.masters;
    var members = data.members;

    var $mastersEl = this.$el.find('.masters');
    var $membersEl = this.$el.find('.members');

    $mastersEl.empty();
    masters.each(function (model) {
      $mastersEl.append(new MemberItemView({model: model}).render().el);
    });
    $membersEl.empty();
    members.each(function (model) {
      $membersEl.append(new MemberItemView({model: model}).render().el);
    });

    this.renderParts({
      masterCounter: masters.length,
      memberCounter: members.length
    });

    var self = this;
    var scrollView = this.scrollView = Common.scrollView({
      el: this.el,
      usePullToRefresh: true,
      refresherMethods: {
        activate: function () {
          if (self.refreshing) {
            return;
          }
          self.refreshing = true;
          self.acceptData = true;

          self.trigger('delegateResort', function (err, data) {
            if (!self.acceptData) return console.warn('User canceled');
            if (err) {
              self.trigger('refreshError', err);
              return setTimeout(function () {
                scrollView.finishPullToRefresh();
                self.refreshing = false;
              }, 300);
            }
            self.trigger('refreshSuccess', data);
            setTimeout(function () {
              scrollView.finishPullToRefresh();
              self.refreshing = false;
            }, 300);
          });
        },
        deactivate: function () {
          self.acceptData = false;
        }
      }
    });

    this.$el.on('scroll', function (e) {
      var detail = (e.originalEvent || e).detail || {};
      var max = scrollView.getScrollMax();

      if (detail.scrollTop >= max.top) {
        self.trigger('scrollBottom');
      }
    });
    return this;
  },
  loadMoreMembers: function () {
    var self = this;
    if (this.loadingMore) {
      return;
    }
    this.loadingMore = true;
    var $lastEl = this.$el.find('.members .member:last');
    var sinceId = $lastEl.attr('data-id');
    var sinceDisplayName = $lastEl.attr('data-display-name');
    var sinceCreated = $lastEl.attr('data-created');

    pollexmomChatApp.action('groupMembers.loadMoreMembers', {
      sinceId: sinceId,
      sinceDatas: {
        created: sinceCreated,
        displayName: sinceDisplayName
      }
    }, function (err, members) {
      setTimeout(function () {
        self.loadingMore = false;
      }, 2000);

      if (err) {
        Common.notice('获取数据失败');
        self.trigger('loadMoreMembersError', err);
      }
      var count = members.length;
      if (count > 0) {
//        Common.notice('获取到 ' + count + ' 条数据');
      } else {
//        Common.notice('没有更多的数据');
      }
      self.trigger('loadMoreMembersSuccess', members, sinceId);
    });
  },
  loadMoreMembersSuccess: function (members, sinceId) {
    if (members && members.length > 0) {
      var $lastSinceEl = this.$el.find('.members .member[data-id="' + sinceId + '"]');
      var $scrollEl = this.$el.find('.members');

      members.each(function (model) {
        $scrollEl.append(new MemberItemView({model: model}).render().el);
      });

      var offset = $lastSinceEl.offset();
      this.scrollView.scrollTo(offset.left, offset.top);
    }
  }
});