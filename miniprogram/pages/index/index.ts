// index.ts
// 获取应用实例

import { persondata, giveout, shift, redid, payStatus } from "../../utils/request/api";
import { post } from "../../utils/request/request";
import { getTime, onetap } from "../../utils/util";
const app = getApp<IApp>();
let pageThis: any;

interface IData {
    ready: boolean;
    focus1: boolean;
    focus2: boolean;
    questionState: number;
    activeType: number;
    typeList: Array<{ text: string; src: string }>;
    questionList: Array<any>;

    hasRequestData: boolean;
    hasSessionId: boolean;

    hiddenmodalput: boolean;
    // canIUse: boolean;
    money?: number | null;
    amount?: number | null;
    question?: string;
}
Page<IData, WechatMiniprogram.IAnyObject>({
    data: {
        ready: false,
        focus1: false,
        focus2: false,

        questionState: 0, //  0：请选择    1：取消       2：已选中
        activeType: 0, //  0：画图红包  1：表情红包    2：识物红包    3：动作红包
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
            //为了实现“换一批”功能，计算得出每种字数的宽度 并进行布局
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
        // canIUse: wx.canIUse("button.open-type.getUserInfo"),
    },

    gotoMyRedp() {
        if (!app.globalData.sessionid) return;
        wx.navigateTo({
            url: "../myRedp/myRedp",
        });
    },

    showInputModal: () =>
        pageThis.setData({
            hiddenmodalput: !pageThis.data.hiddenmodalput,
            question: "",
        }),

    modalinput: (e: any) => pageThis.setData({ question: e.detail.value }),

    modalcancel: function () {
        this.setData({
            hiddenmodalput: true,
            question: "",
        });
    },

    confirm: function () {
        console.log(this.data.question);
        const that = this;
        that.setData(
            {
                hiddenmodalput: true,
                questionState: 2,
            },
            () => {
                console.log("定义成功", that.data.question);
                that.checkInfo();
            }
        );
    },

    setupApp() {
        this.setData({ hasSessionId: true });
    },

    //后端注册信息
    async loginAndPersondata() {
        try {
            await post(persondata, {
                sessionid: app.globalData.sessionid,
                name: app.globalData.userInfo.nickName,
                avaurl: app.globalData.userInfo.avatarUrl,
            });
        } catch (err) {
            console.log(err);
        }
    },

    //选择红包类型
    chooseType(e: any) {
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

    handleFocus(e: any) {
        const type = e.currentTarget.dataset.type,
            that = this;
        if (type == 0) {
            that.setData({
                focus1: true,
                focus2: false,
            });
        } else {
            that.setData({
                focus2: true,
                focus1: false,
            });
        }
    },

    //获得input中的值
    getInputValue(e: any) {
        const that = this;
        if (e.currentTarget.dataset.type == 0) {
            //设定红包总金额
            that.setData({
                money:
                    parseFloat(parseFloat(e.detail.value).toFixed(2)) > 200
                        ? 200
                        : parseFloat(parseFloat(e.detail.value).toFixed(2)),
                focus1: false,
            });
        } else {
            that.setData({
                //设定红包个数
                amount:
                    parseInt(e.detail.value) > 20
                        ? 20
                        : parseInt(e.detail.value),
                focus2: false,
            });
        }
        that.checkInfo();
    },

    //设定题目
    setQuestion() {
        this.setData({
            questionState: 1,
        });
    },

    //取消选择
    cancel() {
        this.setData({
            question: "",
            questionState: 0,
            ready: false,
        });
    },

    //选定题目
    chooseQuestion: function (e: any) {
        const that = this;
        let question =
            that.data.questionList[that.data.activeType][e.currentTarget.id];
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

    //重新选择
    reChoose() {
        this.setData({
            questionState: 1,
            question: "",
        });
    },

    //换一批
    async refresh() {
        const that = this;
        if (that.data.activeType !== 0 && that.data.activeType !== 2) return;
        else {
            let type = that.data.activeType == 0 ? 1 : 2; //画图type=1；识物type=2
            console.log("换一批");
            let res = await post(shift, { type });
            let quesList = that.data.questionList;
            quesList[that.data.activeType] = res.data.question_list;
            that.setData({ questionList: quesList });
        }
    },

    //查看input信息是否填写“完全”且“合法”
    checkInfo() {
        const that = this;
        if (!that.data.money || !that.data.amount || !that.data.question) {
            that.setData({ ready: false });
        } else if (
            isNaN(that.data.money) ||
            isNaN(that.data.amount) ||
            that.data.money <= 0 ||
            that.data.amount <= 0
        ) {
            that.setData({
                ready: false,
            });
        } else {
            console.log(that.data.money, that.data.amount, that.data.question);
            that.setData({ ready: true });
        }
    },

    //  只能输入整数 / 两位小数
    checkMoneyFormat(e: any) {
        if (!/^\d+\.?\d{0,10}$/.test(e.detail.value)) {
            var s = e.detail.value;
            return s.substring(0, s.length - 1);
        }
    },

    // 只能输入正整数
    checkAmountFormat: (e: any) => e.detail.value.replace(/\D/g, ""),

    async judgeAuthority(e: any) {
        console.log(e.detail);
        const that = this;
        try {
            // 已授权，直接获取userinfo
            let res = await app.getuserinfo();
            console.log("已授权");
            that.setData({ userInfo: res }, async () => {
                await that.loginAndPersondata();
                that.submmit();
            });
        } catch (err) {
            //未获取userinfo，尝试获取
            let info = e.detail.args;
            if (!info || !info.detail || !info.detail.userInfo) {
                //用户拒绝
                wx.showToast({
                    title: "授权后才能发送红包哦！",
                    icon: "none",
                });
                return;
            }
            // 用户允许获取userinfo
            app.globalData.userInfo = info.detail.userInfo;
            that.setData({ userInfo: info.detail.userInfo }, async () => {
                await that.loginAndPersondata();
                that.submmit();
            });
        }
    },

    async judgeAuthorityMyRedp(e: any) {
        console.log(e.detail);
        const that = this;
        try {
            // 已授权，直接获取userinfo
            let res = await app.getuserinfo();
            console.log("已授权");
            that.setData({ userInfo: res }, async () => {
                await that.loginAndPersondata();
                that.gotoMyRedp()
            });
        } catch (err) {
            //未获取userinfo，尝试获取
            let info = e.detail.args;
            if (!info || !info.detail || !info.detail.userInfo) {
                //用户拒绝
                wx.showToast({
                    title: "授权后才能发送红包哦！",
                    icon: "none",
                });
                return;
            }
            // 用户允许获取userinfo
            app.globalData.userInfo = info.detail.userInfo;
            that.setData({ userInfo: info.detail.userInfo }, async () => {
                await that.loginAndPersondata();
                that.gotoMyRedp();
            });
        }
    },

    // 提交信息
    // 此处使用了onetap方法，防止多次点按。
    submmit: onetap(async () => {
        return new Promise(async (resolve, reject) => {
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
            } else if (!that.data.amount) {
                wx.showToast({
                    title: "请输入红包个数",
                    icon: "none",
                    duration: 1000,
                    success() {
                        reject();
                        return;
                    },
                });
            } else if (!that.data.question) {
                wx.showToast({
                    title: "请选择题目",
                    icon: "none",
                    duration: 1000,
                    success() {
                        reject();
                        return;
                    },
                });
            } else if (
                isNaN(that.data.money) ||
                isNaN(that.data.amount) ||
                that.data.money <= 0 ||
                that.data.amount <= 0
            ) {
                wx.showToast({
                    title: '请输入合法的"红包金额"和"红包个数"数字',
                    icon: "none",
                    duration: 1000,
                    success: () => {
                        reject();
                        return;
                    },
                });
            } else {
                console.log("红包金额", parseFloat(that.data.money) * 100);
                //准备生成红包
                try {
                    let redidRes = await post(redid, { "need_detail_info": true })
                    console.log(redidRes.data.seq_no)
                    let res = await post(giveout, {
                        sessionid: app.globalData.sessionid,
                        money: parseFloat(that.data.money) * 100,
                        rpnum: parseInt(that.data.amount),
                        time: getTime(),
                        type: that.data.activeType + "",
                        redid: redidRes.data.seq_no,
                        actiontype: that.data.actionType
                            ? that.data.actionType + ""
                            : undefined,
                    });
                    console.log(res);
                    // console.log(payStatus)
                    // let id, quesList;
                    // if (typeof res.data === "object") {
                    //     id = res.data.redid;
                    //     quesList =
                    //         res.data.question_list.length === 0
                    //             ? undefined
                    //             : JSON.stringify(res.data.question_list);
                    // } else id = res.data;

                    // wx.navigateTo({
                    //     url: `../shareRedp/shareRedp?question=${that.data.question}&quesList=${quesList}&nickName=${that.data.userInfo.nickName}&avaUrl=${that.data.userInfo.avatarUrl}&redid=${id}&activeType=${that.data.activeType}&actionType=${that.data.actionType}`,
                    //     success: () => resolve(res),
                    //     fail: () => reject(),
                    //     complete: (res) => console.log(res),
                    // });
                    wx.requestPayment({
                        ...res.data.pay_resp.pay_param,
                        async success(res1) {
                            console.log(res1)
                            let payRes = await post(payStatus, {
                                sessionid: app.globalData.sessionid,
                                redid: redidRes.data.seq_no,
                                status: "true"
                            })
                            console.log(payRes)
                            let id, quesList;
                            if (typeof res.data === "object") {
                                id = res.data.redid;
                                quesList =
                                    res.data.question_list.length === 0
                                        ? undefined
                                        : JSON.stringify(res.data.question_list);
                            } else id = res.data;

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
                                        resolve(res)
                                    });
                                },
                                fail: () => reject(),
                                complete: (res) => {
                                    console.log(res)
                                },
                            });
                        },
                        async fail(err) {
                            let payRes = await post(payStatus, {
                                sessionid: app.globalData.sessionid,
                                redid: redidRes.data.seq_no,
                                status: "false"
                            })
                            console.log(payRes)
                            wx.showToast({
                                title: "生成红包失败",
                                icon: "none",
                            });
                            reject(err);
                        }
                    })
                } catch (err) {
                    wx.showToast({
                        title: "生成红包失败",
                        icon: "none",
                    });
                    reject(err);
                }
            }
        });
    }),

    onLoad: async function () {
        const that = this;
        pageThis = that;

        try {
            await app.getSessionId();
            //已有sessionid，不需要显示login界面
            that.setData({
                hasSessionId: true,
                hasRequestData: true,
            });
        } catch (err) {
            //没有sessionid，需要显示login界面
            that.setData({
                hasSessionId: false,
                hasRequestData: true,
            });
        }

        wx.hideShareMenu({ menus: ["shareAppMessage", "shareTimeline"] });
    },

    onShow() {
    },
});
