import { cpfValido, formatarCpf } from './validadores';

describe('validadores', () => {
  it('valida os dígitos verificadores do CPF', () => {
    expect(cpfValido('529.982.247-25')).toBe(true);
    expect(cpfValido('529.982.247-24')).toBe(false);
    expect(cpfValido('111.111.111-11')).toBe(false);
  });

  it('aplica a máscara de CPF', () => {
    expect(formatarCpf('52998224725')).toBe('529.982.247-25');
  });
});
