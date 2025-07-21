import { Component, ViewChild, Injector, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CustomerServiceProxy, EditCustomerInput, GetCustomerForEditOutput, UserServiceProxy, GetUsersInput, UserListDto } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';
import { DateTime } from 'luxon';

@Component({
  selector: 'edit-customer-modal',
  templateUrl: './edit-customer-modal.component.html',
  styleUrls: ['./create-customer-modal.component.css']
})
export class EditCustomerModalComponent extends AppComponentBase {
  @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('modal', { static: false }) modal: ModalDirective;
  @ViewChild('nameInput', { static: false }) nameInput: ElementRef;
    @ViewChild('dropdownWrapper', { static: false }) dropdownWrapper!: ElementRef;
     @ViewChild('modalWrapper', { static: false }) modalWrapper!: ElementRef;

  active = false;
  saving = false;

  customer: EditCustomerInput = new EditCustomerInput();
  users: UserListDto[] = [];
  selectedUsers: UserListDto[] = [];
  selectedUserId: string | number | null = null;

  constructor(
    injector: Injector,
    private _customerService: CustomerServiceProxy,
    private _userService: UserServiceProxy
  ) {
    super(injector);
  }
registrationDateString: string = ''; 

formatDateToInput(date: string | Date): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0]; 
}

onDateChange(dateStr: string): void {
  this.customer.registrationDate = DateTime.fromISO(dateStr);
}


  show(customerId: number): void {
    this._customerService.getCustomerForEdit(customerId).subscribe((result: GetCustomerForEditOutput) => {
      this.customer = new EditCustomerInput();
      this.customer.id = result.id;
      this.customer.name = result.name || '';
      this.customer.email = result.email || '';
      this.customer.address = result.address || '';
    //  this.customer.registrationDate = result.registrationDate;
     const registrationDate = result.registrationDate as DateTime;
    this.customer.registrationDate = registrationDate;
    this.registrationDateString = registrationDate.toFormat('yyyy-MM-dd'); 



      this.customer.userIds = (result.userIds || []).slice();

      console.log('Fetched customer.userIds:', this.customer.userIds);

      this.selectedUsers = [];
      this.selectedUserId = null;
      this.getUsers(async () => {
        console.log('Loaded users:', this.users);
        if (this.customer.userIds && this.customer.userIds.length > 0) {
          
          const customerUserIds = this.customer.userIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
          
          const loadedUserIds = this.users.map(u => typeof u.id === 'string' ? parseInt(u.id, 10) : u.id);
          const missingUserIds = customerUserIds.filter(id => !loadedUserIds.includes(id));
          if (missingUserIds.length > 0) {
           
            for (const userId of missingUserIds) {
              try {
                const user = await this._userService.getUserForEdit(userId).toPromise();
                if (user && user.user) {
                 
                  const userEdit = user.user;
                  const userListDto: UserListDto = {
                    id: userEdit.id,
                    name: userEdit.name,
                    surname: userEdit.surname,
                    userName: userEdit.userName,
                    emailAddress: userEdit.emailAddress,
                    phoneNumber: userEdit.phoneNumber,
                   
                    profilePictureId: null,
                    isEmailConfirmed: false,
                    roles: [],
                    creationTime: null
                  } as UserListDto;
                  this.users.push(userListDto);
                }
              } catch (e) {
                console.warn('Could not load user with id', userId, e);
              }
            }
          }
        
          this.selectedUsers = this.users.filter(u => customerUserIds.includes(typeof u.id === 'string' ? parseInt(u.id, 10) : u.id));
          console.log('Selected users after filtering:', this.selectedUsers);
        } else {
          this.selectedUsers = [];
        }
      });
      this.active = true;
      this.modal.show();
    });
  }

  getUsers(callback?: () => void): void {
    const input = new GetUsersInput();
    input.filter = '';
    input.maxResultCount = 1000;
    input.skipCount = 0;
    this._userService.getAbpUsers(input).subscribe(result => {
      this.users = result.items || [];
      if (callback) callback();
    }, err => {
      this.users = [];
      if (callback) callback();
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

  // removeUser(user: UserListDto): void {
  //   const index = this.selectedUsers.findIndex(u => u.id === user.id);
  //   if (index > -1) {
  //     this.selectedUsers.splice(index, 1);
  //   }
  // }

  getRemainingUsers(): UserListDto[] {
    return this.users.filter(user => !this.selectedUsers.find(su => su.id === user.id));
  }

  onShown(): void {
    if (this.nameInput) {
      this.nameInput.nativeElement.focus();
    }
  }

  save(): void {
    this.saving = true;
    if (!this.customer.name || !this.customer.email) {
      this.notify.error('Please fill in all required fields');
      this.saving = false;
      return;
    }
    this.customer.userIds = this.selectedUsers.map(user => user.id);
    this._customerService.editCustomer(this.customer)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe(() => {
        this.notify.info(this.l('SavedSuccessfully'));
        this.close();
        this.modalSave.emit(null);
      });
  }

  close(): void {
    this.active = false;
    this.modal.hide();
  }


  // -------------------------- Dropdown select code for users checekboxes -------------------------------------------

  dropdownOpen: boolean = false;
  editingCustomer: any;


  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleUserSelection(user: any, isChecked: boolean): void {
    if (isChecked) {
      if (!this.selectedUsers.find(u => u.id === user.id)) {
        this.selectedUsers.push(user);
      }
    } else {
      this.selectedUsers = this.selectedUsers.filter(u => u.id !== user.id);
    }
  }

  isUserSelected(userId: number): boolean {
    return this.selectedUsers.some(u => u.id === userId);
  }

  removeUser(user: any): void {
    this.selectedUsers = this.selectedUsers.filter(u => u.id !== user.id);

    setTimeout(() => {
      this.dropdownOpen = true;
    });
  }

  loadCustomerForEdit(customer: any): void {
    this.editingCustomer = customer;
    this.selectedUsers = this.users.filter(u =>
      customer.assignedUserIds.includes(u.id)
    );
  }

    @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (this.dropdownWrapper && !this.dropdownWrapper.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
    }
  }
   
}