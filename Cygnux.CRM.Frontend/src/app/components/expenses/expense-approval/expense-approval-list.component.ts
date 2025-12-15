import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Modal } from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';
import {
  ExpenseDetailResponse,
  ExpenseResponse,
} from '../../../shared/models/expense.model';
import { CommonService } from '../../../shared/services/common.service';
import { ExpenseService } from '../../../shared/services/expense.service';
import { ExportService } from '../../../shared/services/export.service';
import { ConfirmationService } from '../../../shared/services/confirmation.service';
import { IdentityService } from '../../../shared/services/identity.service';
import { defineElement } from 'lord-icon-element';
import lottie from 'lottie-web';
import { CustomerService } from '../../../shared/services/customer.service';

@Component({
  selector: 'app-expense-approval',
  standalone: false,
  templateUrl: './expense-approval-list.component.html',
  styleUrls: ['./expense-approval-list.component.scss'],
})
export class ExpenseApprovalListComponent implements OnInit {
  public expenseId: string | null = null;
  public expenses: ExpenseResponse[] = [];
  public selectedExpense: ExpenseDetailResponse | null = null;
  public selectedCall: string | null = null;
  public selectAll: boolean = false;
  public isAddExpenseApprovedLoad:boolean=false;

  page = 1; // Current page number
  pageSize = 5; // Number of items per page
  totalItems = 0; // Total number of items
  filters: { [key: string]: string } = {}; // Dynamic filter object
   cardList:string = 'Expenses';
  public reasonRemark:string = '';
   public selectedUser:any;
   public loading:boolean=false;
   public selectedIds: Set<any> = new Set(); 
   public permissionType:string='';
   public remark:string='';
   pageSizeList = [
   { label: 5, value: 5 },
  { label: 10, value: 10 },
  { label: 15, value: 15 },
  { label: 20, value: 20 },
  { label: 30, value: 30},
  { label: 50, value: 50 },
];

   selectedAny: boolean = false;
  dateRange: [Date, Date] = [new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999)];
  @Output() edit = new EventEmitter<ExpenseResponse>();
   public isExportLoading = false;

  constructor(
    private expenseService: ExpenseService,
    public commonService: CommonService,
    private toasterService: ToastrService,
    private exportService: ExportService,
    private confirmationService: ConfirmationService,
    public identifyService :IdentityService,
    public customerService:CustomerService
  ) {defineElement(lottie.loadAnimation);}

  ngOnInit(): void {
    this.commonService.loading.subscribe((state: boolean) => {
      this.loading = state;
    });
    // this.getExpenses(this.dateRange);
    this.customerService.getUsers();
  }

  async onStatusChange(expenseID: string, status: number) {
    let approvedstatus = status === 1 ? 'Approved' : 'Rejected';
    const confirmed = await this.confirmationService.confirm(
      'Are you sure you want to ' + approvedstatus + ' this expense?'
    );
    if (confirmed) {
      const data = {
        expenseId: expenseID,
        approvalStatus: status,
        status: approvedstatus,
      };
      this.addExpenseApproval(data);
    }
  }

     timeoutRef: any;
  onStartTimeChange() {
    clearTimeout(this.timeoutRef); // 🔑 cancel previous timeout
    this.timeoutRef = setTimeout(() => {
      this.getExpenses();
    }, 500);
  }

toggleSelectAll() {
  this.expenses.forEach(expense => {
    const isDisabled =
      expense.isManager_AuditApproved ||
      expense.createdBy === this.identifyService.getLoggedUserId() ||
      expense.isEdit === 'Y';

    if (!isDisabled) {
      expense.isSelected = this.selectAll;
    }
  });

  this.updateSelectedAny();
}
updateSelectedAny() {
  this.selectedAny = this.expenses.some(e => e.isSelected);
}

onRowSelect(expense: any) {
  if (expense.isSelected) {
    this.selectedIds.add(expense.expenseCode);
  } else {
    this.selectedIds.delete(expense.expenseCode);
  }

  this.updateSelectedAny();
   if (!expense.isSelected) {
    this.selectAll = false;
    return;
  }

  // Check if all selectable rows are selected
  const allChecked = this.expenses.every((x: any) =>
    x.isSelected ||
    x.isManager_AuditApproved ||
    x.createdBy === this.identifyService.getLoggedUserId() ||
    x.isEdit === 'Y'
  );

  this.selectAll = allChecked;
}

