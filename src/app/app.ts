import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

interface CollectionRow {
  accountNumber: string;
  customerName: string;
  branch: string;
  collectionDate: Date;
  amount: number;
  status: 'Collected' | 'Partial' | 'Pending' | 'Overdue';
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, DatePickerModule, SelectModule, TableModule, TagModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly branches = [
    { label: 'All Branches', value: '' },
    { label: 'Dhaka Main Branch', value: 'Dhaka Main Branch' },
    { label: 'Chattogram Branch', value: 'Chattogram Branch' },
    { label: 'Sylhet Branch', value: 'Sylhet Branch' },
  ];
  protected readonly statuses = [
    { label: 'All Statuses', value: '' },
    { label: 'Collected', value: 'Collected' },
    { label: 'Partial', value: 'Partial' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Overdue', value: 'Overdue' },
  ];
  protected readonly criteria = new FormGroup({
    fromDate: new FormControl<Date | null>(new Date(2025, 2, 1), Validators.required),
    toDate: new FormControl<Date | null>(new Date(2025, 2, 31), Validators.required),
    branch: new FormControl(''),
    status: new FormControl(''),
  });
  protected readonly isRunning = signal(false);
  protected readonly lastGeneratedAt = signal(new Date(2025, 2, 31, 10, 42));
  private readonly allRows = signal<CollectionRow[]>(this.seedRows());
  protected readonly rows = computed(() => this.allRows());

  protected runReport(): void {
    if (this.criteria.invalid) { this.criteria.markAllAsTouched(); return; }
    const { fromDate, toDate, branch, status } = this.criteria.getRawValue();
    if (fromDate && toDate && fromDate > toDate) {
      this.criteria.controls.toDate.setErrors({ dateRange: true });
      return;
    }
    this.isRunning.set(true);
    this.allRows.set(this.seedRows().filter(row =>
      (!fromDate || row.collectionDate >= fromDate) &&
      (!toDate || row.collectionDate <= toDate) &&
      (!branch || row.branch === branch) &&
      (!status || row.status === status)));
    this.lastGeneratedAt.set(new Date());
    this.isRunning.set(false);
  }

  protected reset(): void {
    this.criteria.reset({ fromDate: new Date(2025, 2, 1), toDate: new Date(2025, 2, 31), branch: '', status: '' });
    this.allRows.set(this.seedRows());
  }

  protected statusSeverity(status: CollectionRow['status']): 'success' | 'info' | 'warn' | 'danger' {
    return { Collected: 'success', Partial: 'info', Pending: 'warn', Overdue: 'danger' }[status] as 'success' | 'info' | 'warn' | 'danger';
  }

  private seedRows(): CollectionRow[] {
    return [
      { accountNumber: '0101203000456', customerName: 'Md. Kamrul Hasan', branch: 'Dhaka Main Branch', collectionDate: new Date(2025, 2, 31), amount: 125000, status: 'Collected' },
      { accountNumber: '0132506001123', customerName: 'Sharmin Akter', branch: 'Chattogram Branch', collectionDate: new Date(2025, 2, 31), amount: 75500, status: 'Collected' },
      { accountNumber: '0173209000789', customerName: 'Al Amin Chowdhury', branch: 'Sylhet Branch', collectionDate: new Date(2025, 2, 30), amount: 210000, status: 'Collected' },
      { accountNumber: '0114608002234', customerName: 'Nusrat Jahan', branch: 'Rajshahi Branch', collectionDate: new Date(2025, 2, 29), amount: 50000, status: 'Partial' },
      { accountNumber: '0127804005567', customerName: 'Tanvir Ahmed', branch: 'Khulna Branch', collectionDate: new Date(2025, 2, 29), amount: 320000, status: 'Collected' },
      { accountNumber: '0159307008899', customerName: 'Farhana Islam', branch: 'Barishal Branch', collectionDate: new Date(2025, 2, 28), amount: 98750, status: 'Collected' },
      { accountNumber: '0191503006677', customerName: 'Md. Saiful Alam', branch: 'Bogura Branch', collectionDate: new Date(2025, 2, 28), amount: 65000, status: 'Pending' },
      { accountNumber: '0146205003344', customerName: 'Sadia Rahman', branch: 'Rangpur Branch', collectionDate: new Date(2025, 2, 27), amount: 180000, status: 'Collected' },
      { accountNumber: '0187702009901', customerName: 'Mizanur Rahman', branch: 'Mymensingh Branch', collectionDate: new Date(2025, 2, 27), amount: 45600, status: 'Overdue' },
      { accountNumber: '0163108004455', customerName: 'Rezaul Karim', branch: 'Comilla Branch', collectionDate: new Date(2025, 2, 26), amount: 300000, status: 'Collected' },
    ];
  }
}
