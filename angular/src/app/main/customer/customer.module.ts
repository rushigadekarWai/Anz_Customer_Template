import {NgModule} from '@angular/core';
import {AppSharedModule} from '@app/shared/app-shared.module';
import { CustomerComponent } from './customer.component';
import { CustomerRoutingModule } from './customer-routing.module';

@NgModule({
    declarations: [CustomerComponent],
    imports: [AppSharedModule, CustomerRoutingModule]
})

export class CustomerModule{}