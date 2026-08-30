import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {
  @Input() cardData: {
    title: string;
    subTitle?: string;
    count: number;
    icon: string;
    key?: string;
  } | null = null;

  @Output() cardClick = new EventEmitter<string>();

  onClick() {
    if (this.cardData?.key) {
      this.cardClick.emit(this.cardData.key);
    }
  }
}
