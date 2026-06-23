import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  REQUEST_OPTIONS = {
    withCredentials: true,
    headers: new HttpHeaders({
      Accept: 'application/json'
    })
  }
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  constructor(private http: HttpClient) { }

  postRequest(url: any, payload: any): Observable<any> {
    return this.http.post<any>(url, payload, this.httpOptions)
  }

  getRequest(url: any): Observable<any> {
    return this.http.get<any>(url)
  }

  sendSuccessEmail(query: any) {
    return this.http.post<any>(environment.serverUrl + '/send-success-order-email',
      query,
      this.httpOptions
    )
  }

  async waitGet(url: any){
    try {
      return await this.getRequest(url).toPromise()
    } catch (error) {
      console.error('Something wrong happened. Please retry')
    }
  }
}
