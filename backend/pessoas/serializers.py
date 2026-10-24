from datetime import date

from django.utils import timezone
from rest_framework import serializers

from .dtos import BuscaPessoaDTO, PessoaDTO
from .models import Pessoa
from .validators import cpf_valido, somente_digitos


class PessoaSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    nome = serializers.CharField(max_length=150)
    data_nasc = serializers.DateField()
    cpf = serializers.CharField(max_length=14)
    sexo = serializers.ChoiceField(choices=Pessoa.Sexo.choices)
    altura = serializers.FloatField(min_value=0.3, max_value=3.0)
    peso = serializers.FloatField(min_value=1, max_value=500)

    def validate_cpf(self, valor: str) -> str:
        if not cpf_valido(valor):
            raise serializers.ValidationError('CPF inválido.')
        return somente_digitos(valor)

    def validate_data_nasc(self, valor: date) -> date:
        if valor > timezone.localdate():
            raise serializers.ValidationError('A data de nascimento não pode estar no futuro.')
        if valor.year < 1900:
            raise serializers.ValidationError('Data de nascimento inválida.')
        return valor

    def to_dto(self, pessoa_id: int | None = None) -> PessoaDTO:
        return PessoaDTO(**self.validated_data, id=pessoa_id)


class BuscaPessoaSerializer(serializers.Serializer):
    busca = serializers.CharField(required=False, allow_blank=True, default='', max_length=150)
    pagina = serializers.IntegerField(required=False, default=1, min_value=1)

    def to_dto(self) -> BuscaPessoaDTO:
        return BuscaPessoaDTO(termo=self.validated_data['busca'], pagina=self.validated_data['pagina'])


class PaginaPessoasSerializer(serializers.Serializer):
    resultados = PessoaSerializer(many=True)
    total = serializers.IntegerField()
    pagina = serializers.IntegerField()
    por_pagina = serializers.IntegerField()
    total_paginas = serializers.IntegerField()


class PesoIdealSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    nome = serializers.CharField()
    sexo = serializers.CharField()
    altura = serializers.FloatField()
    peso = serializers.FloatField()
    peso_ideal = serializers.FloatField()
