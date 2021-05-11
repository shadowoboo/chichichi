export interface IToARuChipInfo {
    // Date,  ISO string
    Time : string,
    Chips: IChipInfo[]
}

export interface IChipInfo{
    Name: string;
    Data: IChipValues;
}

export interface IChipValues{
    // ts7053, 如果有要使用 Object.keys() 要連 index 屬性一起規範
    [index: string] : number;
    VSHUNT : number;
    VBUS : number;
    CURRENT : number;
    POWER : number;
    SOVL : number;
}

export enum EChipValuesKey{
    VSHUNT = 'VSHUNT',
    VBUS = 'VBUS',
    CURRENT = 'CURRENT',
    POWER = 'POWER',
    SOVL = 'SOVL',
}