import { Component } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-credentials',
  templateUrl: './credentials.component.html',
  styleUrls: ['./credentials.component.css']
})
export class CredentialsComponent {
  signedIn = false
  user: any

  constructor(
    private router: Router,
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
    this.signedIn = this.storageService.isLoggedIn()

    if (this.signedIn) {
      const user = this.storageService.getUser()
      this.user = user
    }
  }

  logout() {
    this.storageService.clean()
    window.location.reload()
  }

  login() {
    this.router.navigate(['/login'])
  }

  signup() {
    this.router.navigate(['/signup'])
  }

  home(){
    this.router.navigate(['/home'])
  }
}
