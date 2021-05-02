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
    VSHUNT : number;
    VBUS : number;
    CURRENT : number;
    POWER : number;
    SOVL : number;
}