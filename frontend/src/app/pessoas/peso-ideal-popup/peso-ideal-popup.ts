import { DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { PesoIdeal } from '../pessoa.model';

@Component({
  selector: 'app-peso-ideal-popup',
  imports: [DecimalPipe],
  templateUrl: './peso-ideal-popup.html',
  styleUrl: './peso-ideal-popup.css',
})
export class PesoIdealPopup {
  readonly resultado = input.required<PesoIdeal>();

  readonly fechado = output<void>();
}
