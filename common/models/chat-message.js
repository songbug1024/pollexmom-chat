module.exports = function(ChatMessage) {

  ChatMessage.allStatus = {
    deleted: 0,
    normal: 1,
    revoked: 2
  }
  ChatMessage.messageTypes = {
    private: 'private',
    public: 'public'
  }
};
