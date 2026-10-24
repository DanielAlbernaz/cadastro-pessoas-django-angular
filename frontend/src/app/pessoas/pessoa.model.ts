export type Sexo = 'M' | 'F';

export interface Pessoa {
  id?: number;
  nome: string;
  data_nasc: string;
  cpf: string;
  sexo: Sexo;
  altura: number;
  peso: number;
}

export interface FiltroPessoa {
  busca?: string;
  pagina?: number;
}

export interface PaginaPessoas {
  resultados: Pessoa[];
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

export interface PesoIdeal {
  id: number;
  nome: string;
  sexo: Sexo;
  altura: number;
  peso: number;
  peso_ideal: number;
}
