import { Component, Injector, OnInit, HostListener } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { CustomerServiceProxy, CustomerListDto, ListResultDtoOfCustomerListDto } from '@shared/service-proxies/service-proxies';

@Component({
    templateUrl: './customer.component.html',
    styleUrls: ['./customer.component.css'],
    animations: [appModuleAnimation()]
})
export class CustomerComponent extends AppComponentBase implements OnInit {

    customers: CustomerListDto[] = [];
    filter: string = '';
    isDropdownOpen: number | null = null;

    constructor(
        injector: Injector,
        private _customerService: CustomerServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.getCustomers();
    }

    getCustomers(): void {
        this._customerService.getCustomers(this.filter).subscribe((result: ListResultDtoOfCustomerListDto) => {
            this.customers = result?.items;
        });
    }

    createCustomer(): void {
        // Implement create customer logic
        console.log('Create new customer');
        this.message.info('Create Customer functionality - Navigate to create form');
        // You can navigate to create customer page
        // this.router.navigate(['/app/customer/create']);
    }

    viewCustomer(customer: CustomerListDto): void {
        // Implement view customer logic
        console.log('View customer:', customer);
        this.message.info('View customer: ' + customer.name);
    }

    editCustomer(customer: CustomerListDto): void {
        // Implement edit customer logic
        console.log('Edit customer:', customer);
        this.message.info('Edit customer: ' + customer.name);
    }

    deleteCustomer(customer: CustomerListDto): void {
        // Implement delete customer logic
        console.log('Delete customer:', customer);
        this.message.confirm(
            'Are you sure you want to delete customer: ' + customer.name + '?',
            'Confirm Delete',
            (isConfirmed) => {
                if (isConfirmed) {
                    this.message.success('Customer deleted successfully');
                    // Add actual delete API call here
                    // this._customerService.deleteCustomer(customer.id).subscribe(() => {
                    //     this.getCustomers();
                    // });
                }
            }
        );
    }

    toggleDropdown(event: Event): void {
        event.stopPropagation();
        const target = event.target as HTMLElement;
        const button = target.closest('button');
        const customerIndex = parseInt(button?.getAttribute('data-customer-index') || '0');
        
        this.isDropdownOpen = this.isDropdownOpen === customerIndex ? null : customerIndex;
    }

    closeDropdown(): void {
        this.isDropdownOpen = null;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event): void {
        const target = event.target as HTMLElement;
        if (!target.closest('.dropdown')) {
            this.closeDropdown();
        }
    }
}
