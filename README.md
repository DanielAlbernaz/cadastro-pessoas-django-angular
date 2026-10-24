# Cadastro de Pessoas: Django + Angular + PostgreSQL

Prova técnica (Desenvolvedor Full Stack Python Pleno, Global Tech).

CRUD da entidade **Pessoa** com os botões **Incluir, Alterar, Excluir e Pesquisar**, mais o ponto extra
**Peso Ideal**. O server é Django (API REST/JSON), e o client é Angular, separado do Django.

| Vídeo | Link |
|---|---|
| 1. A aplicação do ponto de vista do usuário | _(adicionar link)_ |
| 2. O código-fonte (Client e Server) | _(adicionar link)_ |

---

## Como rodar

### Opção 1: Docker (recomendado)

Pré-requisito: Docker Desktop em execução.

```bash
docker compose up --build
```

| Serviço | Endereço |
|---|---|
| Aplicação (Angular) | http://localhost:4200 |
| API (Django) | http://localhost:8000/api/pessoas/ |
| PostgreSQL | localhost:5432 (usuário `postgres` / senha `postgres` / banco `pessoas`) |

As migrations são aplicadas automaticamente quando o backend sobe.

### Opção 2: Desenvolvimento local (VSCode)

Pré-requisitos: Python 3.12+, Node 22+ e um PostgreSQL. O banco pode ser só o do Docker: `docker compose up -d db`.

**Backend**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Linux/Mac: source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend** (em outro terminal)

```bash
cd frontend
npm install
npm start
```

Acesse http://localhost:4200. O `ng serve` repassa as chamadas `/api` para o Django em `localhost:8000`
(arquivo `proxy.conf.json`).

---

## Testes automatizados

**Backend** (pytest + pytest-django)

```bash
# Com o Docker em execução (não precisa instalar nada)
docker compose exec backend pytest

# Ou localmente, com o ambiente virtual ativado
cd backend
.venv\Scripts\activate          # Linux/Mac: source .venv/bin/activate
pytest
```

**Frontend** (Vitest)

```bash
cd frontend
npx ng test --watch=false
```

---

## Arquitetura

```
Angular (client)                         Django (server)
┌──────────────────────┐  REST / JSON   ┌───────────────────────────────────────────────────────────┐
│ ListagemPessoas(tela)│ ─────────────> │ Controller ─> Service ─> Task ─> Model (ORM) ─> PostgreSQL│
│ PessoaService (HTTP) │ <───────────── │  (DTO entre as camadas)                                   │
└──────────────────────┘                └───────────────────────────────────────────────────────────┘
```

### Server: `backend/pessoas/`

| Arquivo | Camada | Responsabilidade |
|---|---|---|
| `controllers.py` | **Controller** | Recebe a requisição REST, valida o JSON pelo serializer, monta o **DTO** e chama o Service. Não tem regra de negócio. |
| `services.py` | **Service** | Regras de negócio (ex.: CPF único) e delegação para a Task. A Task é injetável, o que facilita os testes. |
| `tasks.py` | **Task** | Executa de fato incluir/alterar/excluir/pesquisar no banco pelo ORM e converte Model ↔ DTO. |
| `models.py` | **Entidade / ORM** | Classe `Pessoa` mapeada para a tabela `pessoa`, com o método `calcular_peso_ideal()` do diagrama. |
| `dtos.py` | **DTO** | `dataclasses` imutáveis que trafegam entre as camadas, sem depender do ORM. |
| `serializers.py` | Conversão JSON ↔ DTO | Validação de entrada (CPF, sexo, faixas de altura e peso, data). |
| `validators.py` | Apoio | Validação dos dígitos verificadores do CPF. |
| `exceptions.py` | Apoio | Erros de negócio (`PessoaNaoEncontradaError` → 404, `CpfJaCadastradoError` → 409). |

### Endpoints

| Botão | Método | URL | Resposta |
|---|---|---|---|
| Pesquisar | `GET` | `/api/pessoas/?busca=<nome ou CPF>&pagina=1` | 200 + página de resultados |
| Incluir | `POST` | `/api/pessoas/` | 201 + pessoa criada |
| Alterar | `PUT` | `/api/pessoas/{id}/` | 200 + pessoa alterada |
| Excluir | `DELETE` | `/api/pessoas/{id}/` | 204 |
| Peso Ideal | `GET` | `/api/pessoas/{id}/peso-ideal/` | 200 + cálculo |

Exemplo de JSON:

```json
{
  "nome": "João da Silva",
  "data_nasc": "1990-05-20",
  "cpf": "529.982.247-25",
  "sexo": "M",
  "altura": 1.80,
  "peso": 82.5
}
```

### Client: `frontend/src/app/`

Componentes standalone, estado em `signals`, novo control flow (`@if`/`@for`), `inject()` e CSS isolado por
componente. A comunicação entre componentes usa `input()` e `output()`.

