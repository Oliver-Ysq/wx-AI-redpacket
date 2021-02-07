export default class LastMayday {
  palette(args) {
    return ({
      "width": "600rpx",
      "height": "818rpx",
      "background": "",
      "views": [{
          "type": "image", // 背景图片
          "url": "https://weixinredpacket-1258344707.file.myqcloud.com/mobilenet/static/shareBg_8.png",
          "css": {
            "width": "600rpx",
            "height": "818rpx",
            "top": "0px",
            "left": "0px",
            "borderColor": "#000000",
            "mode": "scaleToFill"
          }
        },
        {
          "type": "image", // 头像
          "url": `${args.avaUrl}`,
          "css": {
            "width": "40rpx",
            "height": "40rpx",
            "top": "44rpx",
            "left": "178rpx",
            "borderRadius": "8rpx",
            "borderColor": "#000000",
            "mode": "scaleToFill"
          }
        },
        {
          "type": "text", //头像+红包文字
          "text": `${args.nickName}的画图红包`,
          "css": {
            "color": "#000000",
            "width": "400rpx",
            "height": "29.5rpx",
            "top": "50rpx",
            "left": "228rpx",
            "padding": "0px",
            "fontSize": "24rpx",
            "fontWeight": "600",
            "maxLines": "1",
            "lineHeight": "29.5rpx",
            "textAlign": "left"
          }
        },
        {
          "type": "image", //红包标志图片
          "url": `${args.midImgUrl}`,
          "css": {
            "width": "160rpx",
            "height": "160rpx",
            "top": "114rpx",
            "left": "220rpx",
            "borderRadius": "40px",
            "mode": "scaleToFill"
          }
        },
        {
          "type": "text", //完成挑战文字
          "text": "完成挑战以领取红包",
          "css": {
            "color": "#000000",
            "background": "rgba(0,0,0,0)",
            "width": "400rpx",
            "height": "29.5rpx",
            "top": "294rpx",
            "left": "192rpx",
            "rotate": "0",
            "borderColor": "#000000",
            "padding": "0px",
            "fontSize": "24rpx",
            "fontWeight": "normal",
            "maxLines": "1",
            "lineHeight": "29.5rpx",
            "textStyle": "fill",
            "textDecoration": "none",
            "textAlign": "left"
          }
        },
        {
          "type": "image", //二维码图标
          "url": `${args.qrcodeUrl}`,
          "css": {
            "width": "200rpx",
            "height": "200rpx",
            "top": "520rpx",
            "left": "200rpx",
            "borderRadius": "100rpx",
            "mode": "scaleToFill"
          }
        },
        {
          "type": "image",
          "url": "https://weixinredpacket-1258344707.file.myqcloud.com/mobilenet/static/money.png",
          "css": {
            "width": "106px",
            "height": "30px",
            "top": "174px",
            "left": "97px",
            "rotate": "0",
            "borderRadius": "",
            "borderWidth": "",
            "borderColor": "#000000",
            "shadow": "",
            "mode": "scaleToFill"
          }
        }
      ]
    });
  }
}