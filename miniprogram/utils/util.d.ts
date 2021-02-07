declare function throttle(
    callback: () => void,
    interval: number,
): () => void;
declare function debounce(
    callback: () => void,
    interval: number,
): () => void;
declare function onetap(callback: () => Promise<any>): () => void;
declare function getTime(): string;
declare function getFrameSliceOptions(
    frameWidth: number,
    frameHeight: number,
    displayWidth: number,
    displayHeight: number
): any;
declare function handleReceive(
    data: { status_code: number; money: number },
    that: any,
    resolve: any,
    reject: any,
    type: number,
    spendTime: number
): void;
declare function saveImageToPhotosAlbumByWX(tmpUrl: string): void;
declare function formatMoney(money: number): number;
declare function setCloseCanvas(that: any, flag: boolean): void

export {
    throttle,
    debounce,
    onetap,
    getTime,
    getFrameSliceOptions,
    handleReceive,
    saveImageToPhotosAlbumByWX,
    formatMoney,
    setCloseCanvas
};
