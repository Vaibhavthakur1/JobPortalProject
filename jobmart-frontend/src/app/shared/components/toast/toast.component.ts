import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { UISignalStore } from '../../../store/ui.signal';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styles: [],
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '300ms ease-in',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-out',
          style({ opacity: 0, transform: 'translateY(20px)' }),
        ),
      ]),
    ]),
  ],
})
export class ToastComponent {
  constructor(readonly uiStore: UISignalStore) {
    effect(() => {
      if (this.uiStore.toast()) {
        setTimeout(() => {
          if (this.uiStore.toast()) {
            this.uiStore.hideToast();
          }
        }, 3000);
      }
    });
  }
}
