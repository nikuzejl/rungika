import { Injectable } from '@angular/core'
import { CanActivate, Router, UrlTree } from '@angular/router'
import { AuthService } from '../services/auth.service'

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (!this.authService.credentials.loggedIn) {
      return this.router.parseUrl('/login')
    }

    if (!this.authService.isAdmin()) {
      return this.router.parseUrl('/home')
    }

    return true
  }
}
