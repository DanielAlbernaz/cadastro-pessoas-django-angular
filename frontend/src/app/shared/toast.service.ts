import { Injectable, signal } from '@angular/core';

export type TipoToast = 'sucesso' | 'erro';

export interface Toast {
  id: number;
  tipo: TipoToast;
  texto: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly duracaoMs = 4500;
  private proximoId = 1;

  readonly toasts = signal<Toast[]>([]);

  sucesso(texto: string): void {
    this.mostrar('sucesso', texto);
  }

  erro(texto: string): void {
    this.mostrar('erro', texto);
  }

  fechar(id: number): void {
    this.toasts.update((lista) => lista.filter((t) => t.id !== id));
  }

  private mostrar(tipo: TipoToast, texto: string): void {
    const id = this.proximoId++;
    this.toasts.update((lista) => [...lista, { id, tipo, texto }]);
    setTimeout(() => this.fechar(id), this.duracaoMs);
  }
}
