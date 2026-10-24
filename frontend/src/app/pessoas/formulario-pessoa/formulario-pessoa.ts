import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { mensagemErroHttp } from '../../shared/erro-http';
import { ToastService } from '../../shared/toast.service';
import { Pessoa, Sexo } from '../pessoa.model';
import { PessoaService } from '../pessoa.service';
import { cpfValidator, dataNaoFuturaValidator, formatarCpf } from '../validadores';

type Campo = 'nome' | 'data_nasc' | 'cpf' | 'sexo' | 'altura' | 'peso';

@Component({
  selector: 'app-formulario-pessoa',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-pessoa.html',
  styleUrl: './formulario-pessoa.css',
})
export class FormularioPessoa implements OnInit {
  private readonly api = inject(PessoaService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly toast = inject(ToastService);

  readonly pessoa = input<Pessoa | null>(null);

  readonly salvo = output<Pessoa>();
  readonly cancelado = output<void>();

  protected readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(150)]],
    data_nasc: ['', [Validators.required, dataNaoFuturaValidator]],
    cpf: ['', [Validators.required, cpfValidator]],
    sexo: this.fb.control<Sexo | ''>('', Validators.required),
    altura: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0.3),
      Validators.max(3),
    ]),
    peso: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(500),
    ]),
  });

  protected readonly salvando = signal(false);
  protected readonly errosServidor = signal<Partial<Record<Campo, string[]>>>({});

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.errosServidor.set({}));
  }

  ngOnInit(): void {
    const pessoa = this.pessoa();
    if (pessoa) {
      this.form.reset({ ...pessoa, cpf: formatarCpf(pessoa.cpf) });
    }
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.erro('Corrija os campos destacados no formulário.');
      return;
    }

    const id = this.pessoa()?.id;
    const dados = this.dadosDoFormulario();
    const requisicao = id ? this.api.alterar(id, dados) : this.api.incluir(dados);

    this.salvando.set(true);
    requisicao.subscribe({
      next: (pessoa) => {
        this.salvando.set(false);
        this.toast.sucesso(
          id ? `Dados de ${pessoa.nome} alterados.` : `${pessoa.nome} incluído(a) no cadastro.`,
        );
        this.salvo.emit(pessoa);
      },
      error: (erro: HttpErrorResponse) => {
        this.salvando.set(false);
        this.tratarErro(erro);
      },
    });
  }

  protected aoDigitarCpf(): void {
    const cpf = this.form.controls.cpf;
    cpf.setValue(formatarCpf(cpf.value), { emitEvent: false });
  }

  protected mensagemErro(campo: Campo): string | null {
    const servidor = this.errosServidor()[campo];
    if (servidor?.length) return servidor[0];

    const control = this.form.controls[campo];
    if (!control.touched || !control.errors) return null;

    const e = control.errors;
    if (e['required']) return 'Campo obrigatório.';
    if (e['cpf']) return 'CPF inválido.';
    if (e['dataFutura']) return 'A data não pode estar no futuro.';
    if (e['maxlength']) return `Máximo de ${e['maxlength'].requiredLength} caracteres.`;
    if (e['min']) return `Valor mínimo: ${e['min'].min}.`;
    if (e['max']) return `Valor máximo: ${e['max'].max}.`;
    return 'Valor inválido.';
  }

  private dadosDoFormulario(): Pessoa {
    const v = this.form.getRawValue();
    return {
      nome: v.nome.trim(),
      data_nasc: v.data_nasc,
      cpf: v.cpf,
      sexo: v.sexo as Sexo,
      altura: Number(v.altura),
      peso: Number(v.peso),
    };
  }

  private tratarErro(erro: HttpErrorResponse): void {
    if (erro.status === 400 && erro.error && typeof erro.error === 'object' && !erro.error.detail) {
      this.errosServidor.set(erro.error);
      this.toast.erro('O servidor recusou os dados. Verifique os campos destacados.');
    } else {
      this.toast.erro(mensagemErroHttp(erro));
    }
  }
}
