import { AbstractControl, ValidationErrors } from '@angular/forms';

export function somenteDigitos(valor: string): string {
  return (valor ?? '').replace(/\D/g, '');
}

export function formatarCpf(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

export function cpfValido(cpf: string): boolean {
  const d = somenteDigitos(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;

  for (const posicao of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < posicao; i++) soma += Number(d[i]) * (posicao + 1 - i);
    const digito = ((soma * 10) % 11) % 10;
    if (digito !== Number(d[posicao])) return false;
  }
  return true;
}

export function cpfValidator(control: AbstractControl<string>): ValidationErrors | null {
  if (!control.value) return null;
  return cpfValido(control.value) ? null : { cpf: true };
}

export function dataNaoFuturaValidator(control: AbstractControl<string>): ValidationErrors | null {
  if (!control.value) return null;
  const agora = new Date();
  const hoje = [agora.getFullYear(), agora.getMonth() + 1, agora.getDate()]
    .map((n) => String(n).padStart(2, '0'))
    .join('-');
  return control.value > hoje ? { dataFutura: true } : null;
}

export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}
