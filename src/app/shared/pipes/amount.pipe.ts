import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'amount',
  standalone: false,
})
export class AmountPipe implements PipeTransform {
  transform(value: number, currency?: string): string {
    if (value === null || value === undefined) return '';
    if(currency){
      return `${currency} ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }else return `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}