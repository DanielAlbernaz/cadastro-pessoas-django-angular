from django.db import models


class Pessoa(models.Model):

    class Sexo(models.TextChoices):
        MASCULINO = 'M', 'Masculino'
        FEMININO = 'F', 'Feminino'

    nome = models.CharField(max_length=150)
    data_nasc = models.DateField()
    cpf = models.CharField(max_length=11, unique=True)
    sexo = models.CharField(max_length=1, choices=Sexo.choices)
    altura = models.FloatField()
    peso = models.FloatField()

    class Meta:
        db_table = 'pessoa'
        ordering = ['-id']
        constraints = [
            models.CheckConstraint(condition=models.Q(sexo__in=['M', 'F']), name='pessoa_sexo_valido'),
            models.CheckConstraint(condition=models.Q(altura__gt=0), name='pessoa_altura_positiva'),
            models.CheckConstraint(condition=models.Q(peso__gt=0), name='pessoa_peso_positivo'),
        ]

    def __str__(self) -> str:
        return f'{self.nome} ({self.cpf})'

    def calcular_peso_ideal(self) -> float:
        if self.sexo == self.Sexo.MASCULINO:
            peso_ideal = (72.7 * self.altura) - 58
        else:
            peso_ideal = (62.1 * self.altura) - 44.7
        return round(peso_ideal, 2)
