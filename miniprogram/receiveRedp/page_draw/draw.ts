import { receive } from "../../utils/request/api.js";
import { post } from "../../utils/request/request.js";
import { onetap, handleReceive } from "../../utils/util.js";
import { getPicBox, getLabels, judgeByModels } from "./model/model";
const app = getApp();
let pageThis: any;
let prevPoint: number[] = [-1, -1];
let pointRecord: Array<{ x: number; y: number }> = [];

interface IData {
    resultText: string[];
    state: number; //0：init   1：画图中   2：识别失败   3：识别成功
    canGetMoney: boolean;
    closeCanvas: boolean;
    picInfo: any;
    titleText?: string;
    redid?: number;
    money?: number;
    nickname?: string;
    canvasw?: number;
    canvash?: number;
}

Page<IData, WechatMiniprogram.IAnyObject>({
    data: {
        resultText: [
            "......",
            "识别中...",
            "识别不了，再试试吧~",
            "你画出来了，真棒~",
        ],
        state: 0, //0：init   1：画图中   2：识别失败   3：识别成功
        canGetMoney: false,
        closeCanvas: true,
        picInfo: null,
    },

    //开始画图***************************************
    touchStart: function (e: any) {
        if (this.data.closeCanvas) return;
        const that = this;
        let { x, y } = e.touches[0];
        // this.canvas.lineWidth = 4 * app.globalData.baseLengthRatio;
        let tempPoint = pointRecord;
        tempPoint.push({ x, y });
        prevPoint = [x, y];
        pointRecord = tempPoint;
        that.setData({ state: 1 });
    },

    //画图中
    touchMove: function (e: any) {
        const that = this;
        if (that.data.closeCanvas) return;
        let x = e.touches[0].x,
            y = e.touches[0].y;
        const PP = prevPoint;
        this.canvas.beginPath();
        this.canvas.moveTo(PP[0], PP[1]);
        this.canvas.lineTo(x, y);
        this.canvas.stroke();
        this.canvas.closePath();
        this.canvas.draw(true);
        let tempPoint = pointRecord;
        tempPoint.push({ x, y });
        prevPoint = [x, y];
        pointRecord = tempPoint;
    },

    drawEnd() {
        const that = this;
        const PIC = getPicBox(pointRecord);
        this.setData({ picInfo: PIC }, () => {
            judgeByModels(PIC, that)
                .then((myanswer) => {
                    that.judgeResult(myanswer);
                })
                .catch((err) => console.log(err));
        });
    },

    //清除画板
    clearCanvas: function () {
        let that = this;
        if (that.data.closeCanvas) return;

        console.log("clearSketcher");
        pointRecord = [];
        this.canvas = wx.createCanvasContext("canvas");
        this.canvas.fillStyle = "#FFFFFF";
        this.canvas.fillRect(0, 0, this.data.canvasw, this.data.canvash);
        this.canvas.draw();
        this.canvas.lineWidth = 4 * app.globalData.baseLengthRatio;
    },

    /*** 判断结果 **************************************/
    judgeResult: function (resText: string) {
        const that = this;
        console.log("正确答案是：" + that.data.titleText);
        if (resText.includes(that.data.titleText as string)) {
            that.setData({
                closeCanvas: true,
                state: 3,
            });
        } else {
            console.log("你画的好像是：“" + resText + "”哦");
            this.setData({
                state: 2,
            });
        }
    },

    //领取红包***************************************
    //此处使用了onetap方法，防止多次点按。
    submit: onetap(async function () {
        return new Promise(async (resolve, reject) => {
            const that = pageThis;

            if (that.data.closeCanvas && that.data.state == 3) {
                try {
                    let res1 = await post(receive, {
                        sessionid: app.globalData.sessionid,
                        redid: parseInt(that.data.redid),
                    });
                    console.log(res1);
                    let nowTime = new Date().getTime();
                    let spendTime = parseFloat(
                        ((nowTime - that.data.startTime) / 1000).toFixed(1)
                    );
                    handleReceive(
                        res1.data,
                        that,
                        resolve,
                        reject,
                        0,
                        spendTime
                    );
                } catch (err) {
                    console.log(err);
                    wx.showToast({
                        title: "领取失败",
                        icon: "none",
                    });
                }
            }
        });
    }),

    onLoad: function (options: { [key: string]: string }) {
        console.log(options);
        const that = this;
        pageThis = that;

        //获取设备宽高信息
        wx.getSystemInfo({
            success: function (res) {
                console.log("system init");
                let canvasw = res.windowWidth; //设备宽度
                let canvash = res.windowHeight * 0.54;
                console.log(canvasw, canvash);
                that.setData({
                    canvasw: canvasw,
                    canvash: canvash,
                });
            },
        });

        //设置题目信息和个人信息
        that.setData({
            titleText: options.question,
            redid: parseInt(options.redid),
            avatarUrl: options.avatarUrl,
            nickname: options.nickname,
        });

        wx.hideShareMenu({
            menus: ["shareAppMessage", "shareTimeline"],
        });
    },

    async onReady() {
        //绑定canvas并初始化
        const that = this;
        this.canvas = wx.createCanvasContext("canvas");
        this.canvas.fillStyle = "#FFFFFF";
        this.canvas.fillRect(0, 0, that.data.canvasw, that.data.canvash);
        this.canvas.lineWidth = 4 * app.globalData.baseLengthRatio;
        this.canvas.strokeStyle = "#000000";
        this.canvas.lineCap = "round";

        if (!app.globalData.canvasModel) {
            //已经加载完毕则关闭loading
            wx.showLoading({
                title: "模型加载中..",
            });
        } else {
            that.setData({ closeCanvas: false });
        }
        getLabels().then((res) => that.setData({ labels: res }));

        that.setData({ startTime: new Date().getTime() });
    },
});
