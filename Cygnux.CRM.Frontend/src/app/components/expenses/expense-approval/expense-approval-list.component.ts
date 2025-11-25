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
    this.getExpenses(this.dateRange);
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

// toggleSelectAll() {
//   if (this.selectAll) {
//     this.selectedIds.clear();    // no need to store thousands of IDs
//     this.selectAll = true;
//   } else {
//     this.selectedIds.clear();
//     this.selectAll = false;
//   }
//   this.expenses.forEach(x => x.isSelected = this.selectAll);
//     this.selectedAny = this.expenses.some(x => x.isSelected);

// }

toggleSelectAll() {
  this.selectedIds.clear();

  if (this.selectAll) {
    // Apply check ONLY to allowed rows
    this.expenses.forEach(x => {
      if (!x.isManager_AuditApproved && x.createdBy !== this.identifyService.getLoggedUserId()) {
        x.isSelected = true;
      } else {
        x.isSelected = false; // keep disabled rows unchecked
      }
    });
  } else {
    // Uncheck all rows
    this.expenses.forEach(x => x.isSelected = false);
  }

  this.selectedAny = this.expenses.some(x => x.isSelected);
}




onRowSelect(row: any) {
  if (row.isSelected) {
    // ADD selected row
    this.selectedIds.add({
      attendeeCode: row.attendeeCode,
      expenseId: row.expenseCode,
      meetingId: row.meetingId,
    });
  } else {
    // REMOVE only this row's ID
    [...this.selectedIds].forEach(item => {
      if (item.expenseId === row.expenseId) {
        this.selectedIds.delete(item);
      }
    });
    this.selectAll = false;
  }
    this.selectedAny = this.expenses.some(x => x.isSelected);
}


openReasonSwal(type:string) {
  const modalElement = document.getElementById('Remarkmodal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
      this.permissionType=type
    }
}

getSelectedJSON(isApproved: boolean = false) {
  const result: any = {
    approvedBy: this.identifyService.getLoggedUserId(),
    isApproved: isApproved,
    reasonRemark: this.reasonRemark,
  };

  if (this.selectAll) {
    result.isSelectAll = true;
    result.filterJson = JSON.stringify({
    page: 1,
    pageSize: this.totalItems
  });

    result.startDate = this.dateRange?.[0]
      ? this.dateRange[0].toLocaleDateString("en-GB")
      : null;

    result.endDate = this.dateRange?.[1]
      ? this.dateRange[1].toLocaleDateString("en-GB")
      : null;

    result.jsonData = null;
  } 
  else {
    result.isSelectAll = false;
    result.jsonData =

[...this.selectedIds];
    
    
   ;
     result.startDate=null
     result.endDate=null
     result.filterJson=null
  }

  console.log("FINAL JSON", result);

this.expenseService.multipleExpenseApproval(result).subscribe({
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
getExpenses(event?: any, page: number = 1) {
this.commonService.updateLoader(true);
  this.filters = Object.fromEntries(
    Object.entries(this.filters).filter(([key, value]) => value !== null)
  );
   const filters: any = {
      ...this.filters,
      userId:this.identifyService.getLoggedUserId(),
      Page: page,
      PageSize: this.pageSize,
       startDate: event?.[0] ? event[0].toLocaleDateString("en-GB") : this.dateRange?.[0]?.toLocaleDateString("en-GB") || null,
      endDate: event?.[1] ? event[1].toLocaleDateString("en-GB") : this.dateRange?.[1]?.toLocaleDateString("en-GB") || null,
      ...(this.selectedUser ? { FilterUserId: this.selectedUser } : {})
    };

  this.expenseService.getExpenseApprovalList(filters).subscribe({
    next: (response) => {

      this.totalItems = response.totalCount;
      this.expenses = response.data.map(item => {

        let isSelected = false;
        if (this.selectAll) {
          isSelected = true;
        }
        else if (this.selectedIds.has(item.expenseCode)) {
          isSelected = true;
        }
        return {
          ...item,
          isSelected
        };
      });
      this.commonService.updateLoader(false);
    }
  });
}

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
