// components/login/login.js
Component({

  properties: {

  },

  data: {
    url: ""
  },

  methods: {
    setupApp(e) {
      this.triggerEvent("setupApp", {
        args: e
      })
    }
  },

  lifetimes: {
    attached() {
      let that = this

      //查找缓存
      let url = wx.getStorageSync('loginBg')
      console.log(url)
      if (!url) {
        wx.downloadFile({
          url: 'https://weixinredpacket-1258344707.file.myqcloud.com/mobilenet/static/loginBG.svg',
          success(res) {
            console.log(res.tempFilePath)
            const fileManager = wx.getFileSystemManager()
            let data = fileManager.readFileSync(res.tempFilePath, 'base64');
            that.setData({
              url: `data:image/svg+xml;base64,${data}`
            })
          }
        })
      } else {
        console.log(url)
        const fileManager = wx.getFileSystemManager()
        let data = fileManager.readFileSync(url, 'base64');
        that.setData({
          url: `data:image/svg+xml;base64,${data}`
        })
      }


    }
  }
})