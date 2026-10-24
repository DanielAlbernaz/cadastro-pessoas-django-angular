import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import { ConfirmacaoDialog } from '../../shared/confirmacao-dialog/confirmacao-dialog';
import { mensagemErroHttp } from '../../shared/erro-http';
import { ToastService } from '../../shared/toast.service';
import { FormularioPessoa } from '../formulario-pessoa/formulario-pessoa';
import { PaginaPessoas, PesoIdeal, Pessoa } from '../pessoa.model';
import { PessoaService } from '../pessoa.service';
import { PesoIdealPopup } from '../peso-ideal-popup/peso-ideal-popup';
import { formatarCpf, formatarData } from '../validadores';

@Component({
  selector: 'app-listagem-pessoas',
  imports: [ReactiveFormsModule, DecimalPipe, FormularioPessoa, PesoIdealPopup, ConfirmacaoDialog],
  templateUrl: './listagem-pessoas.html',
  styleUrl: './listagem-pessoas.css',
  host: { '(document:keydown.escape)': 'fecharPopups()' },
})
export class ListagemPessoas {
  private readonly api = inject(PessoaService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly toast = inject(ToastService);

  protected readonly filtro = this.fb.group({ busca: '' });

  protected readonly resultados = signal<Pessoa[]>([]);
  protected readonly paginacao = signal<Omit<PaginaPessoas, 'resultados'> | null>(null);
  protected readonly pesquisou = signal(false);
  protected readonly filtrado = signal(false);
  protected readonly carregando = signal(false);

  protected readonly formularioAberto = signal(false);
  protected readonly emEdicao = signal<Pessoa | null>(null);
  protected readonly paraExcluir = signal<Pessoa | null>(null);
  protected readonly pesoIdeal = signal<PesoIdeal | null>(null);

  protected readonly formatarCpf = formatarCpf;
  protected readonly formatarData = formatarData;

  private ultimaBusca = '';

  constructor() {
    this.pesquisar();
  }

  protected pesquisar(): void {
    this.ultimaBusca = this.filtro.getRawValue().busca.trim();
    this.carregarLista(1);
  }

  protected irParaPagina(pagina: number): void {
    this.carregarLista(pagina);
  }

  protected limparPesquisa(): void {
    this.filtro.reset();
    this.pesquisar();
  }

  protected abrirInclusao(): void {
    this.emEdicao.set(null);
    this.formularioAberto.set(true);
  }

  protected abrirAlteracao(pessoa: Pessoa): void {
    this.emEdicao.set(pessoa);
    this.formularioAberto.set(true);
  }

  protected aoSalvar(): void {
    this.formularioAberto.set(false);
    this.carregarLista();
  }

  protected pedirExclusao(pessoa: Pessoa): void {
    this.paraExcluir.set(pessoa);
  }

  protected confirmarExclusao(): void {
    const pessoa = this.paraExcluir();
    this.paraExcluir.set(null);
    if (!pessoa?.id) return;

    this.executar(this.api.excluir(pessoa.id), () => {
      this.toast.sucesso('Registro excluído.');
      this.carregarLista();
    });
  }

  protected calcularPesoIdeal(pessoa: Pessoa): void {
    if (!pessoa.id) return;
    this.executar(this.api.calcularPesoIdeal(pessoa.id), (resultado) =>
      this.pesoIdeal.set(resultado),
    );
  }

  protected fecharPopups(): void {
    this.formularioAberto.set(false);
    this.paraExcluir.set(null);
    this.pesoIdeal.set(null);
  }

  private carregarLista(pagina = this.paginacao()?.pagina ?? 1): void {
    const busca = this.ultimaBusca;
    this.executar(this.api.pesquisar({ busca, pagina }), ({ resultados, ...paginacao }) => {
      this.resultados.set(resultados);
      this.paginacao.set(paginacao);
      this.pesquisou.set(true);
      this.filtrado.set(!!busca);
    });
  }

  private executar<T>(requisicao: Observable<T>, sucesso: (resposta: T) => void): void {
    this.carregando.set(true);
    requisicao.subscribe({
      next: (resposta) => {
        this.carregando.set(false);
        sucesso(resposta);
      },
      error: (erro: HttpErrorResponse) => {
        this.carregando.set(false);
        this.toast.erro(mensagemErroHttp(erro));
      },
    });
  }
}
