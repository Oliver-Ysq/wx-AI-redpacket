"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_js_1 = require("../../utils/request/api.js");
const request_js_1 = require("../../utils/request/request.js");
const util_js_1 = require("../../utils/util.js");
const STAY_TIME = 1000;
const app = getApp();
let counter = 0;
let wrongTime = 0;
let pageThis;
Page({
    classifier: null,
    ctx: null,
    data: {
        titleText: "——",
        currentLevel: 0,
        bottomText: ["挑战中...", "挑战成功进入下一关"],
        levelMap: ["第一关", "第二关", "第三关"],
        state: 0,
        predicting: false,
        maxWrongTime: 5,
    },
    httpReceive(that, resolve, reject) {
        const _that = this;
        request_js_1.post(api_js_1.receive, {
            sessionid: app.globalData.sessionid,
            redid: parseInt(that.data.redid),
        })
            .then((res) => {
            let nowTime = new Date().getTime();
            let spendTime = parseFloat(((nowTime - _that.data.startTime) / 1000).toFixed(1));
            util_js_1.handleReceive(res.data, _that, resolve, reject, 3, spendTime);
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
    submit: util_js_1.onetap(function () {
        return new Promise((resolve, reject) => {
            const that = pageThis;
            if (that.data.state == 0) {
                reject("状态错误");
                return;
            }
            else {
                console.log(that.data.currentLevel);
                if (that.data.currentLevel >= 2)
                    that.httpReceive(that, resolve, reject);
                else {
                    wx.redirectTo({
                        url: `./action?quesList=${JSON.stringify(that.data.quesList)}&nickname=${that.data.nickname}&avatarUrl=${that.data.avatarUrl}&redid=${that.data.redid}&level=${that.data.currentLevel + 1}&actionType=${that.data.actionType}&startTime=${that.data.startTime}`,
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
        that.data.canvasThat.data.listener.stop();
        if (that.data.state == 0) {
            that.setData({
                state: 1,
            }, () => setTimeout(() => {
                that.submit();
            }, STAY_TIME));
        }
    },
    getCanvasThat(res) {
        this.setData({
            canvasThat: res.detail.that,
            camera: res.detail.camera,
        });
    },
    handleFrame(res) {
        const frame = res.detail.frame;
        counter++;
        if (counter === 5) {
            if (app.globalData.actionModel.isReady()) {
                this.executeClassify(frame);
            }
            counter = 0;
        }
    },
    initClassifier() {
        console.log(app.globalData.actionModel);
        if (!app.globalData.actionModel.ready) {
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
    executeClassify(frame) {
        const that = this;
        if (app.globalData.actionModel &&
            app.globalData.actionModel.isReady() &&
            !that.data.predicting) {
            that.setData({
                predicting: true,
            }, () => {
                app.globalData.actionModel
                    .detectFace(frame)
                    .then((face) => {
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
                    .catch((err) => console.log(err, err.stack));
            });
        }
    },
    onLoad: function (options) {
        const that = this;
        pageThis = that;
        let quesList = JSON.parse(options.quesList);
        console.log(quesList);
        that.setData({
            currentLevel: parseInt(options.level) || 0,
            nickname: options.nickname,
            titleText: quesList[options.level || 0],
            quesList: quesList,
            actionType: parseInt(options.actionType),
            avatarUrl: options.avatarUrl,
            redid: parseInt(options.redid),
            startTime: parseFloat(options.startTime) || new Date().getTime(),
        }, () => {
            if (that.data.currentLevel >= 2)
                that.setData({
                    bottomText: ["识别中...", "挑战成功"],
                });
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdURBQXFEO0FBQ3JELCtEQUFzRDtBQUN0RCxpREFBNEQ7QUFDNUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBRXZCLE1BQU0sR0FBRyxHQUFHLE1BQU0sRUFBRSxDQUFDO0FBQ3JCLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztBQUNoQixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDbEIsSUFBSSxRQUdILENBQUM7QUFxQkYsSUFBSSxDQUFzQztJQUN0QyxVQUFVLEVBQUUsSUFBSTtJQUNoQixHQUFHLEVBQUUsSUFBSTtJQUNULElBQUksRUFBRTtRQUNGLFNBQVMsRUFBRSxJQUFJO1FBQ2YsWUFBWSxFQUFFLENBQUM7UUFFZixVQUFVLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDO1FBQ25DLFFBQVEsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQy9CLEtBQUssRUFBRSxDQUFDO1FBRVIsVUFBVSxFQUFFLEtBQUs7UUFDakIsWUFBWSxFQUFFLENBQUM7S0FDbEI7SUFFRCxXQUFXLENBQUMsSUFBUyxFQUFFLE9BQVksRUFBRSxNQUFXO1FBQzVDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQztRQUNuQixpQkFBSSxDQUFDLGdCQUFPLEVBQUU7WUFDVixTQUFTLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxTQUFTO1lBQ25DLEtBQUssRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7U0FDbkMsQ0FBQzthQUNHLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ1YsSUFBSSxPQUFPLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNuQyxJQUFJLFNBQVMsR0FBRyxVQUFVLENBQ3RCLENBQUMsQ0FBQyxPQUFP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LEVBQUUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO1lBQzFDLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTtZQUMxQixTQUFTLEVBQUUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO1lBQ3ZDLFFBQVEsRUFBRSxRQUFRO1lBQ2xCLFVBQVUsRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQztZQUN4QyxTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVM7WUFDNUIsS0FBSyxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1lBQzlCLFNBQVMsRUFDTCxVQUFVLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFO1NBQzVELEVBQ0QsR0FBRyxFQUFFO1lBQ0QsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDO2dCQUMzQixJQUFJLENBQUMsT0FBTyxDQUFDO29CQUNULFVBQVUsRUFBRSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUM7aUJBQ2pDLENBQUMsQ0FBQztRQUNYLENBQUMsQ0FDSixDQUFDO1FBQ0YsRUFBRSxDQUFDLGFBQWEsQ0FBQztZQUNiLEtBQUssRUFBRSxDQUFDLGlCQUFpQixFQUFFLGVBQWUsQ0FBQztTQUM5QyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsT0FBTyxFQUFFO1FBQ0wsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFRCxNQUFNLEVBQUUsY0FBYyxDQUFDO0lBRXZCLE1BQU0sRUFBRSxjQUFjLENBQUM7SUFFdkIsUUFBUSxFQUFFLGNBQWMsQ0FBQztJQUV6QixhQUFhLEVBQUUsY0FBYyxDQUFDO0NBQ2pDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJlY2VpdmUgfSBmcm9tIFwiLi4vLi4vdXRpbHMvcmVxdWVzdC9hcGkuanNcIjtcclxuaW1wb3J0IHsgcG9zdCB9IGZyb20gXCIuLi8uLi91dGlscy9yZXF1ZXN0L3JlcXVlc3QuanNcIjtcclxuaW1wb3J0IHsgaGFuZGxlUmVjZWl2ZSwgb25ldGFwIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3V0aWwuanNcIjtcclxuY29uc3QgU1RBWV9USU1FID0gMTAwMDtcclxuLy8gY29uc3QgeyBXaWR0aCwgSGVpZ2h0LCBiZW5jaG1hcmtMZXZlbCB9ID0gZ2V0QXBwKCkuZ2xvYmFsRGF0YTtcclxuY29uc3QgYXBwID0gZ2V0QXBwKCk7XHJcbmxldCBjb3VudGVyID0gMDtcclxubGV0IHdyb25nVGltZSA9IDA7XHJcbmxldCBwYWdlVGhpczogV2VjaGF0TWluaXByb2dyYW0uUGFnZS5JbnN0YW5jZTxcclxuICAgIElEYXRhLFxyXG4gICAgV2VjaGF0TWluaXByb2dyYW0uSUFueU9iamVjdFxyXG4+O1xyXG5cclxuaW50ZXJmYWNlIElEYXRhIHtcclxuICAgIHRpdGxlVGV4dDogc3RyaW5nO1xyXG4gICAgY3VycmVudExldmVsOiBudW1iZXI7XHJcbiAgICBib3R0b21UZXh0OiBzdHJpbmdbXTtcclxuICAgIGxldmVsTWFwOiBzdHJpbmdbXTtcclxuICAgIHN0YXRlOiBudW1iZXI7XHJcbiAgICBwcmVkaWN0aW5nOiBib29sZWFuO1xyXG4gICAgbWF4V3JvbmdUaW1lOiBudW1iZXI7XHJcblxyXG4gICAgc3RhcnRUaW1lPzogbnVtYmVyO1xyXG4gICAgY2FudmFzVGhhdD86IGFueTtcclxuICAgIG5pY2tuYW1lPzogc3RyaW5nO1xyXG4gICAgcXVlc0xpc3Q/OiBzdHJpbmdbXTtcclxuICAgIGF2YXRhclVybD86IHN0cmluZztcclxuICAgIHJlZGlkPzogbnVtYmVyO1xyXG4gICAgYWN0aXZlVHlwZT86IG51bWJlcjtcclxuICAgIGFjdGlvblR5cGU/OiBudW1iZXI7XHJcbn1cclxuXHJcblBhZ2U8SURhdGEsIFdlY2hhdE1pbmlwcm9ncmFtLklBbnlPYmplY3Q+KHtcclxuICAgIGNsYXNzaWZpZXI6IG51bGwsXHJcbiAgICBjdHg6IG51bGwsXHJcbiAgICBkYXRhOiB7XHJcbiAgICAgICAgdGl0bGVUZXh0OiBcIuKAlOKAlFwiLFxyXG4gICAgICAgIGN1cnJlbnRMZXZlbDogMCwgLy/lvZPliY3lhbPljaHvvJsg5YWxKDAsMSwyKeS4ieWFs1xyXG5cclxuICAgICAgICBib3R0b21UZXh0OiBbXCLmjJHmiJjkuK0uLi5cIiwgXCLmjJHmiJjmiJDlip/ov5vlhaXkuIvkuIDlhbNcIl0sXHJcbiAgICAgICAgbGV2ZWxNYXA6IFtcIuesrOS4gOWFs1wiLCBcIuesrOS6jOWFs1wiLCBcIuesrOS4ieWFs1wiXSxcclxuICAgICAgICBzdGF0ZTogMCwgLy8w77ya6K+G5Yir5LitICAgMe+8muato+ehru+8jOmihuWPlue6ouWMhVxyXG5cclxuICAgICAgICBwcmVkaWN0aW5nOiBmYWxzZSxcclxuICAgICAgICBtYXhXcm9uZ1RpbWU6IDUsXHJcbiAgICB9LFxyXG5cclxuICAgIGh0dHBSZWNlaXZlKHRoYXQ6IGFueSwgcmVzb2x2ZTogYW55LCByZWplY3Q6IGFueSkge1xyXG4gICAgICAgIGNvbnN0IF90aGF0ID0gdGhpcztcclxuICAgICAgICBwb3N0KHJlY2VpdmUsIHtcclxuICAgICAgICAgICAgc2Vzc2lvbmlkOiBhcHAuZ2xvYmFsRGF0YS5zZXNzaW9uaWQsXHJcbiAgICAgICAgICAgIHJlZGlkOiBwYXJzZUludCh0aGF0LmRhdGEucmVkaWQpLFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBub3dUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3BlbmRUaW1lID0gcGFyc2VGbG9hdChcclxuICAgICAgICAgICAgICAgICAgICAoKG5vd1RpbWUgLSBfdGhhdC5kYXRhLnN0YXJ0VGltZSEpIC8gMTAwMCkudG9GaXhlZCgxKVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIGhhbmRsZVJlY2VpdmUocmVzLmRhdGEsIF90aGF0LCByZXNvbHZlLCByZWplY3QsIDMsIHNwZW5kVGltZSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoXCLpooblj5blpLHotKXvvIznvZHnu5zplJnor69cIik7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgICAgICAgd3guc2hvd1RvYXN0KHtcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogXCLpooblj5blpLHotKVcIixcclxuICAgICAgICAgICAgICAgICAgICBpY29uOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgLy/mj5DkuqRcclxuICAgIC8v5q2k5aSE5L2/55So5LqGb25ldGFw5pa55rOV77yM6Ziy5q2i5aSa5qyh54K55oyJ44CCXHJcbiAgICBzdWJtaXQ6IG9uZXRhcChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdGhhdCA9IHBhZ2VUaGlzO1xyXG4gICAgICAgICAgICBpZiAodGhhdC5kYXRhLnN0YXRlID09IDApIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChcIueKtuaAgemUmeivr1wiKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8v5bey57uP562U5a+56aKY55uu77yM5Y+v5Lul6aKG5Y+WXHJcblxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhhdC5kYXRhLmN1cnJlbnRMZXZlbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoYXQuZGF0YS5jdXJyZW50TGV2ZWwgPj0gMilcclxuICAgICAgICAgICAgICAgICAgICAvL+esrOS4ieWFs+aJjeiDvemihlxyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuaHR0cFJlY2VpdmUodGhhdCwgcmVzb2x2ZSwgcmVqZWN0KTtcclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8v5aaC5p6c5LiN5piv56ys5LiJ5YWz77yM5YiZ6YeN5paw5Yqg6L295b2T5YmN6aG16Z2i5bm25LiU5pu05pawXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHd4LnJlZGlyZWN0VG8oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGAuL2FjdGlvbj9xdWVzTGlzdD0ke0pTT04uc3RyaW5naWZ5KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5kYXRhLnF1ZXNMaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICl9Jm5pY2tuYW1lPSR7dGhhdC5kYXRhLm5pY2tuYW1lfSZhdmF0YXJVcmw9JHt0aGF0LmRhdGEuYXZhdGFyVXJsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9JnJlZGlkPSR7dGhhdC5kYXRhLnJlZGlkfSZsZXZlbD0ke3RoYXQuZGF0YS5jdXJyZW50TGV2ZWwgKyAxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9JmFjdGlvblR5cGU9JHt0aGF0LmRhdGEuYWN0aW9uVHlwZX0mc3RhcnRUaW1lPSR7dGhhdC5kYXRhLnN0YXJ0VGltZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoXCLov5vlhaXkuIvkuIDlhbNcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudGVyID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdyb25nVGltZSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhaWw6ICgpID0+IHJlamVjdChcIuWksei0pVwiKSxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSksXHJcblxyXG4gICAgdGFrZVBob3RvKCkge1xyXG4gICAgICAgIGNvbnN0IHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIC8vIGlmICh0aGF0LmRhdGEuaW1nUGF0aCkgcmV0dXJuO1xyXG4gICAgICAgIHRoYXQuZGF0YS5jYW52YXNUaGF0LmRhdGEubGlzdGVuZXIuc3RvcCgpOyAvL+WBnOatouebkeWQrOaVsOaNruW4p1xyXG4gICAgICAgIGlmICh0aGF0LmRhdGEuc3RhdGUgPT0gMCkge1xyXG4gICAgICAgICAgICB0aGF0LnNldERhdGEoXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaW1nUGF0aDogcmVzLnRlbXBJbWFnZVBhdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6IDEsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgKCkgPT5cclxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5zdWJtaXQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCBTVEFZX1RJTUUpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBnZXRDYW52YXNUaGF0KHJlczoge1xyXG4gICAgICAgIGRldGFpbDogeyB0aGF0OiBhbnk7IGNhbWVyYTogV2VjaGF0TWluaXByb2dyYW0uQ2FtZXJhQ29udGV4dCB9O1xyXG4gICAgfSkge1xyXG4gICAgICAgIHRoaXMuc2V0RGF0YSh7XHJcbiAgICAgICAgICAgIGNhbnZhc1RoYXQ6IHJlcy5kZXRhaWwudGhhdCxcclxuICAgICAgICAgICAgY2FtZXJhOiByZXMuZGV0YWlsLmNhbWVyYSxcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgaGFuZGxlRnJhbWUocmVzOiB7XHJcbiAgICAgICAgZGV0YWlsOiB7IGZyYW1lOiBXZWNoYXRNaW5pcHJvZ3JhbS5PbkNhbWVyYUZyYW1lQ2FsbGJhY2tSZXN1bHQgfTtcclxuICAgIH0pIHtcclxuICAgICAgICBjb25zdCBmcmFtZSA9IHJlcy5kZXRhaWwuZnJhbWU7XHJcbiAgICAgICAgY291bnRlcisrO1xyXG4gICAgICAgIGlmIChjb3VudGVyID09PSA1KSB7XHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgIGFwcC5nbG9iYWxEYXRhLmFjdGlvbk1vZGVsIS5pc1JlYWR5KClcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV4ZWN1dGVDbGFzc2lmeShmcmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY291bnRlciA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvL+WIneWni+WMluaooeWei1xyXG4gICAgaW5pdENsYXNzaWZpZXIoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYXBwLmdsb2JhbERhdGEuYWN0aW9uTW9kZWwpXHJcbiAgICAgICAgaWYgKCFhcHAuZ2xvYmFsRGF0YS5hY3Rpb25Nb2RlbC5yZWFkeSkge1xyXG4gICAgICAgICAgICAvL+acquWKoOi9veWujOavleWImSBsb2FkaW5nXHJcbiAgICAgICAgICAgIHd4LnNob3dMb2FkaW5nKHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiBcIuaooeWei+WKoOi9veS4rS4uXCIsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgc2V0V3JvbmdUaW1ldG8wKCkge1xyXG4gICAgICAgIHdyb25nVGltZSA9IDA7XHJcbiAgICAgICAgdGhpcy5zZXREYXRhKHtcclxuICAgICAgICAgICAgd3JvbmdUaW1lOiAwLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBleGVjdXRlQ2xhc3NpZnkoZnJhbWU6IFdlY2hhdE1pbmlwcm9ncmFtLk9uRnJhbWVSZWNvcmRlZENhbGxiYWNrUmVzdWx0KSB7XHJcbiAgICAgICAgY29uc3QgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICBhcHAuZ2xvYmFsRGF0YS5hY3Rpb25Nb2RlbCAmJlxyXG4gICAgICAgICAgICBhcHAuZ2xvYmFsRGF0YS5hY3Rpb25Nb2RlbC5pc1JlYWR5KCkgJiZcclxuICAgICAgICAgICAgIXRoYXQuZGF0YS5wcmVkaWN0aW5nXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2V0RGF0YShcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBwcmVkaWN0aW5nOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBhcHAuZ2xvYmFsRGF0YS5hY3Rpb25Nb2RlbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZGV0ZWN0RmFjZShmcmFtZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGZhY2U6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwLmdsb2JhbERhdGEuYWN0aW9uTW9kZWxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZ2V0QW5zd2VyKGZhY2UsIHRoYXQuZGF0YS50aXRsZVRleHQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0LnRha2VQaG90bygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd3JvbmdUaW1lKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHdyb25nVGltZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3cm9uZ1RpbWUgPT09IHRoYXQuZGF0YS5tYXhXcm9uZ1RpbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuc2V0RGF0YSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd3JvbmdUaW1lOiB0aGF0LmRhdGEubWF4V3JvbmdUaW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0LnNldERhdGEoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZWRpY3Rpbmc6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyOiBhbnkpID0+IGNvbnNvbGUubG9nKGVyciwgZXJyLnN0YWNrKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIChvcHRpb25zOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9KSB7XHJcbiAgICAgICAgY29uc3QgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgcGFnZVRoaXMgPSB0aGF0O1xyXG5cclxuICAgICAgICBsZXQgcXVlc0xpc3QgPSBKU09OLnBhcnNlKG9wdGlvbnMucXVlc0xpc3QpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHF1ZXNMaXN0KTtcclxuICAgICAgICB0aGF0LnNldERhdGEoXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRMZXZlbDogcGFyc2VJbnQob3B0aW9ucy5sZXZlbCkgfHwgMCxcclxuICAgICAgICAgICAgICAgIG5pY2tuYW1lOiBvcHRpb25zLm5pY2tuYW1lLFxyXG4gICAgICAgICAgICAgICAgdGl0bGVUZXh0OiBxdWVzTGlzdFtvcHRpb25zLmxldmVsIHx8IDBdLFxyXG4gICAgICAgICAgICAgICAgcXVlc0xpc3Q6IHF1ZXNMaXN0LFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uVHlwZTogcGFyc2VJbnQob3B0aW9ucy5hY3Rpb25UeXBlKSxcclxuICAgICAgICAgICAgICAgIGF2YXRhclVybDogb3B0aW9ucy5hdmF0YXJVcmwsXHJcbiAgICAgICAgICAgICAgICByZWRpZDogcGFyc2VJbnQob3B0aW9ucy5yZWRpZCksXHJcbiAgICAgICAgICAgICAgICBzdGFydFRpbWU6XHJcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VGbG9hdChvcHRpb25zLnN0YXJ0VGltZSkgfHwgbmV3IERhdGUoKS5nZXRUaW1lKCksXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGF0LmRhdGEuY3VycmVudExldmVsID49IDIpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zZXREYXRhKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm90dG9tVGV4dDogW1wi6K+G5Yir5LitLi4uXCIsIFwi5oyR5oiY5oiQ5YqfXCJdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgKTtcclxuICAgICAgICB3eC5oaWRlU2hhcmVNZW51KHtcclxuICAgICAgICAgICAgbWVudXM6IFtcInNoYXJlQXBwTWVzc2FnZVwiLCBcInNoYXJlVGltZWxpbmVcIl0sXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIG9uUmVhZHk6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmluaXRDbGFzc2lmaWVyKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIG9uU2hvdzogZnVuY3Rpb24gKCkgeyB9LFxyXG5cclxuICAgIG9uSGlkZTogZnVuY3Rpb24gKCkgeyB9LFxyXG5cclxuICAgIG9uVW5sb2FkOiBmdW5jdGlvbiAoKSB7IH0sXHJcblxyXG4gICAgb25SZWFjaEJvdHRvbTogZnVuY3Rpb24gKCkgeyB9LFxyXG59KTtcclxuIl19