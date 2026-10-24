from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class PessoaDTO:
    nome: str
    data_nasc: date
    cpf: str
    sexo: str
    altura: float
    peso: float
    id: int | None = None


@dataclass(frozen=True)
class BuscaPessoaDTO:
    termo: str = ''
    pagina: int = 1


@dataclass(frozen=True)
class FiltroPessoaDTO:
    nome: str = ''
    cpf: str = ''
    cpf_parcial: bool = False


@dataclass(frozen=True)
class PaginaPessoasDTO:
    resultados: list[PessoaDTO]
    total: int
    pagina: int
    por_pagina: int
    total_paginas: int


@dataclass(frozen=True)
class PesoIdealDTO:
    id: int
    nome: str
    sexo: str
    altura: float
    peso: float
    peso_ideal: float
