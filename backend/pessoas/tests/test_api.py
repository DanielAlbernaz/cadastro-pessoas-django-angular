import pytest

from pessoas.models import Pessoa

URL = '/api/pessoas/'

pytestmark = pytest.mark.django_db


def test_incluir(api_client, dados_pessoa):
    resposta = api_client.post(URL, dados_pessoa, format='json')

    assert resposta.status_code == 201
    assert resposta.json()['cpf'] == '52998224725'
    assert Pessoa.objects.count() == 1


def test_incluir_cpf_invalido(api_client, dados_pessoa):
    dados_pessoa['cpf'] = '123.456.789-00'

    resposta = api_client.post(URL, dados_pessoa, format='json')

    assert resposta.status_code == 400
    assert 'cpf' in resposta.json()


def test_incluir_cpf_duplicado(api_client, dados_pessoa, pessoa):
    dados_pessoa['cpf'] = pessoa.cpf

    resposta = api_client.post(URL, dados_pessoa, format='json')

    assert resposta.status_code == 409


def test_pesquisar(api_client, pessoa):
    por_nome = api_client.get(URL, {'busca': 'souza'}).json()['resultados']
    por_cpf = api_client.get(URL, {'busca': '111.444'}).json()['resultados']
    todos = api_client.get(URL).json()

    assert [p['nome'] for p in por_nome] == ['Maria Souza']
    assert [p['nome'] for p in por_cpf] == ['Maria Souza']
    assert todos['total'] == 1


def test_pesquisar_paginado(api_client, pessoa):
    for i in range(11):
        Pessoa.objects.create(nome=f'Pessoa {i:02}', data_nasc=pessoa.data_nasc, cpf=f'{i:011}',
                              sexo='M', altura=1.7, peso=70)

    pagina_2 = api_client.get(URL, {'pagina': 2}).json()
    alem_da_ultima = api_client.get(URL, {'pagina': 99}).json()

    assert (pagina_2['total'], pagina_2['total_paginas'], len(pagina_2['resultados'])) == (12, 2, 2)
    assert alem_da_ultima['pagina'] == 2


def test_alterar(api_client, dados_pessoa, pessoa):
    resposta = api_client.put(f'{URL}{pessoa.id}/', dados_pessoa, format='json')

    assert resposta.status_code == 200
    pessoa.refresh_from_db()
    assert pessoa.nome == 'João da Silva'


def test_excluir(api_client, pessoa):
    resposta = api_client.delete(f'{URL}{pessoa.id}/')

    assert resposta.status_code == 204
    assert not Pessoa.objects.exists()


def test_peso_ideal(api_client, pessoa):
    resposta = api_client.get(f'{URL}{pessoa.id}/peso-ideal/')

    assert resposta.status_code == 200
    assert resposta.json()['peso_ideal'] == 60.87


def test_pessoa_inexistente(api_client):
    assert api_client.delete(f'{URL}999/').status_code == 404
