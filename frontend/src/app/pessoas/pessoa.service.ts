import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { FiltroPessoa, PaginaPessoas, PesoIdeal, Pessoa } from './pessoa.model';

@Injectable({ providedIn: 'root' })
export class PessoaService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/pessoas/';

  pesquisar(filtro: FiltroPessoa): Observable<PaginaPessoas> {
    let params = new HttpParams().set('pagina', filtro.pagina ?? 1);
    if (filtro.busca) params = params.set('busca', filtro.busca);
    return this.http.get<PaginaPessoas>(this.url, { params });
  }

  incluir(pessoa: Pessoa): Observable<Pessoa> {
    return this.http.post<Pessoa>(this.url, pessoa);
  }

  alterar(id: number, pessoa: Pessoa): Observable<Pessoa> {
    return this.http.put<Pessoa>(`${this.url}${id}/`, pessoa);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}${id}/`);
  }

  calcularPesoIdeal(id: number): Observable<PesoIdeal> {
    return this.http.get<PesoIdeal>(`${this.url}${id}/peso-ideal/`);
  }
}
