import { forkJoin } from 'rxjs';
import { Component, Injector, OnInit, HostListener, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { CustomerServiceProxy, CustomerListDto, ListResultDtoOfCustomerListDto, UserServiceProxy, GetUserForEditOutput } from '@shared/service-proxies/service-proxies';
import { CreateCustomerModalComponent } from './create-customer-modal.component';
import { EditCustomerModalComponent } from './edit-customer-modal.component';
import { remove as _remove } from 'lodash-es';


@Component({
    templateUrl: './customer.component.html',
    styleUrls: ['./customer.component.css'],
    animations: [appModuleAnimation()]
})
export class CustomerComponent extends AppComponentBase implements OnInit {

    viewingCustomer: any = null;
    viewingAssignedUsers: any[] = [];

    @ViewChild('createCustomerModal', { static: true }) createCustomerModal: CreateCustomerModalComponent;
    @ViewChild('editCustomerModal', { static: true }) editCustomerModal: EditCustomerModalComponent;
    @ViewChild('viewCustomerModal', { static: false }) viewCustomerModal: any;

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
        private _customerService: CustomerServiceProxy,
        private _userService: UserServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.getCustomers();
    }

    getCustomers(): void {
        this._customerService.getCustomers(this.filter).subscribe(
            (result: ListResultDtoOfCustomerListDto) => {
                this.customers = result?.items || [];
                this.totalItems = this.customers.length;
                this.calculatePagination();
                this.updatePaginatedCustomers();
            },
            (error) => {
                console.error('Error loading customers:', error);
                this.notify.error('Failed to load customers');
            }
        );
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
        this._customerService.getCustomerForEdit(customer.id).subscribe(result => {
            this.viewingCustomer = customer;
            const userIds = result.userIds || [];
            if (userIds.length === 0) {
                this.viewingAssignedUsers = [];
                this.viewCustomerModal.show();
                return;
            }
            const userDetailObservables = userIds.map(id => this._userService.getUserForEdit(id));
            forkJoin(userDetailObservables).subscribe((userResults: GetUserForEditOutput[]) => {
                this.viewingAssignedUsers = userResults
                    .map(res => res.user)
                    .filter(u => !!u);
                this.viewCustomerModal.show();
            });
        });
    }

    editCustomer(customer: CustomerListDto): void {
        // Open the edit modal and pass the customer ID
        this.editCustomerModal.show(customer.id);
    }

    deleteCustomer(customer: CustomerListDto): void {

        this.message.confirm(
            this.l('AreYouSureToDeleteTheCustomer', customer.name),
            this.l('AreYouSure'),

             (isConfirmed: boolean) => {
           if (isConfirmed) {

                this._customerService.deleteCustomer(customer.id).subscribe(
                    () => {

                        this.notify.info(this.l('Successfully Deleted'));
                      
                        _remove(this.customers, (c) => c.id === customer.id);

                     
                        this.calculatePagination();
                        this.updatePaginatedCustomers();
                    },
                    (error) => {
                        console.error(' deleting customer:', error);
                            this.notify.error('Failed delete customer');
                        }
                    );
                }
            }
        );
    }
    // isDeleting = false;

// deleteCustomer(customer: CustomerListDto): void {
//     this.message.confirm(
//         this.l('AreYouSureToDeleteTheCustomer', customer.name),
//         this.l('AreYouSure'),
//         (isConfirmed: boolean) => {
//             if (isConfirmed) {
//                 this.isDeleting = true; // Start loader
//                 this._customerService.deleteCustomer(customer.id).subscribe(
//                     () => {
//                         this.notify.info(this.l('SuccessfullyDeleted'));
//                         _remove(this.customers, customer);
//                         this.calculatePagination();
//                         this.updatePaginatedCustomers();
//                     },
//                     (error) => {
//                         console.error('Error deleting customer:', error);
//                         this.notify.error(this.l('FailedToDeleteCustomer'));
//                     },
//                     () => {
//                         this.isDeleting = false; // Stop loader
//                     }
//                 );
//             }
//         }
//     );
// }



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
