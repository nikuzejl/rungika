import { Component } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { AuthService } from 'src/app/services/auth.service'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  currentRoute = ''
  showToast = false
  toastMessage = ''
  private toastTimer: ReturnType<typeof setTimeout> | null = null

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
        const parsedUrl = this.router.parseUrl(event.urlAfterRedirects)
        this.currentRoute = event.urlAfterRedirects.split('?')[0]

        const toastType = parsedUrl.queryParams['toast']
        const userName = parsedUrl.queryParams['name']

        if (toastType === 'login') {
          const message = userName
            ? `${userName} successfully logged in.`
            : 'Successfully logged in.'
          this.triggerToast(message)
          this.clearToastQueryParams()
        }

        if (toastType === 'logout') {
          this.triggerToast('Successfully logged out.')
          this.clearToastQueryParams()
        }
      }
    })
  }

  isSelected(route: string): boolean {
    return this.currentRoute === route
  }

  routeTo(route: string) {
    this.router.navigate(['/' + route])
  }

  private triggerToast(message: string) {
    this.toastMessage = message
    this.showToast = true

    if (this.toastTimer) {
      clearTimeout(this.toastTimer)
    }

    this.toastTimer = setTimeout(() => {
      this.showToast = false
      this.toastMessage = ''
    }, 5000)
  }

  private clearToastQueryParams() {
    this.router.navigate([], {
      queryParams: {
        toast: null,
        name: null
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    })
  }
}
