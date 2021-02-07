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
const api_1 = require("../../utils/request/api");
const request_1 = require("../../utils/request/request");
const util_1 = require("../../utils/util");
const app = getApp();
let pageThis;
Page({
    data: {
        ready: false,
        focus1: false,
        focus2: false,
        questionState: 0,
        activeType: 0,
        hiddenmodalput: true,
        typeList: [
            {
                text: "画图红包",
                src: "/images/send/draw.svg",
            },
            {
                text: "表情红包",
                src: "/images/send/emotion.svg",
            },
            {
                text: "识物红包",
                src: "/images/send/scan.svg",
            },
            {
                text: "动作红包",
                src: "/images/send/action.svg",
            },
        ],
        questionList: [
            [
                "苹果",
                "闹钟",
                "生日蛋糕",
                "自行车",
                "双筒望远镜",
                "房子",
                "胡萝卜",
                "鱼",
            ],
            [
                {
                    type: "生气",
                    src: "/images/send/emotion/shengqi.svg",
                },
                {
                    type: "开心",
                    src: "/images/send/emotion/kaixin.svg",
                },
                {
                    type: "悲伤",
                    src: "/images/send/emotion/beishang.svg",
                },
                {
                    type: "惊讶",
                    src: "/images/send/emotion/jingya.svg",
                },
                {
                    type: "正常",
                    src: "/images/send/emotion/zhengchang.svg",
                },
            ],
            [
                "移动硬盘",
                "保温杯",
                "电动牙刷头",
                "鼠标",
                "鱼",
                "巧克力慕斯",
                "显示器",
            ],
            ["头部动作挑战", "手部动作挑战"],
        ],
        hasRequestData: false,
        hasSessionId: false,
    },
    gotoMyRedp() {
        if (!app.globalData.sessionid)
            return;
        wx.navigateTo({
            url: "../myRedp/myRedp",
        });
    },
    showInputModal: () => pageThis.setData({
        hiddenmodalput: !pageThis.data.hiddenmodalput,
        question: "",
    }),
    modalinput: (e) => pageThis.setData({ question: e.detail.value }),
    modalcancel: function () {
        this.setData({
            hiddenmodalput: true,
            question: "",
        });
    },
    confirm: function () {
        console.log(this.data.question);
        const that = this;
        that.setData({
            hiddenmodalput: true,
            questionState: 2,
        }, () => {
            console.log("定义成功", that.data.question);
            that.checkInfo();
        });
    },
    setupApp() {
        this.setData({ hasSessionId: true });
    },
    loginAndPersondata() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield request_1.post(api_1.persondata, {
                    sessionid: app.globalData.sessionid,
                    name: app.globalData.userInfo.nickName,
                    avaurl: app.globalData.userInfo.avatarUrl,
                });
            }
            catch (err) {
                console.log(err);
            }
        });
    },
    chooseType(e) {
        let that = this;
        that.setData({
            activeType: e.currentTarget.dataset.id,
            questionState: 0,
            question: "",
            money: null,
            amount: null,
            ready: false,
        });
    },
    handleFocus(e) {
        const type = e.currentTarget.dataset.type, that = this;
        if (type == 0) {
            that.setData({
                focus1: true,
                focus2: false,
            });
        }
        else {
            that.setData({
                focus2: true,
                focus1: false,
            });
        }
    },
    getInputValue(e) {
        const that = this;
        if (e.currentTarget.dataset.type == 0) {
            that.setData({
                money: parseFloat(parseFloat(e.detail.value).toFixed(2)) > 200
                    ? 200
                    : parseFloat(parseFloat(e.detail.value).toFixed(2)),
                focus1: false,
            });
        }
        else {
            that.setData({
                amount: parseInt(e.detail.value) > 20
                    ? 20
                    : parseInt(e.detail.value),
                focus2: false,
            });
        }
        that.checkInfo();
    },
    setQuestion() {
        this.setData({
            questionState: 1,
        });
    },
    cancel() {
        this.setData({
            question: "",
            questionState: 0,
            ready: false,
        });
    },
    chooseQuestion: function (e) {
        const that = this;
        let question = that.data.questionList[that.data.activeType][e.currentTarget.id];
        that.setData({
            question: typeof question === "object" ? question.type : question,
            questionState: 2,
        });
        if (that.data.activeType === 3)
            that.setData({
                actionType: e.currentTarget.id,
            });
        that.checkInfo();
    },
    reChoose() {
        this.setData({
            questionState: 1,
            question: "",
        });
    },
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            const that = this;
            if (that.data.activeType !== 0 && that.data.activeType !== 2)
                return;
            else {
                let type = that.data.activeType == 0 ? 1 : 2;
                console.log("换一批");
                let res = yield request_1.post(api_1.shift, { type });
                let quesList = that.data.questionList;
                quesList[that.data.activeType] = res.data.question_list;
                that.setData({ questionList: quesList });
            }
        });
    },
    checkInfo() {
        const that = this;
        if (!that.data.money || !that.data.amount || !that.data.question) {
            that.setData({ ready: false });
        }
        else if (isNaN(that.data.money) ||
            isNaN(that.data.amount) ||
            that.data.money <= 0 ||
            that.data.amount <= 0) {
            that.setData({
                ready: false,
            });
        }
        else {
            console.log(that.data.money, that.data.amount, that.data.question);
            that.setData({ ready: true });
        }
    },
    checkMoneyFormat(e) {
        if (!/^\d+\.?\d{0,10}$/.test(e.detail.value)) {
            var s = e.detail.value;
            return s.substring(0, s.length - 1);
        }
    },
    checkAmountFormat: (e) => e.detail.value.replace(/\D/g, ""),
    judgeAuthority(e) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(e.detail);
            const that = this;
            try {
                let res = yield app.getuserinfo();
                console.log("已授权");
                that.setData({ userInfo: res }, () => __awaiter(this, void 0, void 0, function* () {
                    yield that.loginAndPersondata();
                    that.submmit();
                }));
            }
            catch (err) {
                let info = e.detail.args;
                if (!info || !info.detail || !info.detail.userInfo) {
                    wx.showToast({
                        title: "授权后才能发送红包哦！",
                        icon: "none",
                    });
                    return;
                }
                app.globalData.userInfo = info.detail.userInfo;
                that.setData({ userInfo: info.detail.userInfo }, () => __awaiter(this, void 0, void 0, function* () {
                    yield that.loginAndPersondata();
                    that.submmit();
                }));
            }
        });
    },
    judgeAuthorityMyRedp(e) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(e.detail);
            const that = this;
            try {
                let res = yield app.getuserinfo();
                console.log("已授权");
                that.setData({ userInfo: res }, () => __awaiter(this, void 0, void 0, function* () {
                    yield that.loginAndPersondata();
                    that.gotoMyRedp();
                }));
            }
            catch (err) {
                let info = e.detail.args;
                if (!info || !info.detail || !info.detail.userInfo) {
                    wx.showToast({
                        title: "授权后才能发送红包哦！",
                        icon: "none",
                    });
                    return;
                }
                app.globalData.userInfo = info.detail.userInfo;
                that.setData({ userInfo: info.detail.userInfo }, () => __awaiter(this, void 0, void 0, function* () {
                    yield that.loginAndPersondata();
                    that.gotoMyRedp();
                }));
            }
        });
    },
    submmit: util_1.onetap(() => __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            console.log("submit");
            const that = pageThis;
            if (!that.data.money) {
                wx.showToast({
                    title: "请输入红包金额",
                    icon: "none",
                    duration: 1000,
                    success() {
                        reject();
                        return;
                    },
                });
            }
            else if (!that.data.amount) {
                wx.showToast({
                    title: "请输入红包个数",
                    icon: "none",
                    duration: 1000,
                    success() {
                        reject();
                        return;
                    },
                });
            }
            else if (!that.data.question) {
                wx.showToast({
                    title: "请选择题目",
                    icon: "none",
                    duration: 1000,
                    success() {
                        reject();
                        return;
                    },
                });
            }
            else if (isNaN(that.data.money) ||
                isNaN(that.data.amount) ||
                that.data.money <= 0 ||
                that.data.amount <= 0) {
                wx.showToast({
                    title: '请输入合法的"红包金额"和"红包个数"数字',
                    icon: "none",
                    duration: 1000,
                    success: () => {
                        reject();
                        return;
                    },
                });
            }
            else {
                console.log("红包金额", parseFloat(that.data.money) * 100);
                try {
                    let redidRes = yield request_1.post(api_1.redid, { "need_detail_info": true });
                    console.log(redidRes.data.seq_no);
                    let res = yield request_1.post(api_1.giveout, {
                        sessionid: app.globalData.sessionid,
                        money: parseFloat(that.data.money) * 100,
                        rpnum: parseInt(that.data.amount),
                        time: util_1.getTime(),
                        type: that.data.activeType + "",
                        redid: redidRes.data.seq_no,
                        actiontype: that.data.actionType
                            ? that.data.actionType + ""
                            : undefined,
                    });
                    console.log(res);
                    wx.requestPayment(Object.assign({}, res.data.pay_resp.pay_param, { success(res1) {
                            return __awaiter(this, void 0, void 0, function* () {
                                console.log(res1);
                                let payRes = yield request_1.post(api_1.payStatus, {
                                    sessionid: app.globalData.sessionid,
                                    redid: redidRes.data.seq_no,
                                    status: "true"
                                });
                                console.log(payRes);
                                let id, quesList;
                                if (typeof res.data === "object") {
                                    id = res.data.redid;
                                    quesList =
                                        res.data.question_list.length === 0
                                            ? undefined
                                            : JSON.stringify(res.data.question_list);
                                }
                                else
                                    id = res.data;
                                wx.navigateTo({
                                    url: `../shareRedp/shareRedp?question=${that.data.question}&quesList=${quesList}&nickName=${that.data.userInfo.nickName}&avaUrl=${that.data.userInfo.avatarUrl}&redid=${id}&activeType=${that.data.activeType}&actionType=${that.data.actionType}`,
                                    success: () => {
                                        that.setData({
                                            money: null,
                                            amount: null,
                                            question: "",
                                            questionState: 0,
                                            ready: false,
                                            activeType: 0,
                                        }, () => {
                                            resolve(res);
                                        });
                                    },
                                    fail: () => reject(),
                                    complete: (res) => {
                                        console.log(res);
                                    },
                                });
                            });
                        },
                        fail(err) {
                            return __awaiter(this, void 0, void 0, function* () {
                                let payRes = yield request_1.post(api_1.payStatus, {
                                    sessionid: app.globalData.sessionid,
                                    redid: redidRes.data.seq_no,
                                    status: "false"
                                });
                                console.log(payRes);
                                wx.showToast({
                                    title: "生成红包失败",
                                    icon: "none",
                                });
                                reject(err);
                            });
                        } }));
                }
                catch (err) {
                    wx.showToast({
                        title: "生成红包失败",
                        icon: "none",
                    });
                    reject(err);
                }
            }
        }));
    })),
    onLoad: function () {
        return __awaiter(this, void 0, void 0, function* () {
            const that = this;
            pageThis = that;
            try {
                yield app.getSessionId();
                that.setData({
                    hasSessionId: true,
                    hasRequestData: true,
                });
            }
            catch (err) {
                that.setData({
                    hasSessionId: false,
                    hasRequestData: true,
                });
            }
            wx.hideShareMenu({ menus: ["shareAppMessage", "shareTimeline"] });
        });
    },
    onShow() {
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBR0EsaURBQXVGO0FBQ3ZGLHlEQUFtRDtBQUNuRCwyQ0FBbUQ7QUFDbkQsTUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFRLENBQUM7QUFDM0IsSUFBSSxRQUFhLENBQUM7QUFvQmxCLElBQUksQ0FBc0M7SUFDdEMsSUFBSSxFQUFFO1FBQ0YsS0FBSyxFQUFFLEtBQUs7UUFDWixNQUFNLEVBQUUsS0FBSztRQUNiLE1BQU0sRUFBRSxLQUFLO1FBRWIsYUFBYSxFQUFFLENBQUM7UUFDaEIsVUFBVSxFQUFFLENBQUM7UUFDYixjQUFjLEVBQUUsSUFBSTtRQUVwQixRQUFRLEVBQUU7WUFDTjtnQkFDSSxJQUFJLEVBQUUsTUFBTTtnQkFDWixHQUFHLEVBQUUsdUJBQXVCO2FBQy9CO1lBQ0Q7Z0JBQ0ksSUFBSSxFQUFFLE1BQU07Z0JBQ1osR0FBRyxFQUFFLDBCQUEwQjthQUNsQztZQUNEO2dCQUNJLElBQUksRUFBRSxNQUFNO2dCQUNaLEdBQUcsRUFBRSx1QkFBdUI7YUFDL0I7WUFDRDtnQkFDSSxJQUFJLEVBQUUsTUFBTTtnQkFDWixHQUFHLEVBQUUseUJBQXlCO2FBQ2pDO1NBQ0o7UUFFRCxZQUFZLEVBQUU7WUFFVjtnQkFDSSxJQUFJO2dCQUNKLElBQUk7Z0JBQ0osTUFBTTtnQkFDTixLQUFLO2dCQUNMLE9BQU87Z0JBQ1AsSUFBSTtnQkFDSixLQUFLO2dCQUNMLEdBQUc7YUFDTjtZQUNEO2dCQUNJO29CQUNJLElBQUksRUFBRSxJQUFJO29CQUNWLEdBQUcsRUFBRSxrQ0FBa0M7aUJBQzFDO2dCQUNEO29CQUNJLElBQUksRUFBRSxJQUFJO29CQUNWLEdBQUcsRUFBRSxpQ0FBaUM7aUJBQ3pDO2dCQUNEO29CQUNJLElBQUksRUFBRSxJQUFJO29CQUNWLEdBQUcsRUFBRSxtQ0FBbUM7aUJBQzNDO2dCQUNEO29CQUNJLElBQUks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WUFDbEIsUUFBUSxHQUFHLElBQUksQ0FBQztZQUVoQixJQUFJO2dCQUNBLE1BQU0sR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUV6QixJQUFJLENBQUMsT0FBTyxDQUFDO29CQUNULFlBQVksRUFBRSxJQUFJO29CQUNsQixjQUFjLEVBQUUsSUFBSTtpQkFDdkIsQ0FBQyxDQUFDO2FBQ047WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFFVixJQUFJLENBQUMsT0FBTyxDQUFDO29CQUNULFlBQVksRUFBRSxLQUFLO29CQUNuQixjQUFjLEVBQUUsSUFBSTtpQkFDdkIsQ0FBQyxDQUFDO2FBQ047WUFFRCxFQUFFLENBQUMsYUFBYSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7S0FBQTtJQUVELE1BQU07SUFDTixDQUFDO0NBQ0osQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gaW5kZXgudHNcbi8vIOiOt+WPluW6lOeUqOWunuS+i1xuXG5pbXBvcnQgeyBwZXJzb25kYXRhLCBnaXZlb3V0LCBzaGlmdCwgcmVkaWQsIHBheVN0YXR1cyB9IGZyb20gXCIuLi8uLi91dGlscy9yZXF1ZXN0L2FwaVwiO1xuaW1wb3J0IHsgcG9zdCB9IGZyb20gXCIuLi8uLi91dGlscy9yZXF1ZXN0L3JlcXVlc3RcIjtcbmltcG9ydCB7IGdldFRpbWUsIG9uZXRhcCB9IGZyb20gXCIuLi8uLi91dGlscy91dGlsXCI7XG5jb25zdCBhcHAgPSBnZXRBcHA8SUFwcD4oKTtcbmxldCBwYWdlVGhpczogYW55O1xuXG5pbnRlcmZhY2UgSURhdGEge1xuICAgIHJlYWR5OiBib29sZWFuO1xuICAgIGZvY3VzMTogYm9vbGVhbjtcbiAgICBmb2N1czI6IGJvb2xlYW47XG4gICAgcXVlc3Rpb25TdGF0ZTogbnVtYmVyO1xuICAgIGFjdGl2ZVR5cGU6IG51bWJlcjtcbiAgICB0eXBlTGlzdDogQXJyYXk8eyB0ZXh0OiBzdHJpbmc7IHNyYzogc3RyaW5nIH0+O1xuICAgIHF1ZXN0aW9uTGlzdDogQXJyYXk8YW55PjtcblxuICAgIGhhc1JlcXVlc3REYXRhOiBib29sZWFuO1xuICAgIGhhc1Nlc3Npb25JZDogYm9vbGVhbjtcblxuICAgIGhpZGRlbm1vZGFscHV0OiBib29sZWFuO1xuICAgIC8vIGNhbklVc2U6IGJvb2xlYW47XG4gICAgbW9uZXk/OiBudW1iZXIgfCBudWxsO1xuICAgIGFtb3VudD86IG51bWJlciB8IG51bGw7XG4gICAgcXVlc3Rpb24/OiBzdHJpbmc7XG59XG5QYWdlPElEYXRhLCBXZWNoYXRNaW5pcHJvZ3JhbS5JQW55T2JqZWN0Pih7XG4gICAgZGF0YToge1xuICAgICAgICByZWFkeTogZmFsc2UsXG4gICAgICAgIGZvY3VzMTogZmFsc2UsXG4gICAgICAgIGZvY3VzMjogZmFsc2UsXG5cbiAgICAgICAgcXVlc3Rpb25TdGF0ZTogMCwgLy8gIDDvvJror7fpgInmi6kgICAgMe+8muWPlua2iCAgICAgICAy77ya5bey6YCJ5LitXG4gICAgICAgIGFjdGl2ZVR5cGU6IDAsIC8vICAw77ya55S75Zu+57qi5YyFICAx77ya6KGo5oOF57qi5YyFICAgIDLvvJror4bniannuqLljIUgICAgM++8muWKqOS9nOe6ouWMhVxuICAgICAgICBoaWRkZW5tb2RhbHB1dDogdHJ1ZSxcblxuICAgICAgICB0eXBlTGlzdDogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwi55S75Zu+57qi5YyFXCIsXG4gICAgICAgICAgICAgICAgc3JjOiBcIi9pbWFnZXMvc2VuZC9kcmF3LnN2Z1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiBcIuihqOaDhee6ouWMhVwiLFxuICAgICAgICAgICAgICAgIHNyYzogXCIvaW1hZ2VzL3NlbmQvZW1vdGlvbi5zdmdcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCLor4bniannuqLljIVcIixcbiAgICAgICAgICAgICAgICBzcmM6IFwiL2ltYWdlcy9zZW5kL3NjYW4uc3ZnXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6IFwi5Yqo5L2c57qi5YyFXCIsXG4gICAgICAgICAgICAgICAgc3JjOiBcIi9pbWFnZXMvc2VuZC9hY3Rpb24uc3ZnXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuXG4gICAgICAgIHF1ZXN0aW9uTGlzdDogW1xuICAgICAgICAgICAgLy/kuLrkuoblrp7njrDigJzmjaLkuIDmibnigJ3lip/og73vvIzorqHnrpflvpflh7rmr4/np43lrZfmlbDnmoTlrr3luqYg5bm26L+b6KGM5biD5bGAXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgXCLoi7nmnpxcIixcbiAgICAgICAgICAgICAgICBcIumXuemSn1wiLFxuICAgICAgICAgICAgICAgIFwi55Sf5pel6JuL57OVXCIsXG4gICAgICAgICAgICAgICAgXCLoh6rooYzovaZcIixcbiAgICAgICAgICAgICAgICBcIuWPjOetkuacm+i/nOmVnFwiLFxuICAgICAgICAgICAgICAgIFwi5oi/5a2QXCIsXG4gICAgICAgICAgICAgICAgXCLog6HokJ3ljZxcIixcbiAgICAgICAgICAgICAgICBcIumxvFwiLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwi55Sf5rCUXCIsXG4gICAgICAgICAgICAgICAgICAgIHNyYzogXCIvaW1hZ2VzL3NlbmQvZW1vdGlvbi9zaGVuZ3FpLnN2Z1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIuW8gOW/g1wiLFxuICAgICAgICAgICAgICAgICAgICBzcmM6IFwiL2ltYWdlcy9zZW5kL2Vtb3Rpb24va2FpeGluLnN2Z1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIuaCsuS8pFwiLFxuICAgICAgICAgICAgICAgICAgICBzcmM6IFwiL2ltYWdlcy9zZW5kL2Vtb3Rpb24vYmVpc2hhbmcuc3ZnXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwi5oOK6K62XCIsXG4gICAgICAgICAgICAgICAgICAgIHNyYzogXCIvaW1hZ2VzL3NlbmQvZW1vdGlvbi9qaW5neWEuc3ZnXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwi5q2j5bi4XCIsXG4gICAgICAgICAgICAgICAgICAgIHNyYzogXCIvaW1hZ2VzL3NlbmQvZW1vdGlvbi96aGVuZ2NoYW5nLnN2Z1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwi56e75Yqo56Gs55uYXCIsXG4gICAgICAgICAgICAgICAgXCLkv53muKnmna9cIixcbiAgICAgICAgICAgICAgICBcIueUteWKqOeJmeWIt+WktFwiLFxuICAgICAgICAgICAgICAgIFwi6byg5qCHXCIsXG4gICAgICAgICAgICAgICAgXCLpsbxcIixcbiAgICAgICAgICAgICAgICBcIuW3p+WFi+WKm+aFleaWr1wiLFxuICAgICAgICAgICAgICAgIFwi5pi+56S65ZmoXCIsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgW1wi5aS06YOo5Yqo5L2c5oyR5oiYXCIsIFwi5omL6YOo5Yqo5L2c5oyR5oiYXCJdLFxuICAgICAgICBdLFxuXG4gICAgICAgIGhhc1JlcXVlc3REYXRhOiBmYWxzZSxcbiAgICAgICAgaGFzU2Vzc2lvbklkOiBmYWxzZSxcbiAgICAgICAgLy8gY2FuSVVzZTogd3guY2FuSVVzZShcImJ1dHRvbi5vcGVuLXR5cGUuZ2V0VXNlckluZm9cIiksXG4gICAgfSxcblxuICAgIGdvdG9NeVJlZHAoKSB7XG4gICAgICAgIGlmICghYXBwLmdsb2JhbERhdGEuc2Vzc2lvbmlkKSByZXR1cm47XG4gICAgICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgICAgICAgdXJsOiBcIi4uL215UmVkcC9teVJlZHBcIixcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHNob3dJbnB1dE1vZGFsOiAoKSA9PlxuICAgICAgICBwYWdlVGhpcy5zZXREYXRhKHtcbiAgICAgICAgICAgIGhpZGRlbm1vZGFscHV0OiAhcGFnZVRoaXMuZGF0YS5oaWRkZW5tb2RhbHB1dCxcbiAgICAgICAgICAgIHF1ZXN0aW9uOiBcIlwiLFxuICAgICAgICB9KSxcblxuICAgIG1vZGFsaW5wdXQ6IChlOiBhbnkpID0+IHBhZ2VUaGlzLnNldERhdGEoeyBxdWVzdGlvbjogZS5kZXRhaWwudmFsdWUgfSksXG5cbiAgICBtb2RhbGNhbmNlbDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNldERhdGEoe1xuICAgICAgICAgICAgaGlkZGVubW9kYWxwdXQ6IHRydWUsXG4gICAgICAgICAgICBxdWVzdGlvbjogXCJcIixcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNvbmZpcm06IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5kYXRhLnF1ZXN0aW9uKTtcbiAgICAgICAgY29uc3QgdGhhdCA9IHRoaXM7XG4gICAgICAgIHRoYXQuc2V0RGF0YShcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBoaWRkZW5tb2RhbHB1dDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBxdWVzdGlvblN0YXRlOiAyLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIuWumuS5ieaIkOWKn1wiLCB0aGF0LmRhdGEucXVlc3Rpb24pO1xuICAgICAgICAgICAgICAgIHRoYXQuY2hlY2tJbmZvKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfSxcblxuICAgIHNldHVwQXBwKCkge1xuICAgICAgICB0aGlzLnNldERhdGEoeyBoYXNTZXNzaW9uSWQ6IHRydWUgfSk7XG4gICAgfSxcblxuICAgIC8v5ZCO56uv5rOo5YaM5L+h5oGvXG4gICAgYXN5bmMgbG9naW5BbmRQZXJzb25kYXRhKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgcG9zdChwZXJzb25kYXRhLCB7XG4gICAgICAgICAgICAgICAgc2Vzc2lvbmlkOiBhcHAuZ2xvYmFsRGF0YS5zZXNzaW9uaWQsXG4gICAgICAgICAgICAgICAgbmFtZTogYXBwLmdsb2JhbERhdGEudXNlckluZm8ubmlja05hbWUsXG4gICAgICAgICAgICAgICAgYXZhdXJsOiBhcHAuZ2xvYmFsRGF0YS51c2VySW5mby5hdmF0YXJVcmwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8v6YCJ5oup57qi5YyF57G75Z6LXG4gICAgY2hvb3NlVHlwZShlOiBhbnkpIHtcbiAgICAgICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgICAgICB0aGF0LnNldERhdGEoe1xuICAgICAgICAgICAgYWN0aXZlVHlwZTogZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaWQsXG4gICAgICAgICAgICBxdWVzdGlvblN0YXRlOiAwLFxuICAgICAgICAgICAgcXVlc3Rpb246IFwiXCIsXG4gICAgICAgICAgICBtb25leTogbnVsbCxcbiAgICAgICAgICAgIGFtb3VudDogbnVsbCxcbiAgICAgICAgICAgIHJlYWR5OiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGhhbmRsZUZvY3VzKGU6IGFueSkge1xuICAgICAgICBjb25zdCB0eXBlID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudHlwZSxcbiAgICAgICAgICAgIHRoYXQgPSB0aGlzO1xuICAgICAgICBpZiAodHlwZSA9PSAwKSB7XG4gICAgICAgICAgICB0aGF0LnNldERhdGEoe1xuICAgICAgICAgICAgICAgIGZvY3VzMTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBmb2N1czI6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGF0LnNldERhdGEoe1xuICAgICAgICAgICAgICAgIGZvY3VzMjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBmb2N1czE6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy/ojrflvpdpbnB1dOS4reeahOWAvFxuICAgIGdldElucHV0VmFsdWUoZTogYW55KSB7XG4gICAgICAgIGNvbnN0IHRoYXQgPSB0aGlzO1xuICAgICAgICBpZiAoZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudHlwZSA9PSAwKSB7XG4gICAgICAgICAgICAvL+iuvuWumue6ouWMheaAu+mHkeminVxuICAgICAgICAgICAgdGhhdC5zZXREYXRhKHtcbiAgICAgICAgICAgICAgICBtb25leTpcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VGbG9hdChwYXJzZUZsb2F0KGUuZGV0YWlsLnZhbHVlKS50b0ZpeGVkKDIpKSA+IDIwMFxuICAgICAgICAgICAgICAgICAgICAgICAgPyAyMDBcbiAgICAgICAgICAgICAgICAgICAgICAgIDogcGFyc2VGbG9hdChwYXJzZUZsb2F0KGUuZGV0YWlsLnZhbHVlKS50b0ZpeGVkKDIpKSxcbiAgICAgICAgICAgICAgICBmb2N1czE6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGF0LnNldERhdGEoe1xuICAgICAgICAgICAgICAgIC8v6K6+5a6a57qi5YyF5Liq5pWwXG4gICAgICAgICAgICAgICAgYW1vdW50OlxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChlLmRldGFpbC52YWx1ZSkgPiAyMFxuICAgICAgICAgICAgICAgICAgICAgICAgPyAyMFxuICAgICAgICAgICAgICAgICAgICAgICAgOiBwYXJzZUludChlLmRldGFpbC52YWx1ZSksXG4gICAgICAgICAgICAgICAgZm9jdXMyOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoYXQuY2hlY2tJbmZvKCk7XG4gICAgfSxcblxuICAgIC8v6K6+5a6a6aKY55uuXG4gICAgc2V0UXVlc3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc2V0RGF0YSh7XG4gICAgICAgICAgICBxdWVzdGlvblN0YXRlOiAxLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy/lj5bmtojpgInmi6lcbiAgICBjYW5jZWwoKSB7XG4gICAgICAgIHRoaXMuc2V0RGF0YSh7XG4gICAgICAgICAgICBxdWVzdGlvbjogXCJcIixcbiAgICAgICAgICAgIHF1ZXN0aW9uU3RhdGU6IDAsXG4gICAgICAgICAgICByZWFkeTogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvL+mAieWumumimOebrlxuICAgIGNob29zZVF1ZXN0aW9uOiBmdW5jdGlvbiAoZTogYW55KSB7XG4gICAgICAgIGNvbnN0IHRoYXQgPSB0aGlzO1xuICAgICAgICBsZXQgcXVlc3Rpb24gPVxuICAgICAgICAgICAgdGhhdC5kYXRhLnF1ZXN0aW9uTGlzdFt0aGF0LmRhdGEuYWN0aXZlVHlwZV1bZS5jdXJyZW50VGFyZ2V0LmlkXTtcbiAgICAgICAgdGhhdC5zZXREYXRhKHtcbiAgICAgICAgICAgIHF1ZXN0aW9uOiB0eXBlb2YgcXVlc3Rpb24gPT09IFwib2JqZWN0XCIgPyBxdWVzdGlvbi50eXBlIDogcXVlc3Rpb24sXG4gICAgICAgICAgICBxdWVzdGlvblN0YXRlOiAyLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoYXQuZGF0YS5hY3RpdmVUeXBlID09PSAzKVxuICAgICAgICAgICAgdGhhdC5zZXREYXRhKHtcbiAgICAgICAgICAgICAgICBhY3Rpb25UeXBlOiBlLmN1cnJlbnRUYXJnZXQuaWQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgdGhhdC5jaGVja0luZm8oKTtcbiAgICB9LFxuXG4gICAgLy/ph43mlrDpgInmi6lcbiAgICByZUNob29zZSgpIHtcbiAgICAgICAgdGhpcy5zZXREYXRhKHtcbiAgICAgICAgICAgIHF1ZXN0aW9uU3RhdGU6IDEsXG4gICAgICAgICAgICBxdWVzdGlvbjogXCJcIixcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8v5o2i5LiA5om5XG4gICAgYXN5bmMgcmVmcmVzaCgpIHtcbiAgICAgICAgY29uc3QgdGhhdCA9IHRoaXM7XG4gICAgICAgIGlmICh0aGF0LmRhdGEuYWN0aXZlVHlwZSAhPT0gMCAmJiB0aGF0LmRhdGEuYWN0aXZlVHlwZSAhPT0gMikgcmV0dXJuO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCB0eXBlID0gdGhhdC5kYXRhLmFjdGl2ZVR5cGUgPT0gMCA/IDEgOiAyOyAvL+eUu+WbvnR5cGU9Me+8m+ivhueJqXR5cGU9MlxuICAgICAgICAgICAgY29uc29sZS5sb2coXCLmjaLkuIDmiblcIik7XG4gICAgICAgICAgICBsZXQgcmVzID0gYXdhaXQgcG9zdChzaGlmdCwgeyB0eXBlIH0pO1xuICAgICAgICAgICAgbGV0IHF1ZXNMaXN0ID0gdGhhdC5kYXRhLnF1ZXN0aW9uTGlzdDtcbiAgICAgICAgICAgIHF1ZXNMaXN0W3RoYXQuZGF0YS5hY3RpdmVUeXBlXSA9IHJlcy5kYXRhLnF1ZXN0aW9uX2xpc3Q7XG4gICAgICAgICAgICB0aGF0LnNldERhdGEoeyBxdWVzdGlvbkxpc3Q6IHF1ZXNMaXN0IH0pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8v5p+l55yLaW5wdXTkv6Hmga/mmK/lkKbloavlhpnigJzlrozlhajigJ3kuJTigJzlkIjms5XigJ1cbiAgICBjaGVja0luZm8oKSB7XG4gICAgICAgIGNvbnN0IHRoYXQgPSB0aGlzO1xuICAgICAgICBpZiAoIXRoYXQuZGF0YS5tb25leSB8fCAhdGhhdC5kYXRhLmFtb3VudCB8fCAhdGhhdC5kYXRhLnF1ZXN0aW9uKSB7XG4gICAgICAgICAgICB0aGF0LnNldERhdGEoeyByZWFkeTogZmFsc2UgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICBpc05hTih0aGF0LmRhdGEubW9uZXkpIHx8XG4gICAgICAgICAgICBpc05hTih0aGF0LmRhdGEuYW1vdW50KSB8fFxuICAgICAgICAgICAgdGhhdC5kYXRhLm1vbmV5IDw9IDAgfHxcbiAgICAgICAgICAgIHRoYXQuZGF0YS5hbW91bnQgPD0gMFxuICAgICAgICApIHtcbiAgICAgICAgICAgIHRoYXQuc2V0RGF0YSh7XG4gICAgICAgICAgICAgICAgcmVhZHk6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGF0LmRhdGEubW9uZXksIHRoYXQuZGF0YS5hbW91bnQsIHRoYXQuZGF0YS5xdWVzdGlvbik7XG4gICAgICAgICAgICB0aGF0LnNldERhdGEoeyByZWFkeTogdHJ1ZSB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyAg5Y+q6IO96L6T5YWl5pW05pWwIC8g5Lik5L2N5bCP5pWwXG4gICAgY2hlY2tNb25leUZvcm1hdChlOiBhbnkpIHtcbiAgICAgICAgaWYgKCEvXlxcZCtcXC4/XFxkezAsMTB9JC8udGVzdChlLmRldGFpbC52YWx1ZSkpIHtcbiAgICAgICAgICAgIHZhciBzID0gZS5kZXRhaWwudmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gcy5zdWJzdHJpbmcoMCwgcy5sZW5ndGggLSAxKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyDlj6rog73ovpPlhaXmraPmlbTmlbBcbiAgICBjaGVja0Ftb3VudEZvcm1hdDogKGU6IGFueSkgPT4gZS5kZXRhaWwudmFsdWUucmVwbGFjZSgvXFxEL2csIFwiXCIpLFxuXG4gICAgYXN5bmMganVkZ2VBdXRob3JpdHkoZTogYW55KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGUuZGV0YWlsKTtcbiAgICAgICAgY29uc3QgdGhhdCA9IHRoaXM7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyDlt7LmjojmnYPvvIznm7TmjqXojrflj5Z1c2VyaW5mb1xuICAgICAgICAgICAgbGV0IHJlcyA9IGF3YWl0IGFwcC5nZXR1c2VyaW5mbygpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCLlt7LmjojmnYNcIik7XG4gICAgICAgICAgICB0aGF0LnNldERhdGEoeyB1c2VySW5mbzogcmVzIH0sIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGF0LmxvZ2luQW5kUGVyc29uZGF0YSgpO1xuICAgICAgICAgICAgICAgIHRoYXQuc3VibW1pdCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgLy/mnKrojrflj5Z1c2VyaW5mb++8jOWwneivleiOt+WPllxuICAgICAgICAgICAgbGV0IGluZm8gPSBlLmRldGFpbC5hcmdzO1xuICAgICAgICAgICAgaWYgKCFpbmZvIHx8ICFpbmZvLmRldGFpbCB8fCAhaW5mby5kZXRhaWwudXNlckluZm8pIHtcbiAgICAgICAgICAgICAgICAvL+eUqOaIt+aLkue7nVxuICAgICAgICAgICAgICAgIHd4LnNob3dUb2FzdCh7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBcIuaOiOadg+WQjuaJjeiDveWPkemAgee6ouWMheWTpu+8gVwiLFxuICAgICAgICAgICAgICAgICAgICBpY29uOiBcIm5vbmVcIixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyDnlKjmiLflhYHorrjojrflj5Z1c2VyaW5mb1xuICAgICAgICAgICAgYXBwLmdsb2JhbERhdGEudXNlckluZm8gPSBpbmZvLmRldGFpbC51c2VySW5mbztcbiAgICAgICAgICAgIHRoYXQuc2V0RGF0YSh7IHVzZXJJbmZvOiBpbmZvLmRldGFpbC51c2VySW5mbyB9LCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhhdC5sb2dpbkFuZFBlcnNvbmRhdGEoKTtcbiAgICAgICAgICAgICAgICB0aGF0LnN1Ym1taXQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGFzeW5jIGp1ZGdlQXV0aG9yaXR5TXlSZWRwKGU6IGFueSkge1xuICAgICAgICBjb25zb2xlLmxvZyhlLmRldGFpbCk7XG4gICAgICAgIGNvbnN0IHRoYXQgPSB0aGlzO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8g5bey5o6I5p2D77yM55u05o6l6I635Y+WdXNlcmluZm9cbiAgICAgICAgICAgIGxldCByZXMgPSBhd2FpdCBhcHAuZ2V0dXNlcmluZm8oKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi5bey5o6I5p2DXCIpO1xuICAgICAgICAgICAgdGhhdC5zZXREYXRhKHsgdXNlckluZm86IHJlcyB9LCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhhdC5sb2dpbkFuZFBlcnNvbmRhdGEoKTtcbiAgICAgICAgICAgICAgICB0aGF0LmdvdG9NeVJlZHAoKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgLy/mnKrojrflj5Z1c2VyaW5mb++8jOWwneivleiOt+WPllxuICAgICAgICAgICAgbGV0IGluZm8gPSBlLmRldGFpbC5hcmdzO1xuICAgICAgICAgICAgaWYgKCFpbmZvIHx8ICFpbmZvLmRldGFpbCB8fCAhaW5mby5kZXRhaWwudXNlckluZm8pIHtcbiAgICAgICAgICAgICAgICAvL+eUqOaIt+aLkue7nVxuICAgICAgICAgICAgICAgIHd4LnNob3dUb2FzdCh7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBcIuaOiOadg+WQjuaJjeiDveWPkemAgee6ouWMheWTpu+8gVwiLFxuICAgICAgICAgICAgICAgICAgICBpY29uOiBcIm5vbmVcIixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyDnlKjmiLflhYHorrjojrflj5Z1c2VyaW5mb1xuICAgICAgICAgICAgYXBwLmdsb2JhbERhdGEudXNlckluZm8gPSBpbmZvLmRldGFpbC51c2VySW5mbztcbiAgICAgICAgICAgIHRoYXQuc2V0RGF0YSh7IHVzZXJJbmZvOiBpbmZvLmRldGFpbC51c2VySW5mbyB9LCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhhdC5sb2dpbkFuZFBlcnNvbmRhdGEoKTtcbiAgICAgICAgICAgICAgICB0aGF0LmdvdG9NeVJlZHAoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vIOaPkOS6pOS/oeaBr1xuICAgIC8vIOatpOWkhOS9v+eUqOS6hm9uZXRhcOaWueazle+8jOmYsuatouWkmuasoeeCueaMieOAglxuICAgIHN1Ym1taXQ6IG9uZXRhcChhc3luYyAoKSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInN1Ym1pdFwiKTtcbiAgICAgICAgICAgIGNvbnN0IHRoYXQgPSBwYWdlVGhpcztcblxuICAgICAgICAgICAgaWYgKCF0aGF0LmRhdGEubW9uZXkpIHtcbiAgICAgICAgICAgICAgICB3eC5zaG93VG9hc3Qoe1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogXCLor7fovpPlhaXnuqLljIXph5Hpop1cIixcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogXCJub25lXCIsXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAwLFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGF0LmRhdGEuYW1vdW50KSB7XG4gICAgICAgICAgICAgICAgd3guc2hvd1RvYXN0KHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IFwi6K+36L6T5YWl57qi5YyF5Liq5pWwXCIsXG4gICAgICAgICAgICAgICAgICAgIGljb246IFwibm9uZVwiLFxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwMCxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzcygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghdGhhdC5kYXRhLnF1ZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgd3guc2hvd1RvYXN0KHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IFwi6K+36YCJ5oup6aKY55uuXCIsXG4gICAgICAgICAgICAgICAgICAgIGljb246IFwibm9uZVwiLFxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwMCxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzcygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICBpc05hTih0aGF0LmRhdGEubW9uZXkpIHx8XG4gICAgICAgICAgICAgICAgaXNOYU4odGhhdC5kYXRhLmFtb3VudCkgfHxcbiAgICAgICAgICAgICAgICB0aGF0LmRhdGEubW9uZXkgPD0gMCB8fFxuICAgICAgICAgICAgICAgIHRoYXQuZGF0YS5hbW91bnQgPD0gMFxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgd3guc2hvd1RvYXN0KHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfor7fovpPlhaXlkIjms5XnmoRcIue6ouWMhemHkeminVwi5ZKMXCLnuqLljIXkuKrmlbBcIuaVsOWtlycsXG4gICAgICAgICAgICAgICAgICAgIGljb246IFwibm9uZVwiLFxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwMCxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi57qi5YyF6YeR6aKdXCIsIHBhcnNlRmxvYXQodGhhdC5kYXRhLm1vbmV5KSAqIDEwMCk7XG4gICAgICAgICAgICAgICAgLy/lh4blpIfnlJ/miJDnuqLljIVcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVkaWRSZXMgPSBhd2FpdCBwb3N0KHJlZGlkLCB7IFwibmVlZF9kZXRhaWxfaW5mb1wiOiB0cnVlIH0pXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlZGlkUmVzLmRhdGEuc2VxX25vKVxuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzID0gYXdhaXQgcG9zdChnaXZlb3V0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uaWQ6IGFwcC5nbG9iYWxEYXRhLnNlc3Npb25pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vbmV5OiBwYXJzZUZsb2F0KHRoYXQuZGF0YS5tb25leSkgKiAxMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBycG51bTogcGFyc2VJbnQodGhhdC5kYXRhLmFtb3VudCksXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOiBnZXRUaW1lKCksXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB0aGF0LmRhdGEuYWN0aXZlVHlwZSArIFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWRpZDogcmVkaWRSZXMuZGF0YS5zZXFfbm8sXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb250eXBlOiB0aGF0LmRhdGEuYWN0aW9uVHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdGhhdC5kYXRhLmFjdGlvblR5cGUgKyBcIlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhwYXlTdGF0dXMpXG4gICAgICAgICAgICAgICAgICAgIC8vIGxldCBpZCwgcXVlc0xpc3Q7XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmICh0eXBlb2YgcmVzLmRhdGEgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIGlkID0gcmVzLmRhdGEucmVkaWQ7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBxdWVzTGlzdCA9XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgcmVzLmRhdGEucXVlc3Rpb25fbGlzdC5sZW5ndGggPT09IDBcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgOiBKU09OLnN0cmluZ2lmeShyZXMuZGF0YS5xdWVzdGlvbl9saXN0KTtcbiAgICAgICAgICAgICAgICAgICAgLy8gfSBlbHNlIGlkID0gcmVzLmRhdGE7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gd3gubmF2aWdhdGVUbyh7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB1cmw6IGAuLi9zaGFyZVJlZHAvc2hhcmVSZWRwP3F1ZXN0aW9uPSR7dGhhdC5kYXRhLnF1ZXN0aW9ufSZxdWVzTGlzdD0ke3F1ZXNMaXN0fSZuaWNrTmFtZT0ke3RoYXQuZGF0YS51c2VySW5mby5uaWNrTmFtZX0mYXZhVXJsPSR7dGhhdC5kYXRhLnVzZXJJbmZvLmF2YXRhclVybH0mcmVkaWQ9JHtpZH0mYWN0aXZlVHlwZT0ke3RoYXQuZGF0YS5hY3RpdmVUeXBlfSZhY3Rpb25UeXBlPSR7dGhhdC5kYXRhLmFjdGlvblR5cGV9YCxcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIHN1Y2Nlc3M6ICgpID0+IHJlc29sdmUocmVzKSxcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIGZhaWw6ICgpID0+IHJlamVjdCgpLFxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgY29tcGxldGU6IChyZXMpID0+IGNvbnNvbGUubG9nKHJlcyksXG4gICAgICAgICAgICAgICAgICAgIC8vIH0pO1xuICAgICAgICAgICAgICAgICAgICB3eC5yZXF1ZXN0UGF5bWVudCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5yZXMuZGF0YS5wYXlfcmVzcC5wYXlfcGFyYW0sXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3luYyBzdWNjZXNzKHJlczEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMxKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXlSZXMgPSBhd2FpdCBwb3N0KHBheVN0YXR1cywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uaWQ6IGFwcC5nbG9iYWxEYXRhLnNlc3Npb25pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVkaWQ6IHJlZGlkUmVzLmRhdGEuc2VxX25vLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IFwidHJ1ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhwYXlSZXMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGlkLCBxdWVzTGlzdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlcy5kYXRhID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkID0gcmVzLmRhdGEucmVkaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXNMaXN0ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5kYXRhLnF1ZXN0aW9uX2xpc3QubGVuZ3RoID09PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IEpTT04uc3RyaW5naWZ5KHJlcy5kYXRhLnF1ZXN0aW9uX2xpc3QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZCA9IHJlcy5kYXRhO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogYC4uL3NoYXJlUmVkcC9zaGFyZVJlZHA/cXVlc3Rpb249JHt0aGF0LmRhdGEucXVlc3Rpb259JnF1ZXNMaXN0PSR7cXVlc0xpc3R9Jm5pY2tOYW1lPSR7dGhhdC5kYXRhLnVzZXJJbmZvLm5pY2tOYW1lfSZhdmFVcmw9JHt0aGF0LmRhdGEudXNlckluZm8uYXZhdGFyVXJsfSZyZWRpZD0ke2lkfSZhY3RpdmVUeXBlPSR7dGhhdC5kYXRhLmFjdGl2ZVR5cGV9JmFjdGlvblR5cGU9JHt0aGF0LmRhdGEuYWN0aW9uVHlwZX1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0LnNldERhdGEoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vbmV5OiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFtb3VudDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvblN0YXRlOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYWR5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmVUeXBlOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWw6ICgpID0+IHJlamVjdCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzeW5jIGZhaWwoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBheVJlcyA9IGF3YWl0IHBvc3QocGF5U3RhdHVzLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25pZDogYXBwLmdsb2JhbERhdGEuc2Vzc2lvbmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWRpZDogcmVkaWRSZXMuZGF0YS5zZXFfbm8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogXCJmYWxzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhwYXlSZXMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd3guc2hvd1RvYXN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IFwi55Sf5oiQ57qi5YyF5aSx6LSlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb246IFwibm9uZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICB3eC5zaG93VG9hc3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IFwi55Sf5oiQ57qi5YyF5aSx6LSlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uOiBcIm5vbmVcIixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSksXG5cbiAgICBvbkxvYWQ6IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc3QgdGhhdCA9IHRoaXM7XG4gICAgICAgIHBhZ2VUaGlzID0gdGhhdDtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgYXBwLmdldFNlc3Npb25JZCgpO1xuICAgICAgICAgICAgLy/lt7LmnIlzZXNzaW9uaWTvvIzkuI3pnIDopoHmmL7npLpsb2dpbueVjOmdolxuICAgICAgICAgICAgdGhhdC5zZXREYXRhKHtcbiAgICAgICAgICAgICAgICBoYXNTZXNzaW9uSWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgaGFzUmVxdWVzdERhdGE6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAvL+ayoeaciXNlc3Npb25pZO+8jOmcgOimgeaYvuekumxvZ2lu55WM6Z2iXG4gICAgICAgICAgICB0aGF0LnNldERhdGEoe1xuICAgICAgICAgICAgICAgIGhhc1Nlc3Npb25JZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgaGFzUmVxdWVzdERhdGE6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHd4LmhpZGVTaGFyZU1lbnUoeyBtZW51czogW1wic2hhcmVBcHBNZXNzYWdlXCIsIFwic2hhcmVUaW1lbGluZVwiXSB9KTtcbiAgICB9LFxuXG4gICAgb25TaG93KCkge1xuICAgIH0sXG59KTtcbiJdfQ==