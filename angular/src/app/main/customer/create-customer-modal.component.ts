import { Component, ViewChild, Injector, ElementRef, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CustomerServiceProxy, CreateCustomerInput } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'createCustomerModal',
    templateUrl: './create-customer-modal.component.html',
    styleUrls: ['./create-customer-modal.component.css']
})
export class CreateCustomerModalComponent extends AppComponentBase {

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('modal', { static: false }) modal: ModalDirective;
    @ViewChild('nameInput', { static: false }) nameInput: ElementRef;

    customer: CreateCustomerInput = new CreateCustomerInput();

    active: boolean = false;
    saving: boolean = false;

    constructor(
        injector: Injector,
        private _customerService: CustomerServiceProxy
    ) {
        super(injector);
    }

    show(): void {
        this.active = true;
        this.customer = new CreateCustomerInput();
        this.modal.show();
    }

    onShown(): void {
        this.nameInput.nativeElement.focus();
    }

    save(): void {
        this.saving = true;
        this._customerService.createCustomer(this.customer)
            .pipe(finalize(() => this.saving = false))
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(this.customer);
            });
    }

    close(): void {
        this.modal.hide();
        this.active = false;
    }
}
