import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  template: `
    <div class="flex flex-col items-center justify-center space-y-2">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      @if (message()) {
        <p class="text-text-secondary">{{ message() }}</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpinnerComponent {
  message = input<string>('');
}
