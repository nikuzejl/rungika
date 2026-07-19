import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.css']
})
export class AccountDetailsComponent {
    signedIn = false
    user: any

    constructor(
      private authService: AuthService,
      private storageService: StorageService,
      private router: Router
    ) { }
  
    ngOnInit(): void {
      this.signedIn = this.authService.credentials.loggedIn
      if (this.signedIn) {
        this.user = this.authService.credentials
      }
    }
  
    logout() {
      this.storageService.clean()
      this.authService.credentials.loggedIn = false
      this.signedIn = false
      this.router.navigate(['/home'], {
        queryParams: {
          toast: 'logout'
        }
      })
    }
    
    modifyAccount(){}
}
