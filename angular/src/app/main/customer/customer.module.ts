import {NgModule} from '@angular/core';
import {AppSharedModule} from '@app/shared/app-shared.module';
import { CustomerComponent } from './customer.component';
import { CustomerRoutingModule } from './customer-routing.module';
import { CreateCustomerModalComponent } from './create-customer-modal.component';

@NgModule({
    declarations: [CustomerComponent, CreateCustomerModalComponent],
    imports: [AppSharedModule, CustomerRoutingModule]
})

export class CustomerModule{}