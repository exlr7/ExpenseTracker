import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Transaction } from '../maintenance/maintenance.component';
import { NumberPipe } from '../number.pipe';

@Component({
  selector: 'app-in-ex-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    NumberPipe
  ],
  templateUrl: './in-ex-table.component.html',
  styleUrls: ['./in-ex-table.component.css']
})
export class InExTableComponent implements OnInit {
  @Input() type: 'CREDIT' | 'DEBIT' | 'ALL' = 'CREDIT';
  @Input() transactions: Transaction[] = [];
  
  dataSource = new MatTableDataSource<Transaction>();
  columns = ['date', 'description', 'amount'];

  ngOnInit(): void {
    this.transactionsToDisplay = this.type === 'ALL' 
      ? this.transactions 
      : this.transactions.filter(t => t.type === this.type);
    this.dataSource.data = this.transactionsToDisplay;
  }

  transactionsToDisplay: Transaction[] = [];
}
