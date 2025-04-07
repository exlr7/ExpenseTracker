import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { PageHeaderComponent } from '../page-header/page-header.component';
import { InExTableComponent } from '../in-ex-table/in-ex-table.component';
import { ApiService } from '../api.service';
import { Transaction } from '../maintenance/maintenance.component';
import { MonthNamePipe } from '../month-name.pipe';
import { NumberPipe } from '../number.pipe';

export interface MonthlyTransactions {
  year: number;
  month: number;
  transactions: Transaction[];
}

interface MonthData {
  year: number;
  month: number;
  transactions: Transaction[];
}

@Component({
  selector: 'app-view-data',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatExpansionModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    PageHeaderComponent,
    InExTableComponent,
    MonthNamePipe,
    NumberPipe
  ],
  templateUrl: './view-data.component.html',
  styleUrls: ['./view-data.component.css']
})
export class ViewDataComponent implements OnInit {
  transactions: Transaction[] = [];
  years: number[] = [];
  selectedYear: number = new Date().getFullYear();
  data: MonthData[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    this.loadTransactions();
  }

  onYearChange(event: any) {
    this.selectedYear = event.value;
    this.loadTransactions();
  }

  private loadTransactions() {
    this.apiService.getAllTransactions().subscribe({
      next: (res: Transaction[]) => {
        this.transactions = res.filter(t => 
          new Date(t.date).getFullYear() === this.selectedYear
        );
        this.processTransactions();
      },
      error: (error) => {
        console.error('Error fetching transactions:', error);
      }
    });
  }

  private processTransactions() {
    const monthDataMap = new Map<string, Transaction[]>();
    
    this.transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!monthDataMap.has(key)) {
        monthDataMap.set(key, []);
      }
      monthDataMap.get(key)?.push(transaction);
    });

    this.data = Array.from(monthDataMap.entries()).map(([key, transactions]) => {
      const [year, month] = key.split('-').map(Number);
      return { year, month, transactions };
    }).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }

  getEarnings(year: number, month: number) {
    const list = this.transactions.filter(t => t.type === 'CREDIT');
    if (list.length === 0) return 0;

    const earningsList = list.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    });

    return earningsList.reduce((sum, t) => sum + t.amount, 0);
  }

  getExpenditure(year: number, month: number) {
    const list = this.transactions.filter(t => t.type === 'DEBIT');
    if (list.length === 0) return 0;

    const exList = list.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    });

    return exList.reduce((sum, t) => sum + t.amount, 0);
  }

  getSavings(year: number, month: number): number {
    return (
      this.getEarnings(year, month) -
      this.getExpenditure(year, month) +
      this.getPreviousSavings(year, month)
    );
  }

  getPreviousSavings(year: number, month: number): number {
    const minYear = Math.min(...this.years);
    const minMonth = Math.min(
      ...this.transactions
        .filter(t => new Date(t.date).getFullYear() === minYear)
        .map(t => new Date(t.date).getMonth() + 1)
    );

    if (year === minYear && month === minMonth) return 0;

    let savings = 0;
    for (let y = minYear; y <= year; y++) {
      const startMonth = y === minYear ? minMonth : 1;
      const endMonth = y === year ? month - 1 : 12;
      
      for (let m = startMonth; m <= endMonth; m++) {
        savings += this.getEarnings(y, m) - this.getExpenditure(y, m);
      }
    }

    return savings;
  }

  getPreviousYearMonth(
    year: number,
    month: number
  ): { year: number; month: number } {
    if (month > 0) return { year: year, month: --month };
    return { year: --year, month: 11 };
  }

  hasIncome(transactions: Transaction[]): boolean {
    return transactions.filter((t) => t.type == 'CREDIT').length > 0;
  }

  hasExpense(transactions: Transaction[]): boolean {
    return transactions.filter((t) => t.type == 'DEBIT').length > 0;
  }
}
