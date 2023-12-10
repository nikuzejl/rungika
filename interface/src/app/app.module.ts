import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { AppComponent } from './app.component'
import { HttpClientModule } from '@angular/common/http'
import { AppRoutingModule } from './app-routing.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { HomeComponent } from './components/home/home.component'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatTooltipModule } from '@angular/material/tooltip'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatCardModule } from '@angular/material/card'
import { MatButtonModule } from '@angular/material/button'
import { NgxStripeModule } from 'ngx-stripe'
import { SucessComponent } from './components/sucess/sucess.component'
import { SpinnerComponent } from './components/spinner/spinner.component'
import { FooterComponent } from './components/footer/footer.component'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { SignupComponent } from './components/signup/signup.component'
import { ProfileComponent } from './components/profile/profile.component'
import { MatDialogModule } from '@angular/material/dialog'
import { environment } from 'src/environments/environment'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { CredentialsComponent } from './components/credentials/credentials.component'
import { TransferComponent } from './components/transfer/transfer.component'
import { AppMaterialModule } from './app.meterial.module'
import { LoginComponent } from './components/login/login.component'
import { NgIf } from '@angular/common'
import { ExchangeRateComponent } from './components/exchange-rate/exchange-rate.component';
import { AccountDetailsComponent } from './account-details/account-details.component'
import { CurrencyService } from './currency.service'

@NgModule({
	declarations: [
		AppComponent,
		HomeComponent,
		SpinnerComponent,
		SucessComponent,
		FooterComponent,
		SignupComponent,
		ProfileComponent,
		CredentialsComponent,
		TransferComponent,
		LoginComponent,
		ExchangeRateComponent,
        AccountDetailsComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		MatSlideToggleModule,
		MatProgressSpinnerModule,
		MatTooltipModule,
		BrowserAnimationsModule,
		MatCardModule,
		MatButtonModule,
		FontAwesomeModule,
		ReactiveFormsModule,
		MatIconModule,
		MatInputModule,
		NgIf,
		MatDialogModule,
		BrowserModule,
		FormsModule,
		MatSnackBarModule,
		BrowserAnimationsModule,
		AppMaterialModule,
		NgxStripeModule.forRoot(environment.STRIPE_PUBLIC_KEY)
	],
	providers: [CurrencyService],
	bootstrap: [AppComponent]
})
export class AppModule { }
