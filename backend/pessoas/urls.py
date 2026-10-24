from django.urls import path

from .controllers import PesoIdealController, PessoaDetailController, PessoaListController

urlpatterns = [
    path('pessoas/', PessoaListController.as_view(), name='pessoa-list'),
    path('pessoas/<int:pessoa_id>/', PessoaDetailController.as_view(), name='pessoa-detail'),
    path('pessoas/<int:pessoa_id>/peso-ideal/', PesoIdealController.as_view(), name='pessoa-peso-ideal'),
]
