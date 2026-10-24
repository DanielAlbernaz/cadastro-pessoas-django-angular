import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Pessoa } from './pessoa.model';
import { PessoaService } from './pessoa.service';

const PESSOA: Pessoa = {
  nome: 'Maria Souza',
  data_nasc: '1995-03-10',
  cpf: '11144477735',
  sexo: 'F',
  altura: 1.7,
  peso: 60,
};

describe('PessoaService', () => {
  let service: PessoaService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PessoaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('pesquisar envia o termo e a página', () => {
    service.pesquisar({ busca: 'maria', pagina: 2 }).subscribe();

    const req = http.expectOne((r) => r.url === '/api/pessoas/');
    expect(req.request.params.get('busca')).toBe('maria');
    expect(req.request.params.get('pagina')).toBe('2');
    req.flush({ resultados: [], total: 0, pagina: 1, por_pagina: 10, total_paginas: 1 });
  });

  it('incluir faz POST com o JSON da pessoa', () => {
    service.incluir(PESSOA).subscribe();

    const req = http.expectOne('/api/pessoas/');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(PESSOA);
    req.flush({ ...PESSOA, id: 1 });
  });

  it('calcularPesoIdeal consulta o endpoint do cálculo', () => {
    service.calcularPesoIdeal(1).subscribe();

    http.expectOne('/api/pessoas/1/peso-ideal/').flush({ ...PESSOA, id: 1, peso_ideal: 60.87 });
  });
});
