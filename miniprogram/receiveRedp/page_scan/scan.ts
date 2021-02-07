// import { receive, saowu } from "../../utils/request/api.js";
import { receive } from "../../utils/request/api.js";
import { post } from "../../utils/request/request.js";
import { onetap, handleReceive } from "../../utils/util.js";
const app = getApp();
const STAY_TIME = 1200;
let pageThis: WechatMiniprogram.Page.Instance<
    IData,
    WechatMiniprogram.IAnyObject
>;

interface IData {
    bottomTexts: string[];
    state: number;
    imgPath: string;

    titleText?: string;
    avatarUrl?: string;
    redid?: number;
    activeType?: number;
    actionType?: number;
    startTime?: number;
    camera?: any;
}

Page<IData, WechatMiniprogram.IAnyObject>({
    data: {
        bottomTexts: ["识别中...", "识别不成功，再试试吧", "挑战成功"],
        imgPath: "",
        state: -1,
        /********** 
        state:
        -1：初始状态    
         0：识别中   
         1：失败，重试   
         2：正确，领取红包
        ************/
    },

    onCameraError(err: any) {
        console.log(err)
        wx.showToast({ title: 'camera error', icon: "none" })
    },

    //提交
    //此处使用了onetap方法，防止多次点按。
    submit: onetap(function () {
        return new Promise((resolve, reject) => {
            const that = pageThis;
            if (that.data.state !== 2) {
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
                            (
                                (nowTime - (that.data.startTime as number)) /
                                1000
                            ).toFixed(1)
                        );
                        handleReceive(
                            res.data,
                            that,
                            resolve,
                            reject,
                            2,
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
        that.data.camera.takePhoto({
            success(res: any) {
                if (that.data.state === -1 || that.data.state === 1) {
                    that.setData({
                        imgPath: res.tempImagePath,
                        state: 0
                    }, () => {
                        that.checkImg(res.tempImagePath)
                    })
                }
            }
        })
    },

    restart() {
        const that = this
        that.setData({
            state: -1,
            imgPath: ""
        })
    },

    judgeResult(data: any) {
        const that = this
        if (data.tabs && data.tabs[0] && data.tabs[0].link_keyword && data.tabs[0].link_keyword.includes(that.data.titleText)) {
            that.setData({ state: 2 }, () => {
                setTimeout(() => {
                    that.submit();
                }, STAY_TIME)
            })
        } else {
            that.setData({ state: 1 })
        }
    },


    checkImg(tempImagePath: string) {
        const that = this
        let data = { "mode": 1, "src": 3 };
        wx.uploadFile({
            filePath: tempImagePath,
            name: 'file',
            url: 'https://mp.weixin.qq.com/wxamusic/apidebug_imagequery?action=scan_cover_img&r=' + JSON.stringify(data),
            success(res1) {
                let req_key = JSON.parse(res1.data)['req_key'];
                console.log('req_key：', req_key);
                wx.request({
                    url: 'https://mp.weixin.qq.com/wxamusic/apidebug_imagequery?action=retrieval_by_reqkey&r=' + JSON.stringify({ "req_key": req_key }),
                    method: "GET",
                    success(res) {
                        console.log('预测结果：', res.data);
                        that.judgeResult(res.data)
                    },
                    fail: (err) => {
                        wx.showToast({ title: "上传失败，请重试", icon: "none" });
                        that.setData({ state: 1 });
                        console.log(err);
                    }
                });
            },
            fail: (err) => {
                wx.showToast({ title: "上传失败，请重试", icon: "none" });
                that.setData({ state: 1 });
                console.log(err);
            }
        });
    },


    onLoad: function (options: { [key: string]: string }) {
        console.log(options);
        const that = this;
        pageThis = that
        that.setData({
            nickname: options.nickname,
            titleText: options.question,
            avatarUrl: options.avatarUrl,
            redid: parseInt(options.redid),
            startTime: new Date().getTime(),
        });
        wx.hideShareMenu({ menus: ["shareAppMessage", "shareTimeline"] });
    },

    onReady: function () {
        const that = this;
        const camera = wx.createCameraContext();
        that.setData({
            cameraHeight: app.globalData.appHeight * 0.79,
            cameraWidth:
                Math.floor((app.globalData.appWidth * 0.933) / 32) * 32,
            camera,
        });
    },
    onShow: function () { },
    onHide: function () { },
    onUnload: function () { },
});