openReasonSwal(type:string) {
  const modalElement = document.getElementById('Remarkmodal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
      this.permissionType=type
    }
}


getSelectedJSON(isApproved: boolean = false){
 const selectedRows = this.expenses
    .filter(x => x.isSelected)
    .map(x => ({
      attendeeCode: x.attendeeCode,
      expenseId: x.expenseCode,
      meetingId: x.meetingId
    }));

  const payload = {
    approvedBy: this.identifyService.getLoggedUserId(),
    isApproved: isApproved,
    reasonRemark: this.reasonRemark,
    isSelectAll: false,
    jsonData: selectedRows,
    startDate: null,
    endDate:  null,
    filterJson:null
  };
 this.expenseService.multipleExpenseApproval(payload).subscribe({
  next: (response: any) => {
    if (response?.success) {
      this.toasterService.success(response.data.message);
      this.selectAll = false;
      this.selectedAny = false;
      this.selectedIds = new Set();
      this.getExpenses(this.dateRange);
      this.onCancel();
    } else {
      this.toasterService.error(response?.error?.message || 'Something went wrong');
    }
  },

  error: (err) => {
    this.toasterService.error(err?.error?.message || 'Server error');
  },

  complete: () => {
    this.commonService.updateLoader(false);
  }
});
}

  addExpenseApproval(dataToSubmit: any): void {
    this.commonService.updateLoader(true);
    this.expenseService.addExpenseApproval(dataToSubmit).subscribe({
      next: (response) => {
        if (response.success) {
          this.toasterService.success(response.data.message);
          this.getExpenses();
        } else {
          this.toasterService.error(response.error.message);
        }

        this.commonService.updateLoader(false);
      },
      error: (response: any) => {
        this.toasterService.error(response.error.message);
        this.commonService.updateLoader(false);
      },
    });
  }

  getExpenses(event?: any,page: number = 1) {
  this.selectAll = false;
  this.expenses = [];
  this.expenses?.forEach((x: any) => (x.isSelected = false));
    this.commonService.updateLoader(true);
    this.filters = Object.fromEntries(
      Object.entries(this.filters).filter(([key, value]) => value !== null)
    );
    const filters: any = {
      ...this.filters,
      userId:this.identifyService.getLoggedUserId(),
      Page: page,
      PageSize: this.pageSize?this.pageSize:5,
      startDate: event?.[0] ? event[0].toLocaleDateString("en-GB") : this.dateRange?.[0]?.toLocaleDateString("en-GB") || null,
      endDate: event?.[1] ? event[1].toLocaleDateString("en-GB") : this.dateRange?.[1]?.toLocaleDateString("en-GB") || null,
      ExpenseDate: this.filters['ExpenseDate'] ? this.commonService.formatDate(new Date(this.filters['ExpenseDate'])) : '',
      MeetingDate: this.filters['MeetingDate'] ? this.commonService.formatDate(new Date(this.filters['MeetingDate'])) : '',
      ...(this.selectedUser ? { FilterUserId: this.selectedUser } : {})
    };
    this.expenseService.getExpenseApprovalList(filters).subscribe({
      next: (response) => {
        if (response) {
          this.expenses = response.data;
          this.totalItems = response.totalCount;
        }
        this.commonService.updateLoader(false);
      },
      error: (response: any) => {
        this.toasterService.error(response);
        this.commonService.updateLoader(false);
      },
    });
  }

  checkIfAllSelected() {
  // Check if all items are selected
  this.selectAll = this.expenses.every((x: any) => x.isSelected === true);
}


// getExpenses(event?: any, page: number = 1) {

//   this.commonService.updateLoader(true);

//   const filters: any = {
//     ...this.filters,
//     userId: this.identifyService.getLoggedUserId(),
//     Page: page,
//     PageSize: this.pageSize,
//     startDate: event?.[0]
//       ? event[0].toLocaleDateString("en-GB")
//       : this.dateRange?.[0]?.toLocaleDateString("en-GB") || null,
//     endDate: event?.[1]
//       ? event[1].toLocaleDateString("en-GB")
//       : this.dateRange?.[1]?.toLocaleDateString("en-GB") || null,
//     ...(this.selectedUser ? { FilterUserId: this.selectedUser } : {})
//   };

//   this.expenseService.getExpenseApprovalList(filters).subscribe({
//     next: (response) => {
//       this.totalItems = response.totalCount;

//       this.expenses = response.data.map(item => {

