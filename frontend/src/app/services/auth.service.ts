import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import { StorageService } from './storage.service'

const AUTH_API = environment.serverUrl + '/api/auth/'
const ACCOUNT_API = environment.serverUrl + '/api/account/'
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  credentials = {
    loggedIn: false,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    roles: [] as string[]
  }

  constructor(private http: HttpClient, private storageService: StorageService) {
    this.restoreCredentials()
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'signin',
      {
        "email":email,
        "password":password
      },
      httpOptions
    )
  }

  updateCredentials(firstName:string, lastName:string, email:string, phone:string, roles: string[] = []){
    this.credentials.loggedIn = true
    this.credentials.firstName = firstName
    this.credentials.lastName = lastName
    this.credentials.email = email
    this.credentials.phone = phone
    this.credentials.roles = roles
    this.storageService.saveUser({ firstName, lastName, email, phone, roles })
  }

  restoreCredentials() {
    const user = this.storageService.getUser()
    if (user) {
      this.credentials.loggedIn = true
      this.credentials.firstName = user.firstName || ''
      this.credentials.lastName = user.lastName || ''
      this.credentials.email = user.email || ''
      this.credentials.phone = user.phone || ''
      this.credentials.roles = user.roles || []
    }
  }

  clearCredentials() {
    this.credentials.loggedIn = false
    this.credentials.firstName = ''
    this.credentials.lastName = ''
    this.credentials.email = ''
    this.credentials.phone = ''
    this.credentials.roles = []
    this.storageService.clean()
  }

  isAdmin(): boolean {
    return this.credentials.roles.includes('ROLE_ADMIN')
  }

  signup(firstName: string, lastName: string, email: string, phone:string, password: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'signup',
      {
        "firstName":firstName,
        "lastName":lastName,
        "email":email,
        "phone":phone,
        "roles": ["ROLE_USER"],
        "password":password
      },
      httpOptions
    )
  }

  logout(): Observable<any> {
    return this.http.post(AUTH_API + 'signout', {}, httpOptions)
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(
      ACCOUNT_API + 'change-password',
      {
        "email": this.credentials.email,
        "currentPassword": currentPassword,
        "newPassword": newPassword
      },
      httpOptions
    )
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(
      ACCOUNT_API + `delete?email=${encodeURIComponent(this.credentials.email)}`,
      httpOptions
    )
  }

  getUserOrders(): Observable<any> {
    return this.http.get(
      ACCOUNT_API + `orders?email=${encodeURIComponent(this.credentials.email)}`,
      httpOptions
    )
  }
}
