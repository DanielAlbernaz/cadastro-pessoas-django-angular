from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    BuscaPessoaSerializer,
    PaginaPessoasSerializer,
    PesoIdealSerializer,
    PessoaSerializer,
)
from .services import PessoaService


class PessoaListController(APIView):

    def get(self, request: Request) -> Response:
        busca = BuscaPessoaSerializer(data=request.query_params)
        busca.is_valid(raise_exception=True)
        pagina = PessoaService().pesquisar(busca.to_dto())
        return Response(PaginaPessoasSerializer(pagina).data)

    def post(self, request: Request) -> Response:
        serializer = PessoaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        pessoa = PessoaService().incluir(serializer.to_dto())
        return Response(PessoaSerializer(pessoa).data, status=status.HTTP_201_CREATED)


class PessoaDetailController(APIView):

    def get(self, request: Request, pessoa_id: int) -> Response:
        pessoa = PessoaService().obter(pessoa_id)
        return Response(PessoaSerializer(pessoa).data)

    def put(self, request: Request, pessoa_id: int) -> Response:
        serializer = PessoaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        pessoa = PessoaService().alterar(serializer.to_dto(pessoa_id))
        return Response(PessoaSerializer(pessoa).data)

    def delete(self, request: Request, pessoa_id: int) -> Response:
        PessoaService().excluir(pessoa_id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PesoIdealController(APIView):

    def get(self, request: Request, pessoa_id: int) -> Response:
        resultado = PessoaService().calcular_peso_ideal(pessoa_id)
        return Response(PesoIdealSerializer(resultado).data)
