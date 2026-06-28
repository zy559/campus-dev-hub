const { messages } = require("../../utils/mock");

Page({
  data: {
    messages,
    mode: "normal",
    input: ""
  },

  onLoad(options) {
    this.setData({ mode: options.mode || "normal" });
  },

  input(event) {
    this.setData({ input: event.detail.value });
  },

  send() {
    const text = this.data.input.trim();
    if (!text) return;
    const next = this.data.messages.concat({
      id: `m-${Date.now()}`,
      mine: true,
      text,
      time: "现在"
    });
    this.setData({ messages: next, input: "" });
  }
});
