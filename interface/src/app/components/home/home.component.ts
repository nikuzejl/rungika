import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { AuthService } from 'src/app/services/auth.service'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  credentials = {
    loggedIn: false,
    firstName: '',
    lastName: '',
    email: ''
  }

  constructor(private router: Router, private authService: AuthService) {
    this.authService.credentials = this.credentials
  }
  ngOnInit() {}

  routeTo(route:string) {
    this.router.navigate(['/'+ route])
  }
}