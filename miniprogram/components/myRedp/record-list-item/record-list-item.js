// components/myRedp/record-list-item/record-list-item.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    content: {
      type: Object,
      value: {}
    },
    type: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    map: {
      "0": "画图红包",
      "1": "表情红包",
      "2": "识物红包",
      "3": "动作红包"
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})