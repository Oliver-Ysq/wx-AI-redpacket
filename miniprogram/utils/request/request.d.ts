declare function get(
    url: string,
    options: WechatMiniprogram.IAnyObject
): Promise<any>;
declare function post(
    url: string,
    options: WechatMiniprogram.IAnyObject
): Promise<any>;
declare function put(
    url: string,
    options: WechatMiniprogram.IAnyObject
): Promise<any>;
declare function remove(
    url: string,
    options: WechatMiniprogram.IAnyObject
): Promise<any>;
export { get, post, put, remove };
