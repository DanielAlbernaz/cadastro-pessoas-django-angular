from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler


class PessoaError(Exception):
    status_code = status.HTTP_400_BAD_REQUEST


class PessoaNaoEncontradaError(PessoaError):
    status_code = status.HTTP_404_NOT_FOUND

    def __init__(self, pessoa_id: int):
        super().__init__(f'Pessoa com id {pessoa_id} não encontrada.')


class CpfJaCadastradoError(PessoaError):
    status_code = status.HTTP_409_CONFLICT

    def __init__(self):
        super().__init__('Este CPF já está cadastrado.')


def tratar_excecao(exc, context):
    if isinstance(exc, PessoaError):
        return Response({'detail': str(exc)}, status=exc.status_code)
    return exception_handler(exc, context)
