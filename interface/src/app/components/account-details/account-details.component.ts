import { Component } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.css']
})
export class AccountDetailsComponent {
    signedIn=false
    user:any

    constructor(
      private authService:AuthService,
      private storageService: StorageService
    ) { }
  
    ngOnInit(): void {
      this.signedIn = this.authService.credentials.loggedIn
      if (this.signedIn) {
        this.user = this.authService.credentials
      }
    }
  
    logout() {
      this.storageService.clean()
      this.signedIn = false
      window.location.reload()
    }
    
    modifyAccount(){}
}
