// // app.ts
var fetchWechat = require("fetch-wechat");
var tf = require("@tensorflow/tfjs-core");
var plugin = requirePlugin("tfjsPlugin");
var webgl = require("@tensorflow/tfjs-backend-webgl");
var cpu = require("@tensorflow/tfjs-backend-cpu");

interface IApp {
    globalData: {
        userInfo?: any;
        appWidth?: number;
        appHeight?: number;
        Width: number;
        Height: number;
        benchmarkLevel: number;
        baseLengthRatio: number;
        localStorageIO: any;
        fileStorageIO: any;
        activeType: number;
        typeList: string[];
        baseUrl: string;
        canvasModel: any;
        actionModel: any;
        sessionid?: string;
    };
    onLaunch: () => void;
    login: () => Promise<any>;
    getSessionId: () => Promise<any>;
    getDeviceInfo: () => void;
    getuserinfo: () => Promise<any>;
    downLoadFile: (url: string, key: string) => void;
}

App<IApp>({
    //全局属性
    globalData: {
        Width: 320,
        Height: 500,
        benchmarkLevel: -1,
        baseLengthRatio: 1,

        localStorageIO: plugin.localStorageIO, //配置模型缓存
        fileStorageIO: plugin.fileStorageIO, //模型下载

        activeType: 0,
        typeList: ["画图", "表情", "识物", "动作"],
        // baseUrl: "http://100.112.17.236:8081/airedpacket",
        baseUrl: "https://mp.weixin.qq.com/airedpacket",

        canvasModel: null,
        actionModel: null,
    },
    //登录获取sessionid
    login() {
        const that = this;
        return new Promise((resolve, reject) => {
            wx.login({
                success: (res) => {
                    wx.request({
                        url: "https://mp.weixin.qq.com/airedpacket/action?action=login",
                        // url: "http://100.112.17.236:8081/airedpacket/action?action=login",
                        method: "POST",
                        header: {
                            "content-type": "application/json; charset=UTF-8",
                        },
                        data: { code: res.code },
                        success(res: AnyResult) {
                            console.log(res.data);
                            that.globalData.sessionid = res.data.session_id;
                            resolve(that.globalData.sessionid);
                        },
                        fail(err) {
                            console.log("app login 获取失败");
                            reject(err);
                        },
                    });
                },
                fail(err) {
                    console.log(err, "wx.login 获取失败");
                },
            });
        });
    },

    //查询用户信息：userinfo
    getuserinfo() {
        return new Promise((resolve, reject) => {
            const that = this;
            wx.getSetting({
                success: (res) => {
                    if (res.authSetting["scope.userInfo"]) {
                        // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                        wx.getUserInfo({
                            success: (res) => {
                                // 可以将 res 发送给后台解码出 unionId
                                that.globalData.userInfo = res.userInfo;
                                resolve(res.userInfo);
                            },
                        });
                    } else reject();
                },
            });
        });
    },

    //缓存文件
    downLoadFile(url, key) {
        if (!!wx.getStorageSync(key)) return;
        wx.downloadFile({
            url,
            success: (res) => {
                if (res.statusCode === 200) {
                    const fs = wx.getFileSystemManager(); // 使用小程序的文件系统，通过小程序的api获取到全局唯一的文件管理器
                    fs.saveFile({
                        tempFilePath: res.tempFilePath,
                        success(res) {
                            console.log("缓存成功", res.savedFilePath); // res.savedFilePath 为一个本地缓存文件路径
                            wx.setStorageSync(key, res.savedFilePath); // 此时图片本地缓存已经完成，res.savedFilePath为本地存储的路径。
                        },
                    });
                } else console.log("响应失败", res.statusCode);
            },
            fail: (err) => console.log("下载失败", err),
        });
    },

    // 查找sessionid： 缓存 || wx.login
    getSessionId() {
        const that = this;
        return new Promise((resolve, reject) => {
            const sessionid = wx.getStorageSync("sessionId");
            if (!sessionid) {
                console.log("sessionid缓存miss");
                this.login().then((res) => {
                    wx.setStorage({
                        key: "sessionId",
                        data: res
                    });
                    that.globalData.sessionid = res;
                    reject(res);
                });
            } else {
                console.log("sessionid缓存命中");
                this.globalData.sessionid = sessionid;
                resolve(sessionid);
            }
        });
    },

    //查询设备信息
    getDeviceInfo() {
        try {
            const res = wx.getSystemInfoSync();
            this.globalData.baseLengthRatio =
                Math.min(res.windowHeight, res.windowWidth) / 443; //适配笔画长度
            this.globalData.appHeight = res.windowHeight;
            this.globalData.appWidth = res.windowWidth;
            this.globalData.Width =
                typeof res.screenWidth === "number" ? res.screenWidth : 320;
            this.globalData.Height =
                typeof res.screenHeight === "number" ? res.screenHeight : 500;
            this.globalData.benchmarkLevel =
                typeof res.benchmarkLevel === "number"
                    ? res.benchmarkLevel
                    : -1;
            wx.reportAnalytics("get_device_info", {
                device_info: JSON.stringify(res),
            });
        } catch (e) {
            console.log(e);
        }
    },

    onLaunch() {
        const that = this
        this.getDeviceInfo();

        plugin.configPlugin(
            {
                fetchFunc: fetchWechat.fetchFunc(),
                tf,
                webgl,
                cpu,
                canvas: wx.createOffscreenCanvas(),
            },
            false
        );

        //  缓存图片：
        //  登录背景
        this.downLoadFile(
            "https://weixinredpacket-1258344707.file.myqcloud.com/mobilenet/static/loginBG.svg",
            "loginBg"
        );
        //  receive页面图标
        this.downLoadFile(
            "https://weixinredpacket-1258344707.file.myqcloud.com/mobilenet/static/draw.svg",
            "draw_img"
        );
        this.downLoadFile(
            "https://weixinredpacket-1258344707.file.myqcloud.com/mobilenet/static/emotion.svg",
            "emotion_img"
        );
        this.downLoadFile(
            "https://weixinredpacket-1258344707.file.myqcloud.com/mobilenet/static/scan.svg",
            "scan_img"
        );
        this.downLoadFile(
            "https://weixinredpacket-1258344707.file.myqcloud.com/mobilenet/static/action.svg",
            "action_img"
        );
        // receive页转发图标
        this.downLoadFile(
            "https://weixinredpacket-1258344707.file.myqcloud.com/mobilenet/static/zhuanfa.svg",
            "zhuanfa"
        );
        setTimeout(() => {
            setInterval(() => {
                that.login().then(res => {
                    wx.setStorage({
                        key: "sessionId",
                        data: res
                    });
                    that.globalData.sessionid = res;
                })
            }, 25 * 60 * 1000)  //每隔25分钟刷新一次sessionId
        }, 1 * 60 * 1000)   //1分钟后开始刷新sessionId
    },
});
