// 封装http请求

const app = getApp();

const request = (url, options) => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${app.globalData.baseUrl}${url}`,
            method: options.method,
            data:
                options.method === "GET"
                    ? options.data
                    : JSON.stringify(options.data),
            //如果是GET,GET自动让数据成为query String,其他方法需要让options.data转化为字符串
            header: {
                "content-type": "application/json; charset=UTF-8",
            },
            success: (res) => resolve(res),
            fail: (err) => reject(err),
        });
    });
};
//封装get方法
const get = (url, options = {}) => {
    return request(url, {
        method: "GET",
        data: options,
    });
};
//封装post方法
const post = (url, options) => {
    return request(url, {
        method: "POST",
        data: options,
    });
};
//封装put方法
const put = (url, options) => {
    return request(url, {
        method: "PUT",
        data: options,
    });
};
//封装remove方法
// 不能声明DELETE（关键字）
const remove = (url, options) => {
    return request(url, {
        method: "DELETE",
        data: options,
    });
};
//抛出wx.request的post,get,put,remove方法
module.exports = {
    get,
    post,
    put,
    remove,
};
