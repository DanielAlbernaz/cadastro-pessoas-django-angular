from math import ceil

from django.db import IntegrityError, transaction

from .dtos import FiltroPessoaDTO, PaginaPessoasDTO, PesoIdealDTO, PessoaDTO
from .exceptions import CpfJaCadastradoError, PessoaNaoEncontradaError
from .models import Pessoa


class PessoaTask:

    def incluir(self, dto: PessoaDTO) -> PessoaDTO:
        pessoa = Pessoa(
            nome=dto.nome,
            data_nasc=dto.data_nasc,
            cpf=dto.cpf,
            sexo=dto.sexo,
            altura=dto.altura,
            peso=dto.peso,
        )
        self._salvar(pessoa)
        return self._para_dto(pessoa)

    def alterar(self, dto: PessoaDTO) -> PessoaDTO:
        pessoa = self._buscar(dto.id)
        pessoa.nome = dto.nome
        pessoa.data_nasc = dto.data_nasc
        pessoa.cpf = dto.cpf
        pessoa.sexo = dto.sexo
        pessoa.altura = dto.altura
        pessoa.peso = dto.peso
        self._salvar(pessoa)
        return self._para_dto(pessoa)

    def excluir(self, pessoa_id: int) -> None:
        excluidos, _ = Pessoa.objects.filter(pk=pessoa_id).delete()
        if not excluidos:
            raise PessoaNaoEncontradaError(pessoa_id)

    def pesquisar(self, filtro: FiltroPessoaDTO, pagina: int, por_pagina: int) -> PaginaPessoasDTO:
        pessoas = Pessoa.objects.order_by('-id')
        if filtro.nome:
            pessoas = pessoas.filter(nome__icontains=filtro.nome)
        if filtro.cpf:
            if filtro.cpf_parcial:
                pessoas = pessoas.filter(cpf__startswith=filtro.cpf)
            else:
                pessoas = pessoas.filter(cpf=filtro.cpf)

        total = pessoas.count()
        total_paginas = max(1, ceil(total / por_pagina))
        pagina = min(max(1, pagina), total_paginas)
        inicio = (pagina - 1) * por_pagina

        return PaginaPessoasDTO(
            resultados=[self._para_dto(p) for p in pessoas[inicio:inicio + por_pagina]],
            total=total,
            pagina=pagina,
            por_pagina=por_pagina,
            total_paginas=total_paginas,
        )

    def obter(self, pessoa_id: int) -> PessoaDTO:
        return self._para_dto(self._buscar(pessoa_id))

    def cpf_em_uso(self, cpf: str, ignorar_id: int | None = None) -> bool:
        pessoas = Pessoa.objects.filter(cpf=cpf)
        if ignorar_id is not None:
            pessoas = pessoas.exclude(pk=ignorar_id)
        return pessoas.exists()

    def calcular_peso_ideal(self, pessoa_id: int) -> PesoIdealDTO:
        pessoa = self._buscar(pessoa_id)
        return PesoIdealDTO(
            id=pessoa.id,
            nome=pessoa.nome,
            sexo=pessoa.sexo,
            altura=pessoa.altura,
            peso=pessoa.peso,
            peso_ideal=pessoa.calcular_peso_ideal(),
        )

    def _buscar(self, pessoa_id: int) -> Pessoa:
        try:
            return Pessoa.objects.get(pk=pessoa_id)
        except Pessoa.DoesNotExist:
            raise PessoaNaoEncontradaError(pessoa_id)

    def _salvar(self, pessoa: Pessoa) -> None:
        try:
            with transaction.atomic():
                pessoa.save()
        except IntegrityError:
            raise CpfJaCadastradoError()

    @staticmethod
    def _para_dto(pessoa: Pessoa) -> PessoaDTO:
        return PessoaDTO(
            id=pessoa.id,
            nome=pessoa.nome,
            data_nasc=pessoa.data_nasc,
            cpf=pessoa.cpf,
            sexo=pessoa.sexo,
            altura=pessoa.altura,
            peso=pessoa.peso,
        )
