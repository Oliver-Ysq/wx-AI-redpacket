import { receive } from "../../utils/request/api.js";
import { post } from "../../utils/request/request.js";
import { handleReceive, onetap } from "../../utils/util.js";
const STAY_TIME = 1000;
// const { Width, Height, benchmarkLevel } = getApp().globalData;
const app = getApp();
let counter = 0;
let wrongTime = 0;
let pageThis: WechatMiniprogram.Page.Instance<
    IData,
    WechatMiniprogram.IAnyObject
>;

interface IData {
    titleText: string;
    currentLevel: number;
    bottomText: string[];
    levelMap: string[];
    state: number;
    predicting: boolean;
    maxWrongTime: number;

    startTime?: number;
    canvasThat?: any;
    nickname?: string;
    quesList?: string[];
    avatarUrl?: string;
    redid?: number;
    activeType?: number;
    actionType?: number;
}

Page<IData, WechatMiniprogram.IAnyObject>({
    classifier: null,
    ctx: null,
    data: {
        titleText: "——",
        currentLevel: 0, //当前关卡； 共(0,1,2)三关

        bottomText: ["挑战中...", "挑战成功进入下一关"],
        levelMap: ["第一关", "第二关", "第三关"],
        state: 0, //0：识别中   1：正确，领取红包

        predicting: false,
        maxWrongTime: 5,
    },

    httpReceive(that: any, resolve: any, reject: any) {
        const _that = this;
        post(receive, {
            sessionid: app.globalData.sessionid,
            redid: parseInt(that.data.redid),
        })
            .then((res) => {
                let nowTime = new Date().getTime();
                let spendTime = parseFloat(
                    ((nowTime - _that.data.startTime!) / 1000).toFixed(1)
                );
                handleReceive(res.data, _that, resolve, reject, 3, spendTime);
            })
            .catch((err) => {
                reject("领取失败，网络错误");
                console.log(err);
                wx.showToast({
                    title: "领取失败",
                    icon: "none",
                });
            });
    },

    //提交
    //此处使用了onetap方法，防止多次点按。
    submit: onetap(function () {
        return new Promise((resolve, reject) => {
            const that = pageThis;
            if (that.data.state == 0) {
                reject("状态错误");
                return;
            } else {
                //已经答对题目，可以领取

                console.log(that.data.currentLevel);

                if (that.data.currentLevel >= 2)
                    //第三关才能领
                    that.httpReceive(that, resolve, reject);
                else {
                    //如果不是第三关，则重新加载当前页面并且更新

                    wx.redirectTo({
                        url: `./action?quesList=${JSON.stringify(
                            that.data.quesList
                        )}&nickname=${that.data.nickname}&avatarUrl=${that.data.avatarUrl
                            }&redid=${that.data.redid}&level=${that.data.currentLevel + 1
                            }&actionType=${that.data.actionType}&startTime=${that.data.startTime
                            }`,
                        success: () => {
                            resolve("进入下一关");
                            counter = 0;
                            wrongTime = 0;
                        },
                        fail: () => reject("失败"),
                    });
                }
            }
        });
    }),

    takePhoto() {
        const that = this;
        // if (that.data.imgPath) return;
        that.data.canvasThat.data.listener.stop(); //停止监听数据帧
        if (that.data.state == 0) {
            that.setData(
                {
                    // imgPath: res.tempImagePath,
                    state: 1,
                },
                () =>
                    setTimeout(() => {
                        that.submit();
                    }, STAY_TIME)
            );
        }
    },

    getCanvasThat(res: {
        detail: { that: any; camera: WechatMiniprogram.CameraContext };
    }) {
        this.setData({
            canvasThat: res.detail.that,
            camera: res.detail.camera,
        });
    },

    handleFrame(res: {
        detail: { frame: WechatMiniprogram.OnCameraFrameCallbackResult };
    }) {
        const frame = res.detail.frame;
        counter++;
        if (counter === 5) {
            if (
                app.globalData.actionModel!.isReady()
            ) {
                this.executeClassify(frame);
            }
            counter = 0;
        }
    },

    //初始化模型
    initClassifier() {
        console.log(app.globalData.actionModel)
        if (!app.globalData.actionModel.ready) {
            //未加载完毕则 loading
            wx.showLoading({
                title: "模型加载中..",
            });
        }
    },

    setWrongTimeto0() {
        wrongTime = 0;
        this.setData({
            wrongTime: 0,
        });
    },

    executeClassify(frame: WechatMiniprogram.OnFrameRecordedCallbackResult) {
        const that = this;
        if (
            app.globalData.actionModel &&
            app.globalData.actionModel.isReady() &&
            !that.data.predicting
        ) {
            that.setData(
                {
                    predicting: true,
                },
                () => {
                    app.globalData.actionModel
                        .detectFace(frame)
                        .then((face: any) => {
                            app.globalData.actionModel
                                .getAnswer(face, that.data.titleText)
                                .then(() => {
                                    that.takePhoto();
                                })
                                .catch(() => {
                                    wrongTime++;
                                    console.log(wrongTime);
                                    if (wrongTime === that.data.maxWrongTime) {
                                        that.setData({
                                            wrongTime: that.data.maxWrongTime,
                                        });
                                    }
                                });

                            that.setData({
                                predicting: false,
                            });
                        })
                        .catch((err: any) => console.log(err, err.stack));
                }
            );
        }
    },

    onLoad: function (options: { [key: string]: string }) {
        const that = this;
        pageThis = that;

        let quesList = JSON.parse(options.quesList);
        console.log(quesList);
        that.setData(
            {
                currentLevel: parseInt(options.level) || 0,
                nickname: options.nickname,
                titleText: quesList[options.level || 0],
                quesList: quesList,
                actionType: parseInt(options.actionType),
                avatarUrl: options.avatarUrl,
                redid: parseInt(options.redid),
                startTime:
                    parseFloat(options.startTime) || new Date().getTime(),
            },
            () => {
                if (that.data.currentLevel >= 2)
                    that.setData({
                        bottomText: ["识别中...", "挑战成功"],
                    });
            }
        );
        wx.hideShareMenu({
            menus: ["shareAppMessage", "shareTimeline"],
        });
    },

    onReady: function () {
        this.initClassifier();
    },

    onShow: function () { },

    onHide: function () { },

    onUnload: function () { },

    onReachBottom: function () { },
});
