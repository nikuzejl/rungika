import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { SucessComponent } from './components/sucess/sucess.component'
import { SignupComponent } from './components/signup/signup.component'
import { ProfileComponent } from './components/profile/profile.component'
import { CredentialsComponent } from './components/credentials/credentials.component'
import { LoginComponent } from './components/login/login.component'
import { TransferComponent } from './components/transfer/transfer.component'
import { ExchangeRateComponent } from './components/exchange-rate/exchange-rate.component'
import { HomeComponent } from './components/home/home.component'
import { AccountDetailsComponent } from './account-details/account-details.component'

const routes: Routes = [
  { path: '', component: ExchangeRateComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: ExchangeRateComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'transfer', component: TransferComponent},
  { path: 'account-details', component: AccountDetailsComponent},
  { path: 'success/:orderId', component: SucessComponent },
  { path: 'credentials/:user', component: CredentialsComponent},
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
