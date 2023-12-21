import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { SucessComponent } from './components/sucess/sucess.component'
import { SignupComponent } from './components/signup/signup.component'
import { ProfileComponent } from './components/profile/profile.component'
import { LoginComponent } from './components/login/login.component'
import { TransferComponent } from './components/transfer/transfer.component'
import { ExchangeRateComponent } from './components/exchange-rate/exchange-rate.component'
import { AccountDetailsComponent } from './components/account-details/account-details.component'
import { WhoWeAreComponent } from './components/who-we-are/who-we-are.component'
import { HowItWorksComponent } from './components/how-it-works/how-it-works.component'
import { CancelComponent } from './components/cancel/cancel.component'
import { RecipientDetailsComponent } from './components/recipient-details/recipient-details.component'

const routes: Routes = [
  { path: '', component: ExchangeRateComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: ExchangeRateComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'transfer', component: TransferComponent},
  { path: 'recipient-details', component: RecipientDetailsComponent},
  { path: 'cancel', component: CancelComponent},
  { path: 'success', component: SucessComponent},
  { path: 'account-details', component: AccountDetailsComponent},
  { path: 'success/:orderId', component: SucessComponent },
  { path: 'who-we-are', component: WhoWeAreComponent},
  { path: 'how-it-works', component: HowItWorksComponent}
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
