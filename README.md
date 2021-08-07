# wx-ai-redpacket
私人仓库。以下为项目记录

## AI红包-二期

- [x] 节流防抖
- [x] 表情红包，识物红包，动作红包新UI实现
- [x] Receive页，不能直接开始。生成红包只能分享
- [x] 首页生成红包，错误提示信息
- [x] 已领取后按钮变灰



## AI红包-三期

- [x] 我的红包：接口调试
- [x] 动作红包：手部or头部、三关挑战
- [x] 图片转换svg
- [x] 图片设置缓存
- [x] getMoney页面重构
- [x] 画图模型
- [x] 表情模型
- [x] 动作模型



## AI红包-四期

- [x] 优化模型加载速度、设计缓存。
- [x] 转发权限管理
- [x] 二维码海报



## AI红包-五期

- [x] 扫物改为拍照方式
- [x] 接入支付
- [x] 设置sessionid会话

# 项目总结



## 捕获帧上传：

- ##### arraybuffer => unit8array => base64

  数据长度太大 ，报错413

  并且返回的arraybuffer其实是未经过编码的数据

- ##### arraybuffer => canvasPutImageData => canvasToTempFile => readAsBase64： 

  性能极差

  ##### 原理：

  咨询小程序中心的开发人员得知：camera组件在gpu运行；oncameraframe在cpu处理arraybuffer；而拿到的cpu又通过canvas的API利用GPU获取图片数据。效率非常低；

  而目前的小程序还没有原生支持GPU->GPU的映射方式，预计未来会增加。

### 解决方案：

- ##### 前端部署TensorFlowJS：

  利用arrayBuffer转化unit8array 作为样本输入，实时获得预测值。
### 博客记录
https://segmentfault.com/a/1190000038354132

## redid类型错误

服务端规定的redid类型为int；

但前端接收到redid并进行跨页面传参时 redid被强制转换成了string类型，这个bug导致后端小伙伴一度崩溃，最终发现是前端类型的问题。怒，遂决定学习typescript并且重构项目。

### 解决方案：

- 使用typescript重构项目
- 期间学会了为自己的util库编写.d.ts文件；自定义接口等等，使得类型定义变得更加严格。



## 使用watch观察全局变量

tfjs加载模型速度过慢，解决方法：

1. 加入本地缓存（解决了一种）
2. 有的模型不支持加入本地缓存（未使用npm包，没有对应的缓存接口），使用跨页面预加载的方式。

如何在详情页面感知到加载？

1. 增加loading弹窗
2. 使用watch观察app.js中的模型，若已加载完毕则隐藏loading弹窗。
