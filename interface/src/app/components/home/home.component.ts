import { Component, OnInit } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { AuthService } from 'src/app/services/auth.service'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  currentRoute: string = ''; // Assuming you have a variable to store the current route
  
  credentials = {
    loggedIn: false,
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  }

  constructor(private router: Router, private authService: AuthService) {
    this.authService.credentials = this.credentials

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  isSelected(route: string): boolean {
    return this.currentRoute === route;
  }

  routeTo(route:string) {
    this.router.navigate(['/'+ route])
  }
}