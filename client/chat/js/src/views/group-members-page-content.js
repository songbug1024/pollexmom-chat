/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/6/6
 */
var RestMVC = require('rest-mvc');
var MemberItemView = require('./group-members-page-item');

module.exports = RestMVC.View.extend({
  name: 'IndexPageContent',
  role: 'content',
  parts: {
    masterCounter: '.master-divider .counter',
    memberCounter: '.member-divider .counter'
  },
  render: function (data) {
    if (!data) return console.error('View ' + this.name + ': render data is invalid.');
    var masters = data.masters;
    var members = data.members;

    var $masterDividerEl = this.$el.find('.master-divider');
    var $memberDividerEl = this.$el.find('.member-divider');

    masters.each(function (model) {
      $masterDividerEl.after(new MemberItemView({model: model}).render().el);
    });
    members.each(function (model) {
      $memberDividerEl.after(new MemberItemView({model: model}).render().el);
    });
    this.renderParts({
      masterCounter: masters.length,
      memberCounter: members.length
    });

    var scrollView = new ionic.views.Scroll({
      el: this.el
    });
    return this;
  }
});