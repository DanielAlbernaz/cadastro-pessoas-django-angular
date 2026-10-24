import { Component } from '@angular/core';

import { ListagemPessoas } from './pessoas/listagem-pessoas/listagem-pessoas';
import { Toasts } from './shared/toasts/toasts';

@Component({
  selector: 'app-root',
  imports: [ListagemPessoas, Toasts],
  templateUrl: './app.html',
})
export class App {}
