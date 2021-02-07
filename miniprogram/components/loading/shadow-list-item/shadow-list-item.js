// components/loading/shadow-list-item/shadow-list-item.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    type: { // 0：带头像  1：不带头像
      type: String,
      value: "0"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    placeHolderList: [Symbol(), Symbol()]
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})