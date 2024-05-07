import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable, last } from 'rxjs'
import { environment } from 'src/environments/environment'

const AUTH_API = environment.serverUrl + '/api/auth/'
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
    phone: ''
  }

  constructor(private http: HttpClient) { }

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

  updateCredentials(firstName:string, lastName:string, email:string, phone:string){
    this.credentials.loggedIn= true
    this.credentials.firstName= firstName
    this.credentials.lastName= lastName
    this.credentials.email= email
    this.credentials.phone = phone
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
}
