export declare function loadModel(): Promise<any>;
export declare function getLabels(): Promise<any>;
export declare function preprocess(that: any, imgData: any): any;
export declare function judgeByModels(PIC: any, that: any): Promise<any>;
export declare function findIndicesOfMax(inp: any[], count: number): any[];
export declare function getClassNames(that: any, indices: any[]): any[];
export declare function getPicBox(
    pointRecord: any[]
): {
    min: number;
    max: number;
    height: number;
    width: number;
};
