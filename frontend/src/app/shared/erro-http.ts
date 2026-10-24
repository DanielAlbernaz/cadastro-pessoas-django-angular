import { HttpErrorResponse } from '@angular/common/http';

export function mensagemErroHttp(erro: HttpErrorResponse): string {
  if (erro.status === 0) return 'Não foi possível conectar ao servidor.';
  return erro.error?.detail ?? `Erro inesperado (HTTP ${erro.status}).`;
}
