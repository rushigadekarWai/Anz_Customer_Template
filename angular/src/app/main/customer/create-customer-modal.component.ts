import { Component, ViewChild, Injector, ElementRef, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CustomerServiceProxy, CreateCustomerInput, UserServiceProxy, GetUsersInput, UserListDto } from '@shared/service-proxies/service-proxies';
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
    users: UserListDto[] = [];
    selectedUsers: UserListDto[] = [];
    selectedUserId: string | number | null = null;

    active: boolean = false;
    saving: boolean = false;

    constructor(
        injector: Injector,
        private _customerService: CustomerServiceProxy,
        private _userService: UserServiceProxy
    ) {
        super(injector);
    }

    show(): void {
        this.active = true;
        this.customer = new CreateCustomerInput();
        this.customer.userIds = []; // Initialize userIds array
        this.selectedUsers = [];
        this.selectedUserId = null;
        this.getUsers();
        this.modal.show();
    }

    getUsers(): void {
        const input = new GetUsersInput();
        input.filter = '';
        input.maxResultCount = 1000;
        input.skipCount = 0;
        

        // this._userService.getUsers(input).subscribe( (result)=>{
        //     this.users = result.items || [];

        // }, (err)=>{
        //     this.users=[];
        // })
        this._userService.getAbpUsers(input).subscribe( (result) => {
        this.users = result.items || [];
    }, (err) => {
        this.users = [];
    });
    }

    addUser(): void {
        if (this.selectedUserId) {
            const userId = typeof this.selectedUserId === 'string' ? parseInt(this.selectedUserId) : this.selectedUserId;
            const userToAdd = this.users.find(u => u.id === userId);
            
            if (userToAdd && !this.selectedUsers.find(u => u.id === userToAdd.id)) {
                this.selectedUsers.push(userToAdd);
                this.selectedUserId = null;
            }
        }
    }

    removeUser(user: UserListDto): void {
        const index = this.selectedUsers.findIndex(u => u.id === user.id);
        if (index > -1) {
            this.selectedUsers.splice(index, 1);
        }
    }

    getAvailableUsers(): UserListDto[] {
        return this.users.filter(user => !this.selectedUsers.find(su => su.id === user.id));
    }

    onShown(): void {
        this.nameInput.nativeElement.focus();
    }

    save(): void {
        this.saving = true;
        
        if (!this.customer.name || !this.customer.email) {
            this.notify.error('Please fill in all required fields');
            this.saving = false;
            return;
        }

        this.customer.userIds = this.selectedUsers.map(user => user.id);

        this._customerService.createCustomer(this.customer)
            .pipe(finalize(() => this.saving = false))
            .subscribe(
                (result) => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(result);
                },
                (error) => {
                    this.notify.error('Failed to create customer. Please try again.');
                }
            );
    }

    close(): void {
        this.modal.hide();
        this.active = false;
    }
}
