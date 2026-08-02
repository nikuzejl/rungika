import { Component, OnInit } from '@angular/core'
import { AdminOrderService } from 'src/app/services/admin-order.service'
import { forkJoin } from 'rxjs'

interface AdminOrderDraft {
  status: 'COMPLETED' | 'FAILED'
  note: string
  photo: string
}

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit {
  pendingOrders: any[] = []
  failedOrders: any[] = []
  completedOrders: any[] = []
  updateDrafts: Record<number, AdminOrderDraft> = {}
  isLoading = false
  pageMessage = ''
  pageError = ''
  sectionExpanded = {
    pending: true,
    failed: false,
    completed: false
  }

  constructor(private adminOrderService: AdminOrderService) {}

  ngOnInit(): void {
    this.loadOrders()
  }

  loadOrders() {
    this.isLoading = true
    this.pageError = ''
    forkJoin({
      pending: this.adminOrderService.getPendingOrders(),
      failed: this.adminOrderService.getFailedOrders(),
      completed: this.adminOrderService.getCompletedOrders()
    }).subscribe({
      next: ({ pending, failed, completed }) => {
        this.pendingOrders = pending || []
        this.failedOrders = failed || []
        this.completedOrders = completed || []
        this.pendingOrders.forEach(order => {
          if (!this.updateDrafts[order.orderId]) {
            this.updateDrafts[order.orderId] = {
              status: 'COMPLETED',
              note: '',
              photo: ''
            }
          }
        })
        this.isLoading = false
      },
      error: err => {
        this.pageError = err?.error?.message || 'Failed to load order categories.'
        this.isLoading = false
      }
    })
  }

  toggleSection(section: 'pending' | 'failed' | 'completed') {
    this.sectionExpanded[section] = !this.sectionExpanded[section]
  }

  onPhotoSelected(event: Event, orderId: number) {
    const input = event.target as HTMLInputElement
    if (!input.files || !input.files.length) {
      return
    }

    const file = input.files[0]
    const reader = new FileReader()
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : ''
      this.updateDrafts[orderId].photo = value
    }
    reader.readAsDataURL(file)
  }

  submitUpdate(orderId: number) {
    const draft = this.updateDrafts[orderId]
    if (!draft) {
      return
    }

    this.pageMessage = ''
    this.pageError = ''

    this.adminOrderService.updateOrderStatus(orderId, {
      status: draft.status,
      note: draft.note?.trim() || undefined,
      photo: draft.photo?.trim() || undefined
    }).subscribe({
      next: response => {
        this.pageMessage = `Order ${orderId} updated successfully.`
        this.pendingOrders = this.pendingOrders.filter(order => order.orderId !== orderId)

        const updatedOrder = response?.order
        if (updatedOrder?.status === 'FAILED') {
          this.failedOrders = [updatedOrder, ...this.failedOrders]
        } else if (updatedOrder?.status === 'COMPLETED') {
          this.completedOrders = [updatedOrder, ...this.completedOrders]
        }
      },
      error: err => {
        this.pageError = err?.error?.message || 'Failed to update order.'
      }
    })
  }
}
