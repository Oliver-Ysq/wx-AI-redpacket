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
const api_js_1 = require("../utils/request/api.js");
const request_js_1 = require("../utils/request/request.js");
const util_1 = require("../utils/util");
const app = getApp();
let pageThis;
const model_js_1 = require("./page_draw/model/model.js");
const model_js_2 = require("./page_action/model/model.js");
Page({
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
    gotoDetail: util_1.onetap(function () {
        return new Promise((resolve, reject) => {
            console.log("open redpacket!");
            const that = pageThis;
            if (that.data.moneyFlag > 0) {
                const map = ["draw", "emotion", "scan", "action"];
                const type = that.data.activeType;
                if ([1, 2, 3].includes(type)) {
                    let url_1_2 = `./page_${map[type]}/${map[type]}?question=${that.data.question}&nickname=${that.data.userInfo.nickname}&avatarUrl=${that.data.userInfo.avatarUrl}&redid=${that.data.redid}`;
                    let url_3 = `./page_${map[type]}/${map[type]}?quesList=${that.data.quesList}&nickname=${that.data.userInfo.nickname}&avatarUrl=${that.data.userInfo.avatarUrl}&redid=${that.data.redid}&actionType=${that.data.actionType}`;
                    wx.getSetting({
                        success: (response) => {
                            if (!response.authSetting["scope.camera"]) {
                                wx.authorize({
                                    scope: "scope.camera",
                                    success() {
                                        console.log("已获取摄像头权限");
                                        wx.navigateTo({
                                            url: type === 3 ? url_3 : url_1_2,
                                            complete: () => resolve("进入" + map[type]),
                                        });
                                    },
                                    fail: () => reject("cameraError"),
                                });
                            }
                            else {
                                console.log("已获取摄像机权限");
                                wx.navigateTo({
                                    url: type === 3 ? url_3 : url_1_2,
                                    complete: () => resolve("进入" + map[type]),
                                });
                            }
                        },
                        fail: () => reject("获取用户信息失败"),
                    });
                }
                else if (type === 0) {
                    wx.navigateTo({
                        url: `./page_${map[type]}/${map[type]}?question=${that.data.question}&nickname=${that.data.userInfo.nickname}&avatarUrl=${that.data.userInfo.avatarUrl}&redid=${that.data.redid}`,
                        complete: () => resolve("进入" + map[type]),
                    });
                }
                else
                    reject("activeType类型错误");
            }
        });
    }),
    getMoneyFlag() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const that = this;
                try {
                    let remainRes = yield request_js_1.post(api_js_1.remainRedpack, {
                        redid: that.data.redid,
                        sessionid: app.globalData.sessionid,
                    });
                    console.log("remainRedpack:" + JSON.stringify(remainRes.data));
                    that.setData({
                        moneyFlag: remainRes.data.flag,
                        money: remainRes.data.money,
                    }, () => that.setData({ hasMoneyFlag: true }, () => resolve()));
                }
                catch (err) {
                    console.log(err);
                    wx.showToast({
                        title: "未知错误",
                        icon: "none",
                    });
                    reject();
                }
            }));
        });
    },
    postPersondata() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const that = this;
                try {
                    yield request_js_1.post(api_js_1.persondata, {
                        sessionid: app.globalData.sessionid,
                        name: that.data.uploadUserInfo.nickName,
                        avaurl: that.data.uploadUserInfo.avatarUrl,
                    });
                    resolve();
                }
                catch (err) {
                    reject();
                }
            }));
        });
    },
    setNewRedp: util_1.throttle(() => {
        wx.reLaunch({
            url: "/pages/index/index",
        });
    }, 1000),
    getLocalImage(options) {
        return new Promise((resolve, reject) => {
            const that = pageThis;
            let map;
            (function (map) {
                map[map["draw_img"] = 0] = "draw_img";
                map[map["emotion_img"] = 1] = "emotion_img";
                map[map["scan_img"] = 2] = "scan_img";
                map[map["action_img"] = 3] = "action_img";
            })(map || (map = {}));
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
    checkDetail() {
        const that = this;
        const url = `./getMoney/getMoney?moneyFlag=${that.data.moneyFlag > 0 ? "1" : that.data.moneyFlag}&money=${that.data.money}&question=${that.data.question}&redid=${that.data.redid}&nickname=${that.data.userInfo.nickname}&activeType=${that.data.activeType}&avatarUrl=${that.data.userInfo.avatarUrl}`;
        wx.navigateTo({
            url,
            success: () => console.log("查看详情"),
        });
    },
    setupApp() {
        this.setData({ hasSessionId: true });
    },
    onLoad(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const that = this;
            pageThis = that;
            try {
                yield app.getSessionId();
                that.setData({ hasSessionId: true, hasChecked: true }, that.getMoneyFlag);
            }
            catch (err) {
                that.setData({ hasSessionId: false, hasChecked: true }, that.getMoneyFlag);
            }
            let text;
            if (options.activeType == "0")
                text = `画出【${options.question}】图片`;
            else if (options.activeType == "1")
                text = `作出【${options.question}】表情`;
            else if (options.activeType == "2")
                text = `开始扫物挑战`;
            else if (options.activeType == "3")
                text = `开始动作挑战`;
            that.setData({
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
            }, () => {
                that.getLocalImage(options)
                    .then((url) => that.setData({ imgUrl: url }))
                    .catch((url) => that.setData({ imgUrl: url }));
            });
        });
    },
    downloadModel(type) {
        return __awaiter(this, void 0, void 0, function* () {
            let task0 = () => __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    if (!app.globalData.canvasModel) {
                        try {
                            yield model_js_1.loadModel();
                            console.log("load canvasModel succ");
                            resolve();
                        }
                        catch (err) {
                            reject();
                            wx.showToast({
                                title: "load canvasModel error",
                                icon: "none",
                            });
                        }
                    }
                    else {
                        console.log("canvasModel模型已加载过");
                        resolve();
                    }
                }));
            });
            let task1 = () => __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    console.log();
                    if (!app.globalData.actionModel ||
                        !app.globalData.actionModel.faceMesh ||
                        !app.globalData.actionModel.ready) {
                        const { Width, Height } = app.globalData;
                        app.globalData.actionModel = new model_js_2.Classifier({
                            width: Width,
                            height: Height,
                        });
                        try {
                            yield app.globalData.actionModel.load();
                            resolve();
                        }
                        catch (err) {
                            reject();
                        }
                    }
                    else {
                        console.log("actionModel模型已加载过");
                        resolve();
                    }
                }));
            });
            if (type == 3) {
                yield task1();
                task0();
            }
            else {
                yield task0();
                task1();
            }
        });
    },
    judgeAuthority(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const that = this;
            if (that.data.moneyFlag <= 0) {
                wx.redirectTo({
                    url: "../pages/index/index",
                });
                return;
            }
            try {
                let res = yield app.getuserinfo();
                that.setData({ uploadUserInfo: res }, () => __awaiter(this, void 0, void 0, function* () {
                    yield that.postPersondata();
                    that.gotoDetail();
                }));
            }
            catch (err) {
                const info = e.detail.args;
                if (!info || !info.detail || !info.detail.userInfo) {
                    wx.showToast({
                        title: "授权后才能领取哦！",
                        icon: "none",
                    });
                    return;
                }
                app.globalData.userInfo = info.detail.userInfo;
                that.setData({ uploadUserInfo: info.detail.userInfo }, () => __awaiter(this, void 0, void 0, function* () {
                    yield that.postPersondata();
                    that.gotoDetail();
                }));
            }
        });
    },
    onShow() {
        return __awaiter(this, void 0, void 0, function* () {
            const that = this;
            that.downloadModel(that.data.activeType);
            if (!!app.globalData.sessionid) {
                that.setData({ hasMoneyFlag: false }, () => __awaiter(this, void 0, void 0, function* () {
                    that.getMoneyFlag();
                }));
            }
        });
    },
    onShareAppMessage: function (res) {
        const that = this;
        if (res.from === "button")
            console.log(res.target);
        if (!that.data.userInfo)
            return {};
        return {
            title: "转发红包",
            path: `/pages/receiveRedp/receiveRedp?question=${that.data.question}&quesList=${that.data.quesList}&nickName=${that.data.userInfo.nickname}&avaUrl=${that.data.userInfo.avatarUrl}&redid=${that.data.redid}&activeType=${that.data.activeType}&actionType=${that.data.actionType}`,
            success: function (res) {
                console.log("转发成功:" + JSON.stringify(res));
            },
            fail: function (res) {
                console.log("转发失败:" + JSON.stringify(res));
            },
        };
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjZWl2ZVJlZHAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZWNlaXZlUmVkcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQ0Esb0RBQW9FO0FBQ3BFLDREQUFtRDtBQUNuRCx3Q0FBaUQ7QUFDakQsTUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFFLENBQUM7QUFDckIsSUFBSSxRQUdILENBQUM7QUFFRix5REFBdUQ7QUFDdkQsMkRBQTBEO0FBcUIxRCxJQUFJLENBQXNDO0lBQ3RDLElBQUksRUFBRTtRQUNGLFVBQVUsRUFBRSxLQUFLO1FBQ2pCLFlBQVksRUFBRSxLQUFLO1FBQ25CLFlBQVksRUFBRSxLQUFLO1FBRW5CLFdBQVcsRUFBRSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFNBQVMsQ0FBQztRQUNsRCxXQUFXLEVBQUU7WUFDVCxPQUFPO1lBQ1AsU0FBUztZQUNULFFBQVE7WUFDUixRQUFRO1NBQ1g7UUFFRCxPQUFPLEVBQUU7WUFDTCxnRkFBZ0Y7WUFDaEYsbUZBQW1GO1lBQ25GLGdGQUFnRjtZQUNoRixrRkFBa0Y7U0FDckY7UUFDRCxPQUFPLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQztLQUN0RDtJQUdELFVBQVUsRUFBRSxhQUFNLENBQUM7UUFDZixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ25DLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUMvQixNQUFNLElBQUksR0FBb0IsUUFBUSxDQUFDO1lBRXZDLElBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFvQixHQUFHLENBQUMsRUFBRTtnQkFFckMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDbEQsTUFBTSxJQUFJLEdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxV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QUFhLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxhQUFhLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsV0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLFVBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLGVBQWUsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLGVBQWUsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDbFIsT0FBTyxFQUFFLFVBQVUsR0FBUTtnQkFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQy9DLENBQUM7WUFDRCxJQUFJLEVBQUUsVUFBVSxHQUFRO2dCQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0MsQ0FBQztTQUNKLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gcGFnZXMvcmVjZWl2ZS9yZWNlaXZlLmpzXHJcbmltcG9ydCB7IHBlcnNvbmRhdGEsIHJlbWFpblJlZHBhY2sgfSBmcm9tIFwiLi4vdXRpbHMvcmVxdWVzdC9hcGkuanNcIjtcclxuaW1wb3J0IHsgcG9zdCB9IGZyb20gXCIuLi91dGlscy9yZXF1ZXN0L3JlcXVlc3QuanNcIjtcclxuaW1wb3J0IHsgdGhyb3R0bGUsIG9uZXRhcCB9IGZyb20gXCIuLi91dGlscy91dGlsXCI7XHJcbmNvbnN0IGFwcCA9IGdldEFwcCgpO1xyXG5sZXQgcGFnZVRoaXM6IFdlY2hhdE1pbmlwcm9ncmFtLlBhZ2UuSW5zdGFuY2U8XHJcbiAgICBJRGF0YSxcclxuICAgIFdlY2hhdE1pbmlwcm9ncmFtLklBbnlPYmplY3RcclxuPjtcclxuXHJcbmltcG9ydCB7IGxvYWRNb2RlbCB9IGZyb20gXCIuL3BhZ2VfZHJhdy9tb2RlbC9tb2RlbC5qc1wiO1xyXG5pbXBvcnQgeyBDbGFzc2lmaWVyIH0gZnJvbSBcIi4vcGFnZV9hY3Rpb24vbW9kZWwvbW9kZWwuanNcIjtcclxuXHJcbmludGVyZmFjZSBJRGF0YSB7XHJcbiAgICBoYXNDaGVja2VkOiBib29sZWFuO1xyXG4gICAgaGFzTW9uZXlGbGFnOiBib29sZWFuO1xyXG4gICAgaGFzU2Vzc2lvbklkOiBib29sZWFuO1xyXG4gICAgdGV4dExpbmVPbmU6IHN0cmluZ1tdO1xyXG4gICAgdGV4dExpbmVUd286IHN0cmluZ1tdO1xyXG4gICAgaW1nTGlzdDogc3RyaW5nW107XHJcbiAgICBjYW5JVXNlOiBib29sZWFuO1xyXG4gICAgdXBsb2FkVXNlckluZm8/OiB7IG5pY2tOYW1lOiBzdHJpbmc7IGF2YXRhclVybDogc3RyaW5nIH07XHJcbiAgICByZWRpZD86IG51bWJlcjtcclxuICAgIG1vbmV5PzogbnVtYmVyO1xyXG4gICAgbW9uZXlGbGFnPzogbnVtYmVyO1xyXG4gICAgYWN0aXZlVHlwZT86IG51bWJlcjtcclxuICAgIGFjdGlvblR5cGU/OiBudW1iZXI7XHJcbiAgICBxdWVzdGlvbj86IHN0cmluZztcclxuICAgIHVzZXJJbmZvPzogeyBuaWNrbmFtZTogc3RyaW5nOyBhdmF0YXJVcmw6IHN0cmluZyB9O1xyXG4gICAgcXVlc0xpc3Q/OiBzdHJpbmc7XHJcbn1cclxuXHJcblBhZ2U8SURhdGEsIFdlY2hhdE1pbmlwcm9ncmFtLklBbnlPYmplY3Q+KHtcclxuICAgIGRhdGE6IHtcclxuICAgICAgICBoYXNDaGVja2VkOiBmYWxzZSxcclxuICAgICAgICBoYXNNb25leUZsYWc6IGZhbHNlLFxyXG4gICAgICAgIGhhc1Nlc3Npb25JZDogZmFsc2UsXHJcblxyXG4gICAgICAgIHRleHRMaW5lT25lOiBbXCLmjKXliqjmiYvmjIdcIiwgXCLmnaXvvIzlgZrkuKrooajmg4VcIiwgXCLmiZPlvIDnm7jmnLpcIiwgXCLliqjliqjohJHooovliqjliqjmiYtcIl0sXHJcbiAgICAgICAgdGV4dExpbmVUd286IFtcclxuICAgICAgICAgICAgXCLkuIDotbflsJ3or5XkuItcIixcclxuICAgICAgICAgICAgXCLorqnlpKflrrblvIDlv4PlvIDlv4NcIixcclxuICAgICAgICAgICAgXCLmnaXlr7vmib7nianlk4HlkKdcIixcclxuICAgICAgICAgICAgXCLlv6vmnaXmtLvliqjkuIDkuItcIixcclxuICAgICAgICBdLFxyXG5cclxuICAgICAgICBpbWdMaXN0OiBbXHJcbiAgICAgICAgICAgIFwiaHR0cHM6Ly93ZWl4aW5yZWRwYWNrZXQtMTI1ODM0NDcwNy5maWxlLm15cWNsb3VkLmNvbS9tb2JpbGVuZXQvc3RhdGljL2RyYXcuc3ZnXCIsXHJcbiAgICAgICAgICAgIFwiaHR0cHM6Ly93ZWl4aW5yZWRwYWNrZXQtMTI1ODM0NDcwNy5maWxlLm15cWNsb3VkLmNvbS9tb2JpbGVuZXQvc3RhdGljL2Vtb3Rpb24uc3ZnXCIsXHJcbiAgICAgICAgICAgIFwiaHR0cHM6Ly93ZWl4aW5yZWRwYWNrZXQtMTI1ODM0NDcwNy5maWxlLm15cWNsb3VkLmNvbS9tb2JpbGVuZXQvc3RhdGljL3NjYW4uc3ZnXCIsXHJcbiAgICAgICAgICAgIFwiaHR0cHM6Ly93ZWl4aW5yZWRwYWNrZXQtMTI1ODM0NDcwNy5maWxlLm15cWNsb3VkLmNvbS9tb2JpbGVuZXQvc3RhdGljL2FjdGlvbi5zdmdcIixcclxuICAgICAgICBdLFxyXG4gICAgICAgIGNhbklVc2U6IHd4LmNhbklVc2UoXCJidXR0b24ub3Blbi10eXBlLmdldFVzZXJJbmZvXCIpLFxyXG4gICAgfSxcclxuXHJcbiAgICAvL+mihuWPlue6ouWMhVxyXG4gICAgZ290b0RldGFpbDogb25ldGFwKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIm9wZW4gcmVkcGFja2V0IVwiKTtcclxuICAgICAgICAgICAgY29uc3QgdGhhdDogdHlwZW9mIHBhZ2VUaGlzID0gcGFnZVRoaXM7XHJcblxyXG4gICAgICAgICAgICBpZiAoKHRoYXQuZGF0YS5tb25leUZsYWcgYXMgbnVtYmVyKSA+IDApIHtcclxuICAgICAgICAgICAgICAgIC8v57qi5YyF5pyJ5Ymp5L2ZXHJcbiAgICAgICAgICAgICAgICBjb25zdCBtYXAgPSBbXCJkcmF3XCIsIFwiZW1vdGlvblwiLCBcInNjYW5cIiwgXCJhY3Rpb25cIl07XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlOiBudW1iZXIgPSB0aGF0LmRhdGEuYWN0aXZlVHlwZSBhcyBudW1iZXI7XHJcbiAgICAgICAgICAgICAgICBpZiAoWzEsIDIsIDNdLmluY2x1ZGVzKHR5cGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHVybF8xXzIgPSBgLi9wYWdlXyR7bWFwW3R5cGVdfS8ke21hcFt0eXBlXX0/cXVlc3Rpb249JHt0aGF0LmRhdGEucXVlc3Rpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSZuaWNrbmFtZT0ke3RoYXQuZGF0YS51c2VySW5mbyEubmlja25hbWV9JmF2YXRhclVybD0ke3RoYXQuZGF0YS51c2VySW5mbyEuYXZhdGFyVXJsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0mcmVkaWQ9JHt0aGF0LmRhdGEucmVkaWR9YDtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdXJsXzMgPSBgLi9wYWdlXyR7bWFwW3R5cGVdfS8ke21hcFt0eXBlXX0/cXVlc0xpc3Q9JHt0aGF0LmRhdGEucXVlc0xpc3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSZuaWNrbmFtZT0ke3RoYXQuZGF0YS51c2VySW5mbyEubmlja25hbWV9JmF2YXRhclVybD0ke3RoYXQuZGF0YS51c2VySW5mbyEuYXZhdGFyVXJsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0mcmVkaWQ9JHt0aGF0LmRhdGEucmVkaWR9JmFjdGlvblR5cGU9JHt0aGF0LmRhdGEuYWN0aW9uVHlwZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9YDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgd3guZ2V0U2V0dGluZyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5hdXRoU2V0dGluZ1tcInNjb3BlLmNhbWVyYVwiXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHd4LmF1dGhvcml6ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlOiBcInNjb3BlLmNhbWVyYVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLlt7Lojrflj5bmkYTlg4/lpLTmnYPpmZBcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3eC5uYXZpZ2F0ZVRvKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHR5cGUgPT09IDMgPyB1cmxfMyA6IHVybF8xXzIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6ICgpID0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoXCLov5vlhaVcIiArIG1hcFt0eXBlXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbDogKCkgPT4gcmVqZWN0KFwiY2FtZXJhRXJyb3JcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi5bey6I635Y+W5pGE5YOP5py65p2D6ZmQXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHd4Lm5hdmlnYXRlVG8oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHR5cGUgPT09IDMgPyB1cmxfMyA6IHVybF8xXzIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiAoKSA9PiByZXNvbHZlKFwi6L+b5YWlXCIgKyBtYXBbdHlwZV0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmYWlsOiAoKSA9PiByZWplY3QoXCLojrflj5bnlKjmiLfkv6Hmga/lpLHotKVcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB3eC5uYXZpZ2F0ZVRvKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBgLi9wYWdlXyR7bWFwW3R5cGVdfS8ke21hcFt0eXBlXX0/cXVlc3Rpb249JHt0aGF0LmRhdGEucXVlc3Rpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0mbmlja25hbWU9JHt0aGF0LmRhdGEudXNlckluZm8hLm5pY2tuYW1lfSZhdmF0YXJVcmw9JHt0aGF0LmRhdGEudXNlckluZm8hLmF2YXRhclVybFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSZyZWRpZD0ke3RoYXQuZGF0YS5yZWRpZH1gLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogKCkgPT4gcmVzb2x2ZShcIui/m+WFpVwiICsgbWFwW3R5cGVdKSxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSByZWplY3QoXCJhY3RpdmVUeXBl57G75Z6L6ZSZ6K+vXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KSxcclxuXHJcbiAgICAvL3JlbWFpblJlZHBhY2tcclxuICAgIC8v5L6d6LWW77yac2Vzc2lvbmlkXHJcbiAgICBhc3luYyBnZXRNb25leUZsYWcoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVtYWluUmVzID0gYXdhaXQgcG9zdChyZW1haW5SZWRwYWNrLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVkaWQ6IHRoYXQuZGF0YS5yZWRpZCxcclxuICAgICAgICAgICAgICAgICAgICBzZXNzaW9uaWQ6IGFwcC5nbG9iYWxEYXRhLnNlc3Npb25pZCxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZW1haW5SZWRwYWNrOlwiICsgSlNPTi5zdHJpbmdpZnkocmVtYWluUmVzLmRhdGEpKTtcclxuICAgICAgICAgICAgICAgIC8vbW9uZXlGbGFnICAgICAgIDDvvJrlt7LpooblrowgICAtMe+8muW3sumihui/hyAgID4w77ya5Y+v5Lul6aKG5Y+WXHJcbiAgICAgICAgICAgICAgICB0aGF0LnNldERhdGEoXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb25leUZsYWc6IHJlbWFpblJlcy5kYXRhLmZsYWcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vbmV5OiByZW1haW5SZXMuZGF0YS5tb25leSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHRoYXQuc2V0RGF0YSh7IGhhc01vbmV5RmxhZzogdHJ1ZSB9LCAoKSA9PiByZXNvbHZlKCkpXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgICAgICAgICB3eC5zaG93VG9hc3Qoe1xyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBcIuacquefpemUmeivr1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIGljb246IFwibm9uZVwiLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICAvL+S4iuS8oOeUqOaIt+S/oeaBr+WIsOWQjuWPsFxyXG4gICAgLy/kvp3otZbvvJpzZXNzaW9uaWTvvIxuaWNrbmFtZe+8jGF2YXVybFxyXG4gICAgYXN5bmMgcG9zdFBlcnNvbmRhdGEoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBwb3N0KHBlcnNvbmRhdGEsIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXNzaW9uaWQ6IGFwcC5nbG9iYWxEYXRhLnNlc3Npb25pZCxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiB0aGF0LmRhdGEudXBsb2FkVXNlckluZm8hLm5pY2tOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIGF2YXVybDogdGhhdC5kYXRhLnVwbG9hZFVzZXJJbmZvIS5hdmF0YXJVcmwsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICAvL+WOu+WPkemAgeaWsOe6ouWMhe+8muS9v+eUqOiKgua1ge+8jOaXtumXtOS4ujFzXHJcbiAgICBzZXROZXdSZWRwOiB0aHJvdHRsZSgoKSA9PiB7XHJcbiAgICAgICAgd3gucmVMYXVuY2goe1xyXG4gICAgICAgICAgICB1cmw6IFwiL3BhZ2VzL2luZGV4L2luZGV4XCIsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LCAxMDAwKSxcclxuXHJcbiAgICAvLyDojrflj5bnvJPlrZjlm77niYdcclxuICAgIGdldExvY2FsSW1hZ2Uob3B0aW9uczogeyBhY3RpdmVUeXBlOiBzdHJpbmcgfSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRoYXQgPSBwYWdlVGhpcztcclxuICAgICAgICAgICAgZW51bSBtYXAge1xyXG4gICAgICAgICAgICAgICAgXCJkcmF3X2ltZ1wiLFxyXG4gICAgICAgICAgICAgICAgXCJlbW90aW9uX2ltZ1wiLFxyXG4gICAgICAgICAgICAgICAgXCJzY2FuX2ltZ1wiLFxyXG4gICAgICAgICAgICAgICAgXCJhY3Rpb25faW1nXCIsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IHVybCA9IHd4LmdldFN0b3JhZ2VTeW5jKG1hcFtwYXJzZUludChvcHRpb25zLmFjdGl2ZVR5cGUpXSk7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBjb25zdCBmaWxlTWFuYWdlciA9IHd4LmdldEZpbGVTeXN0ZW1NYW5hZ2VyKCk7XHJcbiAgICAgICAgICAgIGlmICghIXVybCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLnvJPlrZjlnLDlnYDvvJpcIiArIHVybCk7XHJcbiAgICAgICAgICAgICAgICBmaWxlTWFuYWdlci5hY2Nlc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IHVybCxcclxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEgPSBmaWxlTWFuYWdlci5yZWFkRmlsZVN5bmModXJsLCBcImJhc2U2NFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShgZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCwke2RhdGF9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmYWlsKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QodGhhdC5kYXRhLmltZ0xpc3RbcGFyc2VJbnQob3B0aW9ucy5hY3RpdmVUeXBlKV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZWplY3QodGhhdC5kYXRhLmltZ0xpc3RbcGFyc2VJbnQob3B0aW9ucy5hY3RpdmVUeXBlKV0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICAvLyDpooblrozlkI7vvJrmn6XnnIvor6bmg4VcclxuICAgIGNoZWNrRGV0YWlsKCkge1xyXG4gICAgICAgIGNvbnN0IHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIGNvbnN0IHVybCA9IGAuL2dldE1vbmV5L2dldE1vbmV5P21vbmV5RmxhZz0keyh0aGF0LmRhdGEubW9uZXlGbGFnIGFzIG51bWJlcikgPiAwID8gXCIxXCIgOiB0aGF0LmRhdGEubW9uZXlGbGFnXHJcbiAgICAgICAgICAgIH0mbW9uZXk9JHt0aGF0LmRhdGEubW9uZXl9JnF1ZXN0aW9uPSR7dGhhdC5kYXRhLnF1ZXN0aW9ufSZyZWRpZD0ke3RoYXQuZGF0YS5yZWRpZFxyXG4gICAgICAgICAgICB9Jm5pY2tuYW1lPSR7KHRoYXQuZGF0YS51c2VySW5mbyBhcyBhbnkpLm5pY2tuYW1lfSZhY3RpdmVUeXBlPSR7dGhhdC5kYXRhLmFjdGl2ZVR5cGVcclxuICAgICAgICAgICAgfSZhdmF0YXJVcmw9JHsodGhhdC5kYXRhLnVzZXJJbmZvIGFzIGFueSkuYXZhdGFyVXJsfWA7XHJcbiAgICAgICAgd3gubmF2aWdhdGVUbyh7XHJcbiAgICAgICAgICAgIHVybCxcclxuICAgICAgICAgICAgc3VjY2VzczogKCkgPT4gY29uc29sZS5sb2coXCLmn6XnnIvor6bmg4VcIiksXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHNldHVwQXBwKCkge1xyXG4gICAgICAgIHRoaXMuc2V0RGF0YSh7IGhhc1Nlc3Npb25JZDogdHJ1ZSB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgYXN5bmMgb25Mb2FkKG9wdGlvbnM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0pIHtcclxuICAgICAgICBjb25zdCB0aGF0ID0gdGhpcztcclxuICAgICAgICBwYWdlVGhpcyA9IHRoYXQ7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgYXdhaXQgYXBwLmdldFNlc3Npb25JZCgpO1xyXG4gICAgICAgICAgICAvL+W3suaciXNlc3Npb25pZO+8jOS4jemcgOimgeaYvuekumxvZ2lu55WM6Z2iXHJcbiAgICAgICAgICAgIHRoYXQuc2V0RGF0YShcclxuICAgICAgICAgICAgICAgIHsgaGFzU2Vzc2lvbklkOiB0cnVlLCBoYXNDaGVja2VkOiB0cnVlIH0sXHJcbiAgICAgICAgICAgICAgICB0aGF0LmdldE1vbmV5RmxhZ1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICAvL+ayoeaciXNlc3Npb25pZO+8jOmcgOimgeaYvuekumxvZ2lu55WM6Z2iXHJcbiAgICAgICAgICAgIHRoYXQuc2V0RGF0YShcclxuICAgICAgICAgICAgICAgIHsgaGFzU2Vzc2lvbklkOiBmYWxzZSwgaGFzQ2hlY2tlZDogdHJ1ZSB9LFxyXG4gICAgICAgICAgICAgICAgdGhhdC5nZXRNb25leUZsYWdcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB0ZXh0O1xyXG4gICAgICAgIGlmIChvcHRpb25zLmFjdGl2ZVR5cGUgPT0gXCIwXCIpIHRleHQgPSBg55S75Ye644CQJHtvcHRpb25zLnF1ZXN0aW9ufeOAkeWbvueJh2A7XHJcbiAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5hY3RpdmVUeXBlID09IFwiMVwiKVxyXG4gICAgICAgICAgICB0ZXh0ID0gYOS9nOWHuuOAkCR7b3B0aW9ucy5xdWVzdGlvbn3jgJHooajmg4VgO1xyXG4gICAgICAgIGVsc2UgaWYgKG9wdGlvbnMuYWN0aXZlVHlwZSA9PSBcIjJcIikgdGV4dCA9IGDlvIDlp4vmiavnianmjJHmiJhgO1xyXG4gICAgICAgIGVsc2UgaWYgKG9wdGlvbnMuYWN0aXZlVHlwZSA9PSBcIjNcIikgdGV4dCA9IGDlvIDlp4vliqjkvZzmjJHmiJhgO1xyXG5cclxuICAgICAgICB0aGF0LnNldERhdGEoXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHVzZXJJbmZvOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmlja25hbWU6IG9wdGlvbnMubmlja05hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgYXZhdGFyVXJsOiBvcHRpb25zLmF2YVVybCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBxdWVzdGlvbjogb3B0aW9ucy5xdWVzdGlvbixcclxuICAgICAgICAgICAgICAgIHF1ZXNMaXN0OiBvcHRpb25zLnF1ZXNMaXN0LFxyXG4gICAgICAgICAgICAgICAgYWN0aXZlVHlwZTogcGFyc2VJbnQob3B0aW9ucy5hY3RpdmVUeXBlKSxcclxuICAgICAgICAgICAgICAgIGFjdGlvblR5cGU6IHBhcnNlSW50KG9wdGlvbnMuYWN0aW9uVHlwZSksXHJcbiAgICAgICAgICAgICAgICB0eXBlOiBhcHAuZ2xvYmFsRGF0YS50eXBlTGlzdFtwYXJzZUludChvcHRpb25zLmFjdGl2ZVR5cGUpXSxcclxuICAgICAgICAgICAgICAgIHJlZGlkOiBwYXJzZUludChvcHRpb25zLnJlZGlkKSxcclxuICAgICAgICAgICAgICAgIE1haW5UZXh0OiB0ZXh0LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmdldExvY2FsSW1hZ2Uob3B0aW9ucylcclxuICAgICAgICAgICAgICAgICAgICAudGhlbigodXJsOiBzdHJpbmcpID0+IHRoYXQuc2V0RGF0YSh7IGltZ1VybDogdXJsIH0pKVxyXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgodXJsOiBzdHJpbmcpID0+IHRoYXQuc2V0RGF0YSh7IGltZ1VybDogdXJsIH0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8vIOS4i+i9veaooeWei1xyXG4gICAgYXN5bmMgZG93bmxvYWRNb2RlbCh0eXBlOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgdGFzazAgPSBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPihhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWFwcC5nbG9iYWxEYXRhLmNhbnZhc01vZGVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgbG9hZE1vZGVsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibG9hZCBjYW52YXNNb2RlbCBzdWNjXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3eC5zaG93VG9hc3Qoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IFwibG9hZCBjYW52YXNNb2RlbCBlcnJvclwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogXCJub25lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJjYW52YXNNb2RlbOaooeWei+W3suWKoOi9vei/h1wiKTtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgbGV0IHRhc2sxID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coKTtcclxuICAgICAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICAgICAvL+WmguaenOaooeWei+WKoOi9veS4jeaIkOWKn1xyXG4gICAgICAgICAgICAgICAgICAgICFhcHAuZ2xvYmFsRGF0YS5hY3Rpb25Nb2RlbCB8fFxyXG4gICAgICAgICAgICAgICAgICAgICFhcHAuZ2xvYmFsRGF0YS5hY3Rpb25Nb2RlbC5mYWNlTWVzaCB8fFxyXG4gICAgICAgICAgICAgICAgICAgICFhcHAuZ2xvYmFsRGF0YS5hY3Rpb25Nb2RlbC5yZWFkeVxyXG4gICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeyBXaWR0aCwgSGVpZ2h0IH0gPSBhcHAuZ2xvYmFsRGF0YTtcclxuICAgICAgICAgICAgICAgICAgICBhcHAuZ2xvYmFsRGF0YS5hY3Rpb25Nb2RlbCA9IG5ldyBDbGFzc2lmaWVyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IFdpZHRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IEhlaWdodCxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL+mHjeaWsOWKoOi9vVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBhcHAuZ2xvYmFsRGF0YS5hY3Rpb25Nb2RlbC5sb2FkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImFjdGlvbk1vZGVs5qih5Z6L5bey5Yqg6L296L+HXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8g5Yaz5a6a5Yqg6L296aG65bqPXHJcbiAgICAgICAgaWYgKHR5cGUgPT0gMykge1xyXG4gICAgICAgICAgICAvLyDku47liqjkvZznuqLljIXov5vlhaVcclxuICAgICAgICAgICAgYXdhaXQgdGFzazEoKTtcclxuICAgICAgICAgICAgdGFzazAoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyDku47nlLvlm77nuqLljIXov5vlhaVcclxuICAgICAgICAgICAgYXdhaXQgdGFzazAoKTtcclxuICAgICAgICAgICAgdGFzazEoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGFzeW5jIGp1ZGdlQXV0aG9yaXR5KGU6IGFueSkge1xyXG4gICAgICAgIGNvbnN0IHRoYXQgPSB0aGlzO1xyXG5cclxuICAgICAgICBpZiAodGhhdC5kYXRhLm1vbmV5RmxhZyBhcyBudW1iZXIgPD0gMCkge1xyXG4gICAgICAgICAgICAvL+mUmeivr+WkhOeQhlxyXG4gICAgICAgICAgICAvLyBlbnVtIHRleHRzIHtcclxuICAgICAgICAgICAgLy8gICAgIFwi57qi5YyF56m65ZWm77yBXCIgPSAwLFxyXG4gICAgICAgICAgICAvLyAgICAgXCLmgqjlt7Lpooblj5bov4fvvIFcIiA9IC0xLFxyXG4gICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgIHd4LnJlZGlyZWN0VG8oe1xyXG4gICAgICAgICAgICAgICAgdXJsOiBcIi4uL3BhZ2VzL2luZGV4L2luZGV4XCIsXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBsZXQgcmVzID0gYXdhaXQgYXBwLmdldHVzZXJpbmZvKCk7XHJcbiAgICAgICAgICAgIHRoYXQuc2V0RGF0YSh7IHVwbG9hZFVzZXJJbmZvOiByZXMgfSwgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhhdC5wb3N0UGVyc29uZGF0YSgpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5nb3RvRGV0YWlsKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICBjb25zdCBpbmZvID0gZS5kZXRhaWwuYXJncztcclxuICAgICAgICAgICAgaWYgKCFpbmZvIHx8ICFpbmZvLmRldGFpbCB8fCAhaW5mby5kZXRhaWwudXNlckluZm8pIHtcclxuICAgICAgICAgICAgICAgIHd4LnNob3dUb2FzdCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IFwi5o6I5p2D5ZCO5omN6IO96aKG5Y+W5ZOm77yBXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogXCJub25lXCIsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhcHAuZ2xvYmFsRGF0YS51c2VySW5mbyA9IGluZm8uZGV0YWlsLnVzZXJJbmZvO1xyXG4gICAgICAgICAgICB0aGF0LnNldERhdGEoeyB1cGxvYWRVc2VySW5mbzogaW5mby5kZXRhaWwudXNlckluZm8gfSwgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhhdC5wb3N0UGVyc29uZGF0YSgpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5nb3RvRGV0YWlsKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgYXN5bmMgb25TaG93KCkge1xyXG4gICAgICAgIGNvbnN0IHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIHRoYXQuZG93bmxvYWRNb2RlbCh0aGF0LmRhdGEuYWN0aXZlVHlwZSk7XHJcbiAgICAgICAgaWYgKCEhYXBwLmdsb2JhbERhdGEuc2Vzc2lvbmlkKSB7XHJcbiAgICAgICAgICAgIC8v5aaC5p6c5pyJc2Vzc2lvbmlk5LqG5YiZ5Yi35pawIG1vbmV5ZmxhZyDpooblj5bmg4XlhrVcclxuICAgICAgICAgICAgdGhhdC5zZXREYXRhKHsgaGFzTW9uZXlGbGFnOiBmYWxzZSB9LCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmdldE1vbmV5RmxhZygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qIOeUqOaIt+eCueWHu+WPs+S4iuinkuWIhuS6qyAqL1xyXG4gICAgb25TaGFyZUFwcE1lc3NhZ2U6IGZ1bmN0aW9uIChyZXMpIHtcclxuICAgICAgICBjb25zdCB0aGF0ID0gdGhpcztcclxuICAgICAgICBpZiAocmVzLmZyb20gPT09IFwiYnV0dG9uXCIpIGNvbnNvbGUubG9nKHJlcy50YXJnZXQpO1xyXG4gICAgICAgIGlmICghdGhhdC5kYXRhLnVzZXJJbmZvKSByZXR1cm4ge307XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdGl0bGU6IFwi6L2s5Y+R57qi5YyFXCIsXHJcbiAgICAgICAgICAgIHBhdGg6IGAvcGFnZXMvcmVjZWl2ZVJlZHAvcmVjZWl2ZVJlZHA/cXVlc3Rpb249JHt0aGF0LmRhdGEucXVlc3Rpb259JnF1ZXNMaXN0PSR7dGhhdC5kYXRhLnF1ZXNMaXN0fSZuaWNrTmFtZT0ke3RoYXQuZGF0YS51c2VySW5mby5uaWNrbmFtZX0mYXZhVXJsPSR7dGhhdC5kYXRhLnVzZXJJbmZvLmF2YXRhclVybH0mcmVkaWQ9JHt0aGF0LmRhdGEucmVkaWR9JmFjdGl2ZVR5cGU9JHt0aGF0LmRhdGEuYWN0aXZlVHlwZX0mYWN0aW9uVHlwZT0ke3RoYXQuZGF0YS5hY3Rpb25UeXBlfWAsXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXM6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLovazlj5HmiJDlip86XCIgKyBKU09OLnN0cmluZ2lmeShyZXMpKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZmFpbDogZnVuY3Rpb24gKHJlczogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIui9rOWPkeWksei0pTpcIiArIEpTT04uc3RyaW5naWZ5KHJlcykpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG59KTtcclxuIl19