import { Routes } from '@angular/router';
import { FullComponent } from './components/layouts/full/full.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { LoginGuard } from './shared/guards/login.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('./components/Identity/login.module').then((m) => m.LoginModule),
    canActivate: [LoginGuard],
  },
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: '',
        redirectTo: '/welcome',
        pathMatch: 'full',
      },
      {
        path: 'welcome',
        loadChildren: () =>
          import('./components/welcome/welcome.modules').then(
            (m) => m.WelcomeModule
          ),
        canActivate: [AuthGuard],
        data: { title: 'DASHBOARD' }
      },
      {
        path: 'customer',
        loadChildren: () =>
          import('./components/customers/customers.module').then(
            (m) => m.CustomerModule
          ),
        canActivate: [AuthGuard],
        data: { title: 'CUSTOMER' }
      },
      {
        path: 'call',
        loadChildren: () =>
          import('./components/calls/calls.module').then((m) => m.CallModule),
        canActivate: [AuthGuard],
        data: { title: 'CALLS' }
      },
      {
        path: 'lead',
        loadChildren: () =>
          import('./components/leads/leads.module').then((m) => m.LeadModule),
        canActivate: [AuthGuard],
         data: { title: 'LEADS' }
      },
      {
        path: 'meeting',
        loadChildren: () =>
          import('./components/meetings/meetings.module').then(
            (m) => m.MeetingModule
          ),
        canActivate: [AuthGuard],
        data: { title: 'MEETINGS' }
      },
      {
        path: 'task',
        loadChildren: () =>
          import('./components/tasks/tasks.module').then((m) => m.TaskModule),
        canActivate: [AuthGuard],
        data: { title: 'TASK' }
      },
      {
        path: 'expense',
        loadChildren: () =>
          import('./components/expenses/expenses.module').then(
            (m) => m.ExpenseModule
          ),
        canActivate: [AuthGuard],
        data: { title: 'EXPENSES' }
      },
      {
        path: 'complaint',
        loadChildren: () =>
          import('./components/complaints/complaints.module').then(
            (m) => m.ComplaintModule
          ),
        canActivate: [AuthGuard],
         data: { title: 'COMPLAINT' }
      },
      {
        path: 'my-calendar',
        loadChildren: () =>
          import('./components/my-calendar/my-calendar.module').then(
            (m) => m.MyCalendarModule
          ),
        canActivate: [AuthGuard],
         data: { title: 'MY CALENDAR' }
      },
      {
        path: 'attendance',
        loadChildren: () =>
          import('./components/attendance/attendance.module').then(
            (m) => m.AttendanceModule
          ),
        canActivate: [AuthGuard],
         data: { title: 'ATTENDANCE' }
      },
    ],
  },
];
