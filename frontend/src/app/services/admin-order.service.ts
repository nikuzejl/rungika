import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { environment } from 'src/environments/environment'

const ADMIN_ORDER_API = environment.serverUrl + '/api/v1/admin/orders'
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
}

export interface AdminOrderUpdateRequest {
  status: 'COMPLETED' | 'FAILED'
  note?: string
  photo?: string
}

@Injectable({
  providedIn: 'root'
})
export class AdminOrderService {
  constructor(private http: HttpClient) {}

  getPendingOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${ADMIN_ORDER_API}/pending`, httpOptions)
  }

  getFailedOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${ADMIN_ORDER_API}/failed`, httpOptions)
  }

  getCompletedOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${ADMIN_ORDER_API}/completed`, httpOptions)
  }

  updateOrderStatus(orderId: number, payload: AdminOrderUpdateRequest): Observable<any> {
    return this.http.patch(`${ADMIN_ORDER_API}/${orderId}/status`, payload, httpOptions)
  }
}
