// components/myRedp/layout-swiper-item/layout-swiper-item.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    type: {
      type: String,
      value: 0
    },
    avatarUrl: {
      type: String,
      value: ""
    },
    list: {
      type: Array,
      value: []
    },
    money: {
      type: String,
      value: 0
    },
    number: {
      type: Number || String,
      value: 0
    },
    nickname: {
      type: String,
      value: ""
    },
    hasInfo: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {}
})