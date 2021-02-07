import { receive } from "../../utils/request/api.js";
import { post } from "../../utils/request/request.js";
import { onetap, handleReceive } from "../../utils/util.js";
import { loadmodel, detect } from "./model/faceBusiness";
let count = 0;
// 每60帧取1帧进行判断
const speedMaxCount = 30;
/* 接收红包后的跳转延迟 */
const STAY_TIME = 1000;
const isReserveDraw = false;
const canvasId = "canvas1";
const app = getApp();
let wrongTime = 0;
let pageThis: WechatMiniprogram.Page.Instance<
    IData,
    WechatMiniprogram.IAnyObject
>;

interface IData {
    titleText: string;
    buttonText: string[];
    state: number;
    maxWrongTime: number;
    ModelsReady: boolean;

    redid?: number;
    startTime?: number;
    canvasThat?: any;
}

Page<IData, WechatMiniprogram.IAnyObject>({
    data: {
        titleText: "开心",
        buttonText: ["识别中...", "领取红包"],
        state: 0, //0：识别中   1：正确，领取红包
        maxWrongTime: 2,
        ModelsReady: false,
    },

    //提交
    //设置了节流，时间为1s。
    submit: onetap(function () {
        return new Promise((resolve, reject) => {
            const that = pageThis;
            if (that.data.state == 0) {
                reject("状态错误");
                return;
            } else {
                //已经答对题目，可以领取

                post(receive, {
                    sessionid: app.globalData.sessionid,
                    redid: that.data.redid,
                })
                    .then((res) => {
                        console.log(res);
                        let nowTime = new Date().getTime();
                        let spendTime = parseFloat(
                            ((nowTime - that.data.startTime!) / 1000).toFixed(1)
                        );
                        handleReceive(
                            res.data,
                            that,
                            resolve,
                            reject,
                            1,
                            spendTime
                        );
                    })
                    .catch((err) => {
                        console.log(err);
                        wx.showToast({
                            title: "领取失败",
                            icon: "none",
                        });
                    });
            }
        });
    }),

    takePhoto() {
        const that = this;
        // if (that.data.imgPath) return
        that.data.canvasThat.data.listener.stop(); //停止监听数据帧
        if (that.data.state == 0) {
            that.setData({
                // imgPath: res.tempImagePath,
                state: 1,
            });
            setTimeout(() => {
                that.submit();
            }, STAY_TIME);
        }
        // camera.takePhoto({
        //   success(res) {
        //     if (that.data.state == 0) {
        //       that.setData({
        //         imgPath: res.tempImagePath,
        //         state: 1
        //       })
        //       setTimeout(() => {
        //         that.submit()
        //       }, STAY_TIME)
        //     }
        //   }
        // })
    },

    setWrongTimeto0() {
        wrongTime = 0;
        this.setData({
            wrongTime: 0,
        });
    },

    getCanvasThat(res: any) {
        this.setData({
            canvasThat: res.detail.that,
            camera: res.detail.camera,
        });
    },

    async handleFrame(res: {
        detail: { frame: WechatMiniprogram.OnCameraFrameCallbackResult };
    }) {
        if (!this.data.ModelsReady) return;
        const that = this;
        const frame = res.detail.frame;

        if (count < speedMaxCount) {
            count++;
            return;
        }
        count = 0;
        const theFrame = {
            data: new Uint8ClampedArray(frame.data),
            width: frame.width,
            height: frame.height,
        };
        // process
        const question = that.data.titleText;
        console.log("题目是" + question);
        let result = await detect(
            theFrame,
            frame.width,
            frame.height,
            question
        );
        if (result) {
            that.takePhoto();
        } else {
            wrongTime++;
            console.log(wrongTime);
            if (wrongTime === that.data.maxWrongTime) {
                that.setData({
                    wrongTime: that.data.maxWrongTime,
                });
            }
        }
    },

    async onLoad(options: { [key: string]: string }) {
        const that = this;
        pageThis = that;
        that.setData({
            nickname: options.nickname,
            titleText: options.question,
            redid: parseInt(options.redid),
            avatarUrl: options.avatarUrl,
            startTime: new Date().getTime(),
        });

        wx.showLoading({
            title: "Loading...",
        });
        await loadmodel(canvasId, isReserveDraw);
        wx.hideLoading();
        that.setData({
            ModelsReady: true,
        });
    },

    onReady: function () {
        wx.hideShareMenu({
            menus: ["shareAppMessage", "shareTimeline"],
        });
    },

    onShow: function () {},

    onHide: function () {},

    onUnload: function () {
        const that = this;
        let listener = that.data.canvasThat.data.listener;
        if (listener) listener.stop();
    },
});
