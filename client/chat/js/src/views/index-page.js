/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/6/6
 */
var RestMVC = require('rest-mvc');
var _ = require('underscore');
var template = require('../templates/index-page.tpl');
var $ = require('jquery');
var ChatBarView = require('./index-page-chat-bar');
var ContentView = require('./index-page-content');

module.exports = RestMVC.View.extend({
  id: 'index-page',
  name: 'IndexPage',
  role: 'page',
  template: _.template(template),
  parts: {
    groupName: '.group-name'
  },
  initialize: function () {

    $('body').append(this.frame({
      groupName: '聊天室'
    }).el);
  },
  render: function (data) {
    if (!data) return console.error('View ' + this.name + ': render data is invalid.');

    var groupModel = data[0];
    this.renderPart('groupName', groupModel.get('name'));

    var msgCollection = data[1];
    var chatBarView = new ChatBarView();
    var contentView = new ContentView({chatBarView: chatBarView});

    chatBarView.setElement(this.$el.find('.chat-input-bar'));
    contentView.setElement(this.$el.find('.msg-content'));
    chatBarView.render();
    contentView.render({msgCollection: msgCollection});
    return this;
  }
});