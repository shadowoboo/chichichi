import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';
import { Subject, timer } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { IToARuChipInfo } from 'src/app/models/a-ru-chip';
import { CoreServiceService } from 'src/app/services/core-service.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  providers: [CoreServiceService],
})
export class WelcomeComponent implements OnInit, OnDestroy {

  dataLimitNumber = 10;

  mergeData = new Map();

  isFirst = true;

  // options: EChartsOption[] = [];
  options: any[] = [];
  rawDatas: any = [];
  unsubscribeAll$ = new Subject();
  

  constructor(
     private http: HttpClient,
     private coreService: CoreServiceService,
  ) { 
    console.log('LinkUrl: ', this.coreService.LinkUrl)
    this.coreService.LinkUrl$.subscribe(url => console.log('Link Url $: ', url))
  }

  ngOnInit() {
    this.getDataInterval(1, 1000);
    // timer(1,1000)
    //   .pipe(
    //     takeUntil(this.unsubscribeAll$),
    //   )
    //   .subscribe(() => this.getData());
  }

  ngOnDestroy() {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }  

  getDataInterval(initTimeMs: number, piriodTimeMs: number){
    timer(initTimeMs, piriodTimeMs)
      .pipe(
        switchMap(() => this.coreService.LinkUrl$),
        switchMap((url) => this.http.get<IToARuChipInfo>(url)),
        takeUntil(this.unsubscribeAll$),
      )
      .subscribe(
        res => {
          // 暫存 資料 (維持在 n 筆)
          this.rawDatas = this.rawDatas && this.rawDatas.length <= this.dataLimitNumber 
            ? [...this.rawDatas, res]
            : [...(this.rawDatas.slice(1)), res];

          if(this.isFirst){
            // 建立 圖表設定項目 options
            this.options = res.Chips.map( (rawData) => {
              return ({
                ...clone(basicOption),
                // 更新名稱
                title: {text: rawData.Name},
                // data: this.mergeData,
              })
            })
            this.isFirst = false;
          }

          
          // 更新 圖表資料 datas, 用 Name 來 Mapping
          res.Chips.forEach( chipData => {
            const oldMergeData = this.mergeData.has(chipData.Name) && this.mergeData.get(chipData.Name).series[0].data.length <= this.dataLimitNumber
              ? this.mergeData.get(chipData.Name).series[0].data 
              : this.mergeData.has(chipData.Name)
              ? this.mergeData.get(chipData.Name).series[0].data.slice(1)
              : [];

            this.mergeData.set(
              chipData.Name, 
              // TODO: 資料接收
              {
                series: [{
                  data:  [
                    ...oldMergeData,
                    [res.Time, chipData.Data.CURRENT]
                  ]
                  // data: oldMergeData.push([res.Time, chipData.Data.CURRENT])
                }]
              }
            
            )
          })
          // console.log(
            // '\n getData -----',
            // '\n this.rawDatas: ', this.rawDatas,
            // '\n this.options: ', this.options,
            // '\n this.mergeData: ', this.mergeData,
          // )
        },
        err => {
          console.error(err);
        }
      )
  }

  getData(){
    // const ip = '192.168.50.165';
    // const port = '18885';
    // const url = `http://${ip}:${port}/getdata`;

    const url = `http://localhost:8000/`;

    this.http.get<IToARuChipInfo>(url)
    .subscribe(
      res => {
        // 暫存 資料 (維持在 n 筆)
        this.rawDatas = this.rawDatas && this.rawDatas.length <= this.dataLimitNumber 
          ? [...this.rawDatas, res]
          : [...(this.rawDatas.slice(1)), res];

        if(this.isFirst){
          // 建立 圖表設定項目 options
          this.options = res.Chips.map( (rawData) => {
            return ({
              ...clone(basicOption),
              // 更新名稱
              title: {text: rawData.Name},
              // data: this.mergeData,
            })
          })
          this.isFirst = false;
        }

        
        // 更新 圖表資料 datas, 用 Name 來 Mapping
        res.Chips.forEach( chipData => {
          const oldMergeData = this.mergeData.has(chipData.Name) && this.mergeData.get(chipData.Name).series[0].data.length <= this.dataLimitNumber
            ? this.mergeData.get(chipData.Name).series[0].data 
            : this.mergeData.has(chipData.Name)
            ? this.mergeData.get(chipData.Name).series[0].data.slice(1)
            : [];

          // let oldMergeData;
          // if(this.mergeData.has(chipData.Name) && this.mergeData.get(chipData.Name).series[0].data.length <= this.dataLimitNumber){
          //   oldMergeData = this.mergeData.get(chipData.Name).series[0].data;
          // }else if(this.mergeData.has(chipData.Name)){
          //   this.mergeData.get(chipData.Name).series[0].data.shift();
          //   oldMergeData = this.mergeData.get(chipData.Name).series[0].data;          
          // }else{
          //   oldMergeData = [];
          // }

          this.mergeData.set(
            chipData.Name, 
            // TODO: 資料接收
            {
              series: [{
                data:  [
                  ...oldMergeData,
                  [res.Time, chipData.Data.CURRENT]
                ]
                // data: oldMergeData.push([res.Time, chipData.Data.CURRENT])
              }]
            }
           
          )
        })
        // console.log(
          // '\n getData -----',
          // '\n this.rawDatas: ', this.rawDatas,
          // '\n this.options: ', this.options,
          // '\n this.mergeData: ', this.mergeData,
        // )
      },
      err => {
        console.error(err);
      }
    )
  }
}

const basicOption: EChartsOption = {
  title: {
    text: "X: 時間 ; Y: chip 數值"
  },
  dataZoom:[
    {
      type: 'slider',
      xAxisIndex: 0,
      height: 20,
      bottom: 0,
      start: 0,
      end: 100,
    },
    {
      type: 'slider',
      yAxisIndex: 0,
      width: 15,
      top: 0,
      bottom: 50,
      start: 0,
      end: 100,
    },
  ],
  tooltip: {
    trigger: "axis",
    // formatter: function(params) {
    //   params = params[0];
    //   var date = new Date(params.name);
    //   return (
    //     date.getDate() +
    //     "/" +
    //     (date.getMonth() + 1) +
    //     "/" +
    //     date.getFullYear() +
    //     " : " +
    //     params.value[1]
    //   );
    // },
    axisPointer: {
      animation: false
    }
  },
  xAxis: {
    type: "time",
    splitLine: {
      show: true
    }
  },
  yAxis: {
    type: "value",
    boundaryGap: [0, "100%"],
    splitLine: {
      show: true
    }
  },
  series: [
    {
      name: "CURRENT",
      type: "line",
      showSymbol: false,
      animation: false,
      // hoverAnimation: false,
      // data: this.data
    }
  ]
};

function clone(data: any) {
  return JSON.parse(JSON.stringify(data));
}