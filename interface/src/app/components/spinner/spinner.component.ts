import { Component, OnInit } from '@angular/core'
import { SpinnerService } from 'src/app/services/spinner.service'

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent implements OnInit {
  users: Array<any> = []
  constructor(private spinnerService: SpinnerService) { }

  async ngOnInit(): Promise<void> {
    this.spinnerService.showSpinner()
  }
}
