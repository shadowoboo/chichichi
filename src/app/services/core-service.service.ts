import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { ICoreConfig } from '../models/core-config-model';

@Injectable({
  providedIn: 'root'
})
export class CoreServiceService {

  readonly CoreConfigUrl = `./assets/core-config.json`;
  readonly CoreConfig$: Observable<ICoreConfig> = this.httpClient.get<ICoreConfig>(this.CoreConfigUrl).pipe(share());
  readonly LinkUrl$ = this.CoreConfig$.pipe(
    map(({protocol, ip, port})  => `${protocol}://${ip}:${port}`)
  )

  private _LinkUrl = '';
  get LinkUrl(){
    return this._LinkUrl;
  }

  constructor(
    private httpClient: HttpClient,
  ) { 
    this.initLinkUrl();
  }

  // getCoreConfig(){
  //   const url = `@assets/core-config.json`;
  //   return this.httpClient.get(url);
  // }

  private initLinkUrl(){
    this.CoreConfig$.subscribe(
      ({protocol, ip, port})  => {
        this._LinkUrl = `${protocol}://${ip}:${port}`;
        console.log('Link Url: ', this.LinkUrl);
      },
      (err: HttpErrorResponse) => {
        console.error(err);
        this._LinkUrl = '';
      }
    )
  }
}