| Arquivo | Responsabilidade |
|---|---|
| `pessoas/listagem-pessoas/` | Tela principal: pesquisa, tabela paginada e ações de cada registro. Abre o formulário e os popups. |
| `pessoas/formulario-pessoa/` | Modal de Incluir/Alterar (Reactive Forms), com validação e erros do server por campo. Emite `salvo` ao concluir. |
| `pessoas/peso-ideal-popup/` | Popup com o resultado do cálculo do peso ideal. |
| `pessoas/pessoa.service.ts` | Cliente HTTP da API. Todas as ações vão até o server. |
| `pessoas/pessoa.model.ts` | Interfaces TypeScript no mesmo formato do JSON da API. |
| `pessoas/validadores.ts` | Máscara e validação de CPF e validação de data no client. |
| `shared/confirmacao-dialog/` | Diálogo de confirmação reutilizável (usado no Excluir). |
| `shared/toast.service.ts` + `shared/toasts/` | Notificações de sucesso e erro, reutilizáveis por qualquer tela. |
| `shared/erro-http.ts` | Converte um erro HTTP em mensagem para o usuário. |

---

## Regras e decisões

- **Modelo do diagrama:** `Nome`/`CPF` → `CharField`, `Data_Nasc` → `DateField`, `Sexo` → `CharField(1)` com
  opções `M`/`F`, `Altura`/`Peso` (Real) → `FloatField`. O `id` é auto-incrementado.
  O `Constructor(pNome, pData, pCPF, pSexo, pAltura, pPeso)` do diagrama corresponde ao `PessoaDTO`, uma
  `dataclass` com os campos nessa mesma ordem. O `CalcularPesoIdeal()` é o método `calcular_peso_ideal()` da entidade.
- **Fluxo da tela:** a listagem abre carregada com todos os registros (uma pesquisa sem filtro).
  **+ Incluir pessoa** abre o formulário em um modal.
- **Pesquisa em campo único com detecção de intenção** (`PessoaService.interpretar_busca`): o server analisa o texto
  digitado em vez de fazer um `OR` entre nome e CPF.

  | Texto digitado | Interpretação | Consulta |
  |---|---|---|
  | _(vazio)_ | todos | sem filtro |
  | `529.982.247-25` ou `52998224725` | CPF completo | `cpf = '52998224725'` |
  | `529.982` | início do CPF | `cpf LIKE '529982%'` |
  | `maria` | parte do nome | `nome ILIKE '%maria%'` |

  Motivo: um `OR` com `LIKE '%termo%'` obrigaria o PostgreSQL a varrer a tabela inteira. Já a busca por CPF exato ou
  por prefixo usa os índices btree que o Django cria para o campo `unique` (`pessoa_cpf_key` e
  `pessoa_cpf_..._like`, com `varchar_pattern_ops`). Ela também evita resultados barulhentos, como "12" trazendo
  qualquer pessoa com "12" no meio do CPF. Melhoria futura para bases grandes: índice GIN com `pg_trgm` para o
  `ILIKE` do nome.
- **Alterar e Excluir só depois de Pesquisar:** os botões **Peso Ideal**, **Alterar** e **Excluir** ficam em cada
  linha do resultado da pesquisa, então só existem para um registro que veio do server. Alterar abre o modal
  preenchido, e Excluir pede confirmação. Depois de cada operação, a lista é recarregada com o filtro atual.
- **Paginação:** a pesquisa devolve 10 registros por página
  (`{ "resultados": [...], "total": 57, "pagina": 1, "por_pagina": 10, "total_paginas": 6 }`). A Task usa
  `count()` e fatiamento do QuerySet, que o Django converte em `LIMIT/OFFSET`, então a API nunca carrega a tabela
  inteira. A ordenação por `id` decrescente (os cadastros mais recentes primeiro) deixa as páginas estáveis, e uma página além da última devolve a última
  (útil depois de uma exclusão).
- **CPF único:** checado no Service, que retorna uma mensagem clara, e garantido também por `unique` no banco,
  o que cobre requisições simultâneas. O CPF é armazenado sem máscara e os dígitos verificadores são validados
  no client e no server.
- **Integridade no banco:** `CHECK constraints` para sexo (`M`/`F`), altura > 0 e peso > 0.
- **Peso ideal** (altura em metros), calculado no server e exibido em popup:
  - homens: `(72,7 × altura) − 58`
  - mulheres: `(62,1 × altura) − 44,7`
- **Erros da API:** validação → 400 com o erro por campo (exibido abaixo do campo na tela), pessoa inexistente → 404,
  CPF duplicado → 409.

## Tecnologias

Python 3.12 · Django 5.2 LTS · Django REST Framework · PostgreSQL 17 · Angular 22 · TypeScript ·
pytest · Vitest · Docker Compose · nginx