//         const isDisabled =
//           item.isManager_AuditApproved ||
//           item.createdBy === this.identifyService.getLoggedUserId() ||
//           item.isEdit === 'Y';

//         return {
//           ...item,
//           isSelected:
//             this.selectAll && !isDisabled  // ONLY select if NOT disabled
//               ? true
//               : this.selectedIds.has(item.expenseCode)
//         };
//       });

//       this.commonService.updateLoader(false);
//     }
//   });
// }


  clearDate() {
    this.filters['ExpenseDate'] = '';
    this.getExpenses();
  } 
  clearmeetingDate(){
    this.filters['MeetingDate'] = '';
    this.getExpenses();
  }

  exportExpenses(event: any) {
    event.preventDefault();
    const filters: any = {
      ...this.filters,
      UserId:this.identifyService.getLoggedUserId(),
      export:false,
       startDate: event?.[0] ? event[0].toLocaleDateString("en-GB") : this.dateRange?.[0]?.toLocaleDateString("en-GB") || null,
      endDate: event?.[1] ? event[1].toLocaleDateString("en-GB") : this.dateRange?.[1]?.toLocaleDateString("en-GB") || null,
      ...(this.selectedUser ? { FilterUserId: this.selectedUser } : {})
    }
    this.isExportLoading = true;
    this.expenseService.exportExpense(filters).subscribe({
      next: (response) => {
        if (response) {
          this.exportService.exportToExcel(response.data);
        }
        this.isExportLoading = false;
      },
      error: (response: any) => {
        this.toasterService.error(response);
        this.isExportLoading = false;
      },
    });
  }

  exportCSVExpenses(event: any) {
    event.preventDefault();
    this.commonService.updateLoader(true);
    const filters: any = {
      UserId:this.identifyService.getLoggedUserId(),
       startDate: event?.[0] ? event[0].toLocaleDateString("en-GB") : this.dateRange?.[0]?.toLocaleDateString("en-GB") || null,
      endDate: event?.[1] ? event[1].toLocaleDateString("en-GB") : this.dateRange?.[1]?.toLocaleDateString("en-GB") || null,
      export:false
    }
    this.expenseService.exportExpense(filters).subscribe({
      next: (response) => {
        if (response) {
          this.exportService.exportToCSV(response.data);
        }
        this.commonService.updateLoader(false);
      },
      error: (response: any) => {
        this.toasterService.error(response);
        this.commonService.updateLoader(false);
      },
    });
  }
  onPageChange(page: number) {
    this.page = page;
    this.getExpenses(this.dateRange,this.page);
  }
  getExpense(data: any) {
    this.commonService.updateLoader(true);
    const filter={
      id:data.expenseCode,
      userId:this.identifyService.getLoggedUserId(),
    }
    this.expenseService.getExpenseDetails(filter.id,filter.userId).subscribe({
      next: (response) => {
        if (response) {
          this.selectedExpense = response.data;
          this.selectedExpense.supportingDocument =
            environment.apiUrl.replace('/api/v1', '') +
            this.selectedExpense.supportingDocument.replace(/\\/g, '/');
          this.edit.emit(response.data);
        }
        this.commonService.updateLoader(false);
      },
      error: (response: any) => {
        this.toasterService.error(response);
        this.commonService.updateLoader(false);
      },
    });
  }

  viewModal(event: Event, expense: any) {
    event.preventDefault(); // Prevent default anchor behavior
    const modalElement = document.getElementById('showModalDetail');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
      this.getExpense(expense)
    }
  }

  approveModal(event: Event, expense: any){
    event.preventDefault(); // Prevent default anchor behavior
    const modalElement = document.getElementById('showApproveExpense');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
      this.isAddExpenseApprovedLoad=true
      this.getExpense(expense);
    }
  }

  closeEditModal() {
    const modalElement: any = document.getElementById('showApproveExpense');
    const modalInstance = Modal.getInstance(modalElement); // Get the modal instance
    if (modalInstance) {
      modalInstance.hide(); // Hide the modal
      document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
        backdrop.remove();
      });
      this.getExpenses(this.dateRange);
    }
  }

  onSubmit(){
    if(this.permissionType === 'Approve'){
      this.getSelectedJSON(true);
    }else if(this.permissionType === 'Reject'){
      this.getSelectedJSON(false)
    }
  }

  onCancel(){
  const modalElement = document.getElementById('Remarkmodal');
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
      this.reasonRemark ='';
     
    }
  }
}
