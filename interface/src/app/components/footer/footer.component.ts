import { Component, HostListener } from '@angular/core'

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  showBottomDiv = false

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event) {
    this.showBottomDiv = this.isBottom()
  }

  private isBottom(): boolean {
    const scrollPosition = window.scrollY
    const windowHeight = window.innerHeight
    const documentHeight = document.body.scrollHeight
    return scrollPosition + windowHeight >= documentHeight
  }
}
