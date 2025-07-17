import { Component, Injector, OnInit, HostListener, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { CustomerServiceProxy, CustomerListDto, ListResultDtoOfCustomerListDto } from '@shared/service-proxies/service-proxies';
import { CreateCustomerModalComponent } from './create-customer-modal.component';

@Component({
    templateUrl: './customer.component.html',
    styleUrls: ['./customer.component.css'],
    animations: [appModuleAnimation()]
})
export class CustomerComponent extends AppComponentBase implements OnInit {

    @ViewChild('createCustomerModal', { static: true }) createCustomerModal: CreateCustomerModalComponent;

    customers: CustomerListDto[] = [];
    paginatedCustomers: CustomerListDto[] = [];
    filter: string = '';
    isDropdownOpen: number | null = null;
    
    // Pagination properties
    currentPage: number = 1;
    itemsPerPage: number = 10;
    totalItems: number = 0;
    totalPages: number = 0;
    startItem: number = 0;
    endItem: number = 0;

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
            this.customers = result?.items || [];
            this.totalItems = this.customers.length;
            this.calculatePagination();
            this.updatePaginatedCustomers();
        });
    }

    calculatePagination(): void {
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        if (this.currentPage > this.totalPages) {
            this.currentPage = 1;
        }
    }

    updatePaginatedCustomers(): void {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.paginatedCustomers = this.customers.slice(startIndex, endIndex);
        
        this.startItem = this.totalItems > 0 ? startIndex + 1 : 0;
        this.endItem = Math.min(endIndex, this.totalItems);
    }

    changePage(page: number): void {
        if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
            this.currentPage = page;
            this.updatePaginatedCustomers();
        }
    }

    onItemsPerPageChange(): void {
        this.currentPage = 1;
        this.calculatePagination();
        this.updatePaginatedCustomers();
    }

    getVisiblePages(): number[] {
        const maxVisiblePages = 5;
        const pages: number[] = [];
        
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        
        return pages;
    }

    createCustomer(): void {
        this.createCustomerModal.show();
    }

    customerCreated(): void {
        this.getCustomers();
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
