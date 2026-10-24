import pytest

from pessoas.dtos import FiltroPessoaDTO
from pessoas.services import PessoaService


@pytest.mark.parametrize('termo, esperado', [
    ('', FiltroPessoaDTO()),
    ('maria', FiltroPessoaDTO(nome='maria')),
    ('529.982.247-25', FiltroPessoaDTO(cpf='52998224725')),
    ('529.982', FiltroPessoaDTO(cpf='529982', cpf_parcial=True)),
])
def test_interpretar_busca(termo, esperado):
    assert PessoaService.interpretar_busca(termo) == esperado
