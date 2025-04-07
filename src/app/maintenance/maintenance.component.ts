import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PageHeaderComponent } from '../page-header/page-header.component';
import { InExTableComponent } from '../in-ex-table/in-ex-table.component';
import { ApiService } from '../api.service';

export interface Transaction {
  id?: number;
  date: string;
  description: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
}

interface Month {
  index: number;
  name: string;
}

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    PageHeaderComponent,
    InExTableComponent
  ],
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.css']
})
export class MaintenanceComponent implements OnInit {
  transactionForm: FormGroup;
  years: number[] = [];
  months: Month[] = [
    { index: 1, name: 'January' },
    { index: 2, name: 'February' },
    { index: 3, name: 'March' },
    { index: 4, name: 'April' },
    { index: 5, name: 'May' },
    { index: 6, name: 'June' },
    { index: 7, name: 'July' },
    { index: 8, name: 'August' },
    { index: 9, name: 'September' },
    { index: 10, name: 'October' },
    { index: 11, name: 'November' },
    { index: 12, name: 'December' }
  ];
  types: ('CREDIT' | 'DEBIT')[] = ['CREDIT', 'DEBIT'];
  transactions: Transaction[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.transactionForm = this.fb.group({
      year: ['', Validators.required],
      month: ['', Validators.required],
      date: ['', [Validators.required, Validators.min(1), Validators.max(31)]],
      description: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      type: ['', Validators.required]
    });
  }

  ngOnInit() {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    this.loadTransactions();
  }

  loadTransactions() {
    this.apiService.getAllTransactions().subscribe({
      next: (res: Transaction[]) => {
        this.transactions = res;
      },
      error: (error: Error) => {
        console.error('Error fetching transactions:', error);
      }
    });
  }

  onSubmit() {
    if (this.transactionForm.valid) {
      const formValue = this.transactionForm.value;
      const transaction: Transaction = {
        date: `${formValue.year}-${formValue.month.toString().padStart(2, '0')}-${formValue.date.toString().padStart(2, '0')}`,
        description: formValue.description,
        amount: formValue.amount,
        type: formValue.type
      };

      this.apiService.upsertTransaction(transaction).subscribe({
        next: () => {
          this.loadTransactions();
          this.onReset();
        },
        error: (error: Error) => {
          console.error('Error adding transaction:', error);
        }
      });
    }
  }

  onReset() {
    this.transactionForm.reset();
  }
}
