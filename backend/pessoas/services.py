import re

from .dtos import BuscaPessoaDTO, FiltroPessoaDTO, PaginaPessoasDTO, PesoIdealDTO, PessoaDTO
from .exceptions import CpfJaCadastradoError
from .tasks import PessoaTask
from .validators import somente_digitos

POR_PAGINA = 10
PARECE_CPF = re.compile(r'^[\d.\-\s]*\d[\d.\-\s]*$')


class PessoaService:

    def __init__(self, task: PessoaTask | None = None):
        self.task = task or PessoaTask()

    def incluir(self, dto: PessoaDTO) -> PessoaDTO:
        if self.task.cpf_em_uso(dto.cpf):
            raise CpfJaCadastradoError()
        return self.task.incluir(dto)

    def alterar(self, dto: PessoaDTO) -> PessoaDTO:
        if self.task.cpf_em_uso(dto.cpf, ignorar_id=dto.id):
            raise CpfJaCadastradoError()
        return self.task.alterar(dto)

    def excluir(self, pessoa_id: int) -> None:
        self.task.excluir(pessoa_id)

    def pesquisar(self, busca: BuscaPessoaDTO) -> PaginaPessoasDTO:
        filtro = self.interpretar_busca(busca.termo)
        return self.task.pesquisar(filtro, pagina=busca.pagina, por_pagina=POR_PAGINA)

    def obter(self, pessoa_id: int) -> PessoaDTO:
        return self.task.obter(pessoa_id)

    def calcular_peso_ideal(self, pessoa_id: int) -> PesoIdealDTO:
        return self.task.calcular_peso_ideal(pessoa_id)

    @staticmethod
    def interpretar_busca(termo: str) -> FiltroPessoaDTO:
        termo = ' '.join(termo.split())
        if not termo:
            return FiltroPessoaDTO()
        if PARECE_CPF.match(termo):
            cpf = somente_digitos(termo)
            return FiltroPessoaDTO(cpf=cpf, cpf_parcial=len(cpf) < 11)
        return FiltroPessoaDTO(nome=termo)
