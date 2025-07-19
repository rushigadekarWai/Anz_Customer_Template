import { Component, ViewChild, Input } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'view-customer-modal',
  templateUrl: './view-customer-modal.component.html',
   styleUrls: ['./create-customer-modal.component.css']
})
export class ViewCustomerModalComponent {
  @ViewChild('viewCustomerModal', { static: false }) modal: ModalDirective;
  @Input() viewingCustomer: any;
  @Input() viewingAssignedUsers: any[] = [];

  show(): void {
    this.modal.show();
  }

  close(): void {
    this.modal.hide();
  }
}
