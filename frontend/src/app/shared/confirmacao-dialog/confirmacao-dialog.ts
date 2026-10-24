import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirmacao-dialog',
  templateUrl: './confirmacao-dialog.html',
  styleUrl: './confirmacao-dialog.css',
})
export class ConfirmacaoDialog {
  readonly titulo = input.required<string>();
  readonly mensagem = input.required<string>();
  readonly textoConfirmar = input('Confirmar');

  readonly confirmado = output<void>();
  readonly cancelado = output<void>();
}
