from datetime import date

import pytest
from rest_framework.test import APIClient

from pessoas.models import Pessoa


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def dados_pessoa() -> dict:
    return {
        'nome': 'João da Silva',
        'data_nasc': '1990-05-20',
        'cpf': '529.982.247-25',
        'sexo': 'M',
        'altura': 1.80,
        'peso': 82.5,
    }


@pytest.fixture
def pessoa(db) -> Pessoa:
    return Pessoa.objects.create(
        nome='Maria Souza',
        data_nasc=date(1995, 3, 10),
        cpf='11144477735',
        sexo='F',
        altura=1.70,
        peso=60.0,
    )
