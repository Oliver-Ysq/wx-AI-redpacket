// pages/receive/receive.js
import { persondata, remainRedpack } from "../utils/request/api.js";
import { post } from "../utils/request/request.js";
import { throttle, onetap } from "../utils/util";
const app = getApp();
let pageThis: WechatMiniprogram.Page.Instance<
    IData,
    WechatMiniprogram.IAnyObject
>;

import { loadModel } from "./page_draw/model/model.js";
import { Classifier } from "./page_action/model/model.js";

interface IData {
    hasChecked: boolean;
    hasMoneyFlag: boolean;
    hasSessionId: boolean;
    textLineOne: string[];
    textLineTwo: string[];
    imgList: string[];
    canIUse: boolean;
    uploadUserInfo?: { nickName: string; avatarUrl: string };
    redid?: number;
    money?: number;
    moneyFlag?: number;
    activeType?: number;
    actionType?: number;
    question?: string;
    userInfo?: { nickname: string; avatarUrl: string };
    quesList?: string;
}

Page<IData, WechatMiniprogram.IAnyObject>({
    data: {
        hasChecked: false,
        hasMoneyFlag: false,
        hasSessionId: false,

        textLineOne: ["挥动手指", "来，做个表情", "打开相机", "动动脑袋动动手"],
        textLineTwo: [
            "一起尝试下",
            "让大家开心开心",
            "来寻找物品吧",
            "快来活动一下",
        ],

        imgList: [
            "https://weixinredpacket-1258344707.file.myqcloud.com/mobilenet/static/draw.svg",
            "https://weixinredpacket-1258344707.file.myqcloud.com/mobilenet/static/emotion.svg",
            "https://weixinredpacket-1258344707.file.myqcloud.com/mobilenet/static/scan.svg",
            "https://weixinredpacket-1258344707.file.myqcloud.com/mobilenet/static/action.svg",
        ],
        canIUse: wx.canIUse("button.open-type.getUserInfo"),
    },

    //领取红包
    gotoDetail: onetap(function () {
        return new Promise((resolve, reject) => {
            console.log("open redpacket!");
            const that: typeof pageThis = pageThis;

            if ((that.data.moneyFlag as number) > 0) {
                //红包有剩余
                const map = ["draw", "emotion", "scan", "action"];
                const type: number = that.data.activeType as number;
                if ([1, 2, 3].includes(type)) {
                    let url_1_2 = `./page_${map[type]}/${map[type]}?question=${that.data.question
                        }&nickname=${that.data.userInfo!.nickname}&avatarUrl=${that.data.userInfo!.avatarUrl
                        }&redid=${that.data.redid}`;
                    let url_3 = `./page_${map[type]}/${map[type]}?quesList=${that.data.quesList
                        }&nickname=${that.data.userInfo!.nickname}&avatarUrl=${that.data.userInfo!.avatarUrl
                        }&redid=${that.data.redid}&actionType=${that.data.actionType
                        }`;

                    wx.getSetting({
                        success: (response) => {
                            if (!response.authSetting["scope.camera"]) {
                                wx.authorize({
                                    scope: "scope.camera",
                                    success() {
                                        console.log("已获取摄像头权限");
                                        wx.navigateTo({
                                            url: type === 3 ? url_3 : url_1_2,
                                            complete: () =>
                                                resolve("进入" + map[type]),
                                        });
                                    },
                                    fail: () => reject("cameraError"),
                                });
                            } else {
                                console.log("已获取摄像机权限");
                                wx.navigateTo({
                                    url: type === 3 ? url_3 : url_1_2,
                                    complete: () => resolve("进入" + map[type]),
                                });
                            }
                        },
                        fail: () => reject("获取用户信息失败"),
                    });
                } else if (type === 0) {
                    wx.navigateTo({
                        url: `./page_${map[type]}/${map[type]}?question=${that.data.question
                            }&nickname=${that.data.userInfo!.nickname}&avatarUrl=${that.data.userInfo!.avatarUrl
                            }&redid=${that.data.redid}`,
                        complete: () => resolve("进入" + map[type]),
                    });
                } else reject("activeType类型错误");
            }
        });
    }),

    //remainRedpack
    //依赖：sessionid
    async getMoneyFlag() {
        return new Promise<void>(async (resolve, reject) => {
            const that = this;
            try {
                let remainRes = await post(remainRedpack, {
                    redid: that.data.redid,
                    sessionid: app.globalData.sessionid,
                });
                console.log("remainRedpack:" + JSON.stringify(remainRes.data));
                //moneyFlag       0：已领完   -1：已领过   >0：可以领取
                that.setData(
                    {
                        moneyFlag: remainRes.data.flag,
                        money: remainRes.data.money,
                    },
                    () => that.setData({ hasMoneyFlag: true }, () => resolve())
                );
            } catch (err) {
                console.log(err);
                wx.showToast({
                    title: "未知错误",
                    icon: "none",
                });
                reject();
            }
        });
    },

    //上传用户信息到后台
    //依赖：sessionid，nickname，avaurl
    async postPersondata() {
        return new Promise<void>(async (resolve, reject) => {
            const that = this;
            try {
                await post(persondata, {
                    sessionid: app.globalData.sessionid,
                    name: that.data.uploadUserInfo!.nickName,
                    avaurl: that.data.uploadUserInfo!.avatarUrl,
                });
                resolve();
            } catch (err) {
                reject();
            }
        });
    },

    //去发送新红包：使用节流，时间为1s
    setNewRedp: throttle(() => {
        wx.reLaunch({
            url: "/pages/index/index",
        });
    }, 1000),

    // 获取缓存图片
    getLocalImage(options: { activeType: string }) {
        return new Promise((resolve, reject) => {
            const that = pageThis;
            enum map {
                "draw_img",
                "emotion_img",
                "scan_img",
                "action_img",
            }
            let url = wx.getStorageSync(map[parseInt(options.activeType)]);
            let data = undefined;
            const fileManager = wx.getFileSystemManager();
            if (!!url) {
                console.log("缓存地址：" + url);
                fileManager.access({
                    path: url,
                    success: function () {
                        data = fileManager.readFileSync(url, "base64");
                        resolve(`data:image/svg+xml;base64,${data}`);
                    },
                    fail() {
                        reject(that.data.imgList[parseInt(options.activeType)]);
                    },
                });
            }
            reject(that.data.imgList[parseInt(options.activeType)]);
        });
    },

    // 领完后：查看详情
    checkDetail() {
        const that = this;
        const url = `./getMoney/getMoney?moneyFlag=${(that.data.moneyFlag as number) > 0 ? "1" : that.data.moneyFlag
            }&money=${that.data.money}&question=${that.data.question}&redid=${that.data.redid
            }&nickname=${(that.data.userInfo as any).nickname}&activeType=${that.data.activeType
            }&avatarUrl=${(that.data.userInfo as any).avatarUrl}`;
        wx.navigateTo({
            url,
            success: () => console.log("查看详情"),
        });
    },

    setupApp() {
        this.setData({ hasSessionId: true });
    },

    async onLoad(options: { [key: string]: string }) {
        const that = this;
        pageThis = that;
        try {
            await app.getSessionId();
            //已有sessionid，不需要显示login界面
            that.setData(
                { hasSessionId: true, hasChecked: true },
                that.getMoneyFlag
            );
        } catch (err) {
            //没有sessionid，需要显示login界面
            that.setData(
                { hasSessionId: false, hasChecked: true },
                that.getMoneyFlag
            );
        }

        let text;
        if (options.activeType == "0") text = `画出【${options.question}】图片`;
        else if (options.activeType == "1")
            text = `作出【${options.question}】表情`;
        else if (options.activeType == "2") text = `开始扫物挑战`;
        else if (options.activeType == "3") text = `开始动作挑战`;

        that.setData(
            {
                userInfo: {
                    nickname: options.nickName,
                    avatarUrl: options.avaUrl,
                },
                question: options.question,
                quesList: options.quesList,
                activeType: parseInt(options.activeType),
                actionType: parseInt(options.actionType),
                type: app.globalData.typeList[parseInt(options.activeType)],
                redid: parseInt(options.redid),
                MainText: text,
            },
            () => {
                that.getLocalImage(options)
                    .then((url: string) => that.setData({ imgUrl: url }))
                    .catch((url: string) => that.setData({ imgUrl: url }));
            }
        );
    },

    // 下载模型
    async downloadModel(type: number) {
        let task0 = async () => {
            return new Promise<void>(async (resolve, reject) => {
                if (!app.globalData.canvasModel) {
                    try {
                        await loadModel();
                        console.log("load canvasModel succ");
                        resolve();
                    } catch (err) {
                        reject();
                        wx.showToast({
                            title: "load canvasModel error",
                            icon: "none",
                        });
                    }
                } else {
                    console.log("canvasModel模型已加载过");
                    resolve();
                }
            });
        };
        let task1 = async () => {
            return new Promise<void>(async (resolve, reject) => {
                console.log();
                if (
                    //如果模型加载不成功
                    !app.globalData.actionModel ||
                    !app.globalData.actionModel.faceMesh ||
                    !app.globalData.actionModel.ready
                ) {
                    const { Width, Height } = app.globalData;
                    app.globalData.actionModel = new Classifier({
                        width: Width,
                        height: Height,
                    });
                    try {
                        //重新加载
                        await app.globalData.actionModel.load();
                        resolve();
                    } catch (err) {
                        reject();
                    }
                } else {
                    console.log("actionModel模型已加载过");
                    resolve();
                }
            });
        };

        // 决定加载顺序
        if (type == 3) {
            // 从动作红包进入
            await task1();
            task0();
        } else {
            // 从画图红包进入
            await task0();
            task1();
        }
    },

    async judgeAuthority(e: any) {
        const that = this;

        if (that.data.moneyFlag as number <= 0) {
            //错误处理
            // enum texts {
            //     "红包空啦！" = 0,
            //     "您已领取过！" = -1,
            // }
            wx.redirectTo({
                url: "../pages/index/index",
            })
            return
        }
        try {
            let res = await app.getuserinfo();
            that.setData({ uploadUserInfo: res }, async () => {
                await that.postPersondata();
                that.gotoDetail();
            });
        } catch (err) {
            const info = e.detail.args;
            if (!info || !info.detail || !info.detail.userInfo) {
                wx.showToast({
                    title: "授权后才能领取哦！",
                    icon: "none",
                });
                return;
            }
            app.globalData.userInfo = info.detail.userInfo;
            that.setData({ uploadUserInfo: info.detail.userInfo }, async () => {
                await that.postPersondata();
                that.gotoDetail();
            });
        }
    },

    async onShow() {
        const that = this;
        that.downloadModel(that.data.activeType);
        if (!!app.globalData.sessionid) {
            //如果有sessionid了则刷新 moneyflag 领取情况
            that.setData({ hasMoneyFlag: false }, async () => {
                that.getMoneyFlag();
            });
        }
    },

    /* 用户点击右上角分享 */
    onShareAppMessage: function (res) {
        const that = this;
        if (res.from === "button") console.log(res.target);
        if (!that.data.userInfo) return {};
        return {
            title: "转发红包",
            path: `/pages/receiveRedp/receiveRedp?question=${that.data.question}&quesList=${that.data.quesList}&nickName=${that.data.userInfo.nickname}&avaUrl=${that.data.userInfo.avatarUrl}&redid=${that.data.redid}&activeType=${that.data.activeType}&actionType=${that.data.actionType}`,
            success: function (res: any) {
                console.log("转发成功:" + JSON.stringify(res));
            },
            fail: function (res: any) {
                console.log("转发失败:" + JSON.stringify(res));
            },
        };
    },
});
