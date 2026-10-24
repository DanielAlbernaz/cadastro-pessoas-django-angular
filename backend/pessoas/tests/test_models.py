import pytest

from pessoas.models import Pessoa


@pytest.mark.parametrize('sexo, altura, esperado', [
    ('M', 1.80, 72.86),
    ('F', 1.70, 60.87),
])
def test_calcular_peso_ideal(sexo, altura, esperado):
    assert Pessoa(sexo=sexo, altura=altura).calcular_peso_ideal() == esperado
