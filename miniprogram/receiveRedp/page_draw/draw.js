"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_js_1 = require("../../utils/request/api.js");
const request_js_1 = require("../../utils/request/request.js");
const util_js_1 = require("../../utils/util.js");
const model_1 = require("./model/model");
const app = getApp();
let pageThis;
let prevPoint = [-1, -1];
let pointRecord = [];
Page({
    data: {
        resultText: [
            "......",
            "识别中...",
            "识别不了，再试试吧~",
            "你画出来了，真棒~",
        ],
        state: 0,
        canGetMoney: false,
        closeCanvas: true,
        picInfo: null,
    },
    touchStart: function (e) {
        if (this.data.closeCanvas)
            return;
        const that = this;
        let { x, y } = e.touches[0];
        let tempPoint = pointRecord;
        tempPoint.push({ x, y });
        prevPoint = [x, y];
        pointRecord = tempPoint;
        that.setData({ state: 1 });
    },
    touchMove: function (e) {
        const that = this;
        if (that.data.closeCanvas)
            return;
        let x = e.touches[0].x, y = e.touches[0].y;
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
        const PIC = model_1.getPicBox(pointRecord);
        this.setData({ picInfo: PIC }, () => {
            model_1.judgeByModels(PIC, that)
                .then((myanswer) => {
                that.judgeResult(myanswer);
            })
                .catch((err) => console.log(err));
        });
    },
    clearCanvas: function () {
        let that = this;
        if (that.data.closeCanvas)
            return;
        console.log("clearSketcher");
        pointRecord = [];
        this.canvas = wx.createCanvasContext("canvas");
        this.canvas.fillStyle = "#FFFFFF";
        this.canvas.fillRect(0, 0, this.data.canvasw, this.data.canvash);
        this.canvas.draw();
        this.canvas.lineWidth = 4 * app.globalData.baseLengthRatio;
    },
    judgeResult: function (resText) {
        const that = this;
        console.log("正确答案是：" + that.data.titleText);
        if (resText.includes(that.data.titleText)) {
            that.setData({
                closeCanvas: true,
                state: 3,
            });
        }
        else {
            console.log("你画的好像是：“" + resText + "”哦");
            this.setData({
                state: 2,
            });
        }
    },
    submit: util_js_1.onetap(function () {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const that = pageThis;
                if (that.data.closeCanvas && that.data.state == 3) {
                    try {
                        let res1 = yield request_js_1.post(api_js_1.receive, {
                            sessionid: app.globalData.sessionid,
                            redid: parseInt(that.data.redid),
                        });
                        console.log(res1);
                        let nowTime = new Date().getTime();
                        let spendTime = parseFloat(((nowTime - that.data.startTime) / 1000).toFixed(1));
                        util_js_1.handleReceive(res1.data, that, resolve, reject, 0, spendTime);
                    }
                    catch (err) {
                        console.log(err);
                        wx.showToast({
                            title: "领取失败",
                            icon: "none",
                        });
                    }
                }
            }));
        });
    }),
    onLoad: function (options) {
        console.log(options);
        const that = this;
        pageThis = that;
        wx.getSystemInfo({
            success: function (res) {
                console.log("system init");
                let canvasw = res.windowWidth;
                let canvash = res.windowHeight * 0.54;
                console.log(canvasw, canvash);
                that.setData({
                    canvasw: canvasw,
                    canvash: canvash,
                });
            },
        });
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
    onReady() {
        return __awaiter(this, void 0, void 0, function* () {
            const that = this;
            this.canvas = wx.createCanvasContext("canvas");
            this.canvas.fillStyle = "#FFFFFF";
            this.canvas.fillRect(0, 0, that.data.canvasw, that.data.canvash);
            this.canvas.lineWidth = 4 * app.globalData.baseLengthRatio;
            this.canvas.strokeStyle = "#000000";
            this.canvas.lineCap = "round";
            if (!app.globalData.canvasModel) {
                wx.showLoading({
                    title: "模型加载中..",
                });
            }
            else {
                that.setData({ closeCanvas: false });
            }
            model_1.getLabels().then((res) => that.setData({ labels: res }));
            that.setData({ startTime: new Date().getTime() });
        });
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhdy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRyYXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHVEQUFxRDtBQUNyRCwrREFBc0Q7QUFDdEQsaURBQTREO0FBQzVELHlDQUFvRTtBQUNwRSxNQUFNLEdBQUcsR0FBRyxNQUFNLEVBQUUsQ0FBQztBQUNyQixJQUFJLFFBQWEsQ0FBQztBQUNsQixJQUFJLFNBQVMsR0FBYSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsSUFBSSxXQUFXLEdBQW9DLEVBQUUsQ0FBQztBQWdCdEQsSUFBSSxDQUFzQztJQUN0QyxJQUFJLEVBQUU7UUFDRixVQUFVLEVBQUU7WUFDUixRQUFRO1lBQ1IsUUFBUTtZQUNSLFlBQVk7WUFDWixXQUFXO1NBQ2Q7UUFDRCxLQUFLLEVBQUUsQ0FBQztRQUNSLFdBQVcsRUFBRSxLQUFLO1FBQ2xCLFdBQVcsRUFBRSxJQUFJO1FBQ2pCLE9BQU8sRUFBRSxJQUFJO0tBQ2hCO0lBR0QsVUFBVSxFQUFFLFVBQVUsQ0FBTTtRQUN4QixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVztZQUFFLE9BQU87UUFDbEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU1QixJQUFJLFNBQVMsR0FBRyxXQUFXLENBQUM7UUFDNUIsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3pCLFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNuQixXQUFXLEdBQUcsU0FBUyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMvQixDQUFDO0lB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QUFDLE9BQU8sQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN0RCxDQUFDO0tBQUE7Q0FDSixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByZWNlaXZlIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3JlcXVlc3QvYXBpLmpzXCI7XHJcbmltcG9ydCB7IHBvc3QgfSBmcm9tIFwiLi4vLi4vdXRpbHMvcmVxdWVzdC9yZXF1ZXN0LmpzXCI7XHJcbmltcG9ydCB7IG9uZXRhcCwgaGFuZGxlUmVjZWl2ZSB9IGZyb20gXCIuLi8uLi91dGlscy91dGlsLmpzXCI7XHJcbmltcG9ydCB7IGdldFBpY0JveCwgZ2V0TGFiZWxzLCBqdWRnZUJ5TW9kZWxzIH0gZnJvbSBcIi4vbW9kZWwvbW9kZWxcIjtcclxuY29uc3QgYXBwID0gZ2V0QXBwKCk7XHJcbmxldCBwYWdlVGhpczogYW55O1xyXG5sZXQgcHJldlBvaW50OiBudW1iZXJbXSA9IFstMSwgLTFdO1xyXG5sZXQgcG9pbnRSZWNvcmQ6IEFycmF5PHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfT4gPSBbXTtcclxuXHJcbmludGVyZmFjZSBJRGF0YSB7XHJcbiAgICByZXN1bHRUZXh0OiBzdHJpbmdbXTtcclxuICAgIHN0YXRlOiBudW1iZXI7IC8vMO+8mmluaXQgICAx77ya55S75Zu+5LitICAgMu+8muivhuWIq+Wksei0pSAgIDPvvJror4bliKvmiJDlip9cclxuICAgIGNhbkdldE1vbmV5OiBib29sZWFuO1xyXG4gICAgY2xvc2VDYW52YXM6IGJvb2xlYW47XHJcbiAgICBwaWNJbmZvOiBhbnk7XHJcbiAgICB0aXRsZVRleHQ/OiBzdHJpbmc7XHJcbiAgICByZWRpZD86IG51bWJlcjtcclxuICAgIG1vbmV5PzogbnVtYmVyO1xyXG4gICAgbmlja25hbWU/OiBzdHJpbmc7XHJcbiAgICBjYW52YXN3PzogbnVtYmVyO1xyXG4gICAgY2FudmFzaD86IG51bWJlcjtcclxufVxyXG5cclxuUGFnZTxJRGF0YSwgV2VjaGF0TWluaXByb2dyYW0uSUFueU9iamVjdD4oe1xyXG4gICAgZGF0YToge1xyXG4gICAgICAgIHJlc3VsdFRleHQ6IFtcclxuICAgICAgICAgICAgXCIuLi4uLi5cIixcclxuICAgICAgICAgICAgXCLor4bliKvkuK0uLi5cIixcclxuICAgICAgICAgICAgXCLor4bliKvkuI3kuobvvIzlho3or5Xor5XlkKd+XCIsXHJcbiAgICAgICAgICAgIFwi5L2g55S75Ye65p2l5LqG77yM55yf5qOSflwiLFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgc3RhdGU6IDAsIC8vMO+8mmluaXQgICAx77ya55S75Zu+5LitICAgMu+8muivhuWIq+Wksei0pSAgIDPvvJror4bliKvmiJDlip9cclxuICAgICAgICBjYW5HZXRNb25leTogZmFsc2UsXHJcbiAgICAgICAgY2xvc2VDYW52YXM6IHRydWUsXHJcbiAgICAgICAgcGljSW5mbzogbnVsbCxcclxuICAgIH0sXHJcblxyXG4gICAgLy/lvIDlp4vnlLvlm74qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgIHRvdWNoU3RhcnQ6IGZ1bmN0aW9uIChlOiBhbnkpIHtcclxuICAgICAgICBpZiAodGhpcy5kYXRhLmNsb3NlQ2FudmFzKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgbGV0IHsgeCwgeSB9ID0gZS50b3VjaGVzWzBdO1xyXG4gICAgICAgIC8vIHRoaXMuY2FudmFzLmxpbmVXaWR0aCA9IDQgKiBhcHAuZ2xvYmFsRGF0YS5iYXNlTGVuZ3RoUmF0aW87XHJcbiAgICAgICAgbGV0IHRlbXBQb2ludCA9IHBvaW50UmVjb3JkO1xyXG4gICAgICAgIHRlbXBQb2ludC5wdXNoKHsgeCwgeSB9KTtcclxuICAgICAgICBwcmV2UG9pbnQgPSBbeCwgeV07XHJcbiAgICAgICAgcG9pbnRSZWNvcmQgPSB0ZW1wUG9pbnQ7XHJcbiAgICAgICAgdGhhdC5zZXREYXRhKHsgc3RhdGU6IDEgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8v55S75Zu+5LitXHJcbiAgICB0b3VjaE1vdmU6IGZ1bmN0aW9uIChlOiBhbnkpIHtcclxuICAgICAgICBjb25zdCB0aGF0ID0gdGhpcztcclxuICAgICAgICBpZiAodGhhdC5kYXRhLmNsb3NlQ2FudmFzKSByZXR1cm47XHJcbiAgICAgICAgbGV0IHggPSBlLnRvdWNoZXNbMF0ueCxcclxuICAgICAgICAgICAgeSA9IGUudG91Y2hlc1swXS55O1xyXG4gICAgICAgIGNvbnN0IFBQID0gcHJldlBvaW50O1xyXG4gICAgICAgIHRoaXMuY2FudmFzLmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLm1vdmVUbyhQUFswXSwgUFBbMV0pO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLmxpbmVUbyh4LCB5KTtcclxuICAgICAgICB0aGlzLmNhbnZhcy5zdHJva2UoKTtcclxuICAgICAgICB0aGlzLmNhbnZhcy5jbG9zZVBhdGgoKTtcclxuICAgICAgICB0aGlzLmNhbnZhcy5kcmF3KHRydWUpO1xyXG4gICAgICAgIGxldCB0ZW1wUG9pbnQgPSBwb2ludFJlY29yZDtcclxuICAgICAgICB0ZW1wUG9pbnQucHVzaCh7IHgsIHkgfSk7XHJcbiAgICAgICAgcHJldlBvaW50ID0gW3gsIHldO1xyXG4gICAgICAgIHBvaW50UmVjb3JkID0gdGVtcFBvaW50O1xyXG4gICAgfSxcclxuXHJcbiAgICBkcmF3RW5kKCkge1xyXG4gICAgICAgIGNvbnN0IHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIGNvbnN0IFBJQyA9IGdldFBpY0JveChwb2ludFJlY29yZCk7XHJcbiAgICAgICAgdGhpcy5zZXREYXRhKHsgcGljSW5mbzogUElDIH0sICgpID0+IHtcclxuICAgICAgICAgICAganVkZ2VCeU1vZGVscyhQSUMsIHRoYXQpXHJcbiAgICAgICAgICAgICAgICAudGhlbigobXlhbnN3ZXIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0Lmp1ZGdlUmVzdWx0KG15YW5zd2VyKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goKGVycikgPT4gY29uc29sZS5sb2coZXJyKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8v5riF6Zmk55S75p2/XHJcbiAgICBjbGVhckNhbnZhczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcclxuICAgICAgICBpZiAodGhhdC5kYXRhLmNsb3NlQ2FudmFzKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiY2xlYXJTa2V0Y2hlclwiKTtcclxuICAgICAgICBwb2ludFJlY29yZCA9IFtdO1xyXG4gICAgICAgIHRoaXMuY2FudmFzID0gd3guY3JlYXRlQ2FudmFzQ29udGV4dChcImNhbnZhc1wiKTtcclxuICAgICAgICB0aGlzLmNhbnZhcy5maWxsU3R5bGUgPSBcIiNGRkZGRkZcIjtcclxuICAgICAgICB0aGlzLmNhbnZhcy5maWxsUmVjdCgwLCAwLCB0aGlzLmRhdGEuY2FudmFzdywgdGhpcy5kYXRhLmNhbnZhc2gpO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLmRyYXcoKTtcclxuICAgICAgICB0aGlzLmNhbnZhcy5saW5lV2lkdGggPSA0ICogYXBwLmdsb2JhbERhdGEuYmFzZUxlbmd0aFJhdGlvO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKioqIOWIpOaWree7k+aenCAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgIGp1ZGdlUmVzdWx0OiBmdW5jdGlvbiAocmVzVGV4dDogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCLmraPnoa7nrZTmoYjmmK/vvJpcIiArIHRoYXQuZGF0YS50aXRsZVRleHQpO1xyXG4gICAgICAgIGlmIChyZXNUZXh0LmluY2x1ZGVzKHRoYXQuZGF0YS50aXRsZVRleHQgYXMgc3RyaW5nKSkge1xyXG4gICAgICAgICAgICB0aGF0LnNldERhdGEoe1xyXG4gICAgICAgICAgICAgICAgY2xvc2VDYW52YXM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzdGF0ZTogMyxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCLkvaDnlLvnmoTlpb3lg4/mmK/vvJrigJxcIiArIHJlc1RleHQgKyBcIuKAneWTplwiKTtcclxuICAgICAgICAgICAgdGhpcy5zZXREYXRhKHtcclxuICAgICAgICAgICAgICAgIHN0YXRlOiAyLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8v6aKG5Y+W57qi5YyFKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAvL+atpOWkhOS9v+eUqOS6hm9uZXRhcOaWueazle+8jOmYsuatouWkmuasoeeCueaMieOAglxyXG4gICAgc3VibWl0OiBvbmV0YXAoYXN5bmMgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRoYXQgPSBwYWdlVGhpcztcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGF0LmRhdGEuY2xvc2VDYW52YXMgJiYgdGhhdC5kYXRhLnN0YXRlID09IDMpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlczEgPSBhd2FpdCBwb3N0KHJlY2VpdmUsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbmlkOiBhcHAuZ2xvYmFsRGF0YS5zZXNzaW9uaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZGlkOiBwYXJzZUludCh0aGF0LmRhdGEucmVkaWQpLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlczEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBub3dUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNwZW5kVGltZSA9IHBhcnNlRmxvYXQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICgobm93VGltZSAtIHRoYXQuZGF0YS5zdGFydFRpbWUpIC8gMTAwMCkudG9GaXhlZCgxKVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlUmVjZWl2ZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzMS5kYXRhLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwZW5kVGltZVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHd4LnNob3dUb2FzdCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBcIumihuWPluWksei0pVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSksXHJcblxyXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAob3B0aW9uczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKG9wdGlvbnMpO1xyXG4gICAgICAgIGNvbnN0IHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIHBhZ2VUaGlzID0gdGhhdDtcclxuXHJcbiAgICAgICAgLy/ojrflj5borr7lpIflrr3pq5jkv6Hmga9cclxuICAgICAgICB3eC5nZXRTeXN0ZW1JbmZvKHtcclxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlcykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJzeXN0ZW0gaW5pdFwiKTtcclxuICAgICAgICAgICAgICAgIGxldCBjYW52YXN3ID0gcmVzLndpbmRvd1dpZHRoOyAvL+iuvuWkh+WuveW6plxyXG4gICAgICAgICAgICAgICAgbGV0IGNhbnZhc2ggPSByZXMud2luZG93SGVpZ2h0ICogMC41NDtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGNhbnZhc3csIGNhbnZhc2gpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zZXREYXRhKHtcclxuICAgICAgICAgICAgICAgICAgICBjYW52YXN3OiBjYW52YXN3LFxyXG4gICAgICAgICAgICAgICAgICAgIGNhbnZhc2g6IGNhbnZhc2gsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy/orr7nva7popjnm67kv6Hmga/lkozkuKrkurrkv6Hmga9cclxuICAgICAgICB0aGF0LnNldERhdGEoe1xyXG4gICAgICAgICAgICB0aXRsZVRleHQ6IG9wdGlvbnMucXVlc3Rpb24sXHJcbiAgICAgICAgICAgIHJlZGlkOiBwYXJzZUludChvcHRpb25zLnJlZGlkKSxcclxuICAgICAgICAgICAgYXZhdGFyVXJsOiBvcHRpb25zLmF2YXRhclVybCxcclxuICAgICAgICAgICAgbmlja25hbWU6IG9wdGlvbnMubmlja25hbWUsXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHd4LmhpZGVTaGFyZU1lbnUoe1xyXG4gICAgICAgICAgICBtZW51czogW1wic2hhcmVBcHBNZXNzYWdlXCIsIFwic2hhcmVUaW1lbGluZVwiXSxcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgYXN5bmMgb25SZWFkeSgpIHtcclxuICAgICAgICAvL+e7keWummNhbnZhc+W5tuWIneWni+WMllxyXG4gICAgICAgIGNvbnN0IHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuY2FudmFzID0gd3guY3JlYXRlQ2FudmFzQ29udGV4dChcImNhbnZhc1wiKTtcclxuICAgICAgICB0aGlzLmNhbnZhcy5maWxsU3R5bGUgPSBcIiNGRkZGRkZcIjtcclxuICAgICAgICB0aGlzLmNhbnZhcy5maWxsUmVjdCgwLCAwLCB0aGF0LmRhdGEuY2FudmFzdywgdGhhdC5kYXRhLmNhbnZhc2gpO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLmxpbmVXaWR0aCA9IDQgKiBhcHAuZ2xvYmFsRGF0YS5iYXNlTGVuZ3RoUmF0aW87XHJcbiAgICAgICAgdGhpcy5jYW52YXMuc3Ryb2tlU3R5bGUgPSBcIiMwMDAwMDBcIjtcclxuICAgICAgICB0aGlzLmNhbnZhcy5saW5lQ2FwID0gXCJyb3VuZFwiO1xyXG5cclxuICAgICAgICBpZiAoIWFwcC5nbG9iYWxEYXRhLmNhbnZhc01vZGVsKSB7XHJcbiAgICAgICAgICAgIC8v5bey57uP5Yqg6L295a6M5q+V5YiZ5YWz6ZetbG9hZGluZ1xyXG4gICAgICAgICAgICB3eC5zaG93TG9hZGluZyh7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogXCLmqKHlnovliqDovb3kuK0uLlwiLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGF0LnNldERhdGEoeyBjbG9zZUNhbnZhczogZmFsc2UgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdldExhYmVscygpLnRoZW4oKHJlcykgPT4gdGhhdC5zZXREYXRhKHsgbGFiZWxzOiByZXMgfSkpO1xyXG5cclxuICAgICAgICB0aGF0LnNldERhdGEoeyBzdGFydFRpbWU6IG5ldyBEYXRlKCkuZ2V0VGltZSgpIH0pO1xyXG4gICAgfSxcclxufSk7XHJcbiJdfQ==