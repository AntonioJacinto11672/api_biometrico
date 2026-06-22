# TimeNet Biométrico API

API REST de integração com o sistema biométrico **ZKTeco TimeNet** do **Tribunal da Comarca de Luanda**, desenvolvida em **NestJS** com base de dados SQLite.

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | NestJS (Node.js + TypeScript) |
| Base de dados | SQLite — `TimeNet.db` (modo leitura) |
| Driver SQLite | `better-sqlite3` (síncrono) |
| Documentação | Swagger / OpenAPI (`/docs`) |

---

## Infraestrutura

| Recurso | Detalhe |
|---|---|
| Terminal biométrico | BIOMETRICO RH (K14/ID) |
| IP do terminal | 10.182.13.13 |
| Base de dados | TimeNet.db |
| Funcionários registados | 245 |
| Departamentos | 16 |
| Registos de ponto (punches) | 66 084 |
| Day Summary (frequência diária) | 1 007 070 |
| Detalhes entrada/saída | 100 944 |

---

## Instalação e arranque

```bash
# Instalar dependências
npm install

# Modo desenvolvimento (hot reload)
npm run start:dev

# Modo produção
npm run start:prod
```

A API fica disponível em `http://localhost:3000`.  
A documentação Swagger fica em `http://localhost:3000/docs`.

---

## Módulos e Endpoints

### Departamentos — `/departments`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/departments` | Listar todos os departamentos com total de funcionários |
| `GET` | `/departments/:id` | Buscar departamento por ID |
| `GET` | `/departments/:id/employees` | Listar funcionários de um departamento |

---

### Funcionários — `/employees`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/employees` | Listar funcionários (com filtros) |
| `GET` | `/employees/pin/:pin` | Buscar funcionário pelo PIN biométrico |
| `GET` | `/employees/:id` | Buscar funcionário por ID |

**Query parameters de `/employees`:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `active` | `0` ou `1` | Filtrar por estado (ativo/inativo) |
| `department_id` | `number` | Filtrar por departamento |
| `search` | `string` | Pesquisa por nome ou PIN |
| `limit` | `number` | Registos por página (defeito: 50) |
| `offset` | `number` | Paginação (defeito: 0) |

---

### Registos de Ponto — `/punches`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/punches` | Listar registos de ponto com filtros |
| `GET` | `/punches/date/:date` | Todos os registos de uma data (YYYY-MM-DD) |
| `GET` | `/punches/summary` | Resumo de presenças por funcionário num período |
| `GET` | `/punches/employee/:id` | Registos de ponto de um funcionário |

**Query parameters de `/punches`:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `employee_id` | `number` | Filtrar por funcionário |
| `date_from` | `YYYY-MM-DD` | Data de início |
| `date_to` | `YYYY-MM-DD` | Data de fim |
| `terminal_id` | `number` | Filtrar por terminal biométrico |
| `limit` | `number` | Defeito: 100 |
| `offset` | `number` | Paginação |

---

### Frequência / Assiduidade — `/attendance`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/attendance/summary` | Resumo diário de frequência (`att_day_summary`) |
| `GET` | `/attendance/details` | Detalhes diários de entrada/saída (`att_day_details`) |
| `GET` | `/attendance/daily/:date` | Presença de todos os funcionários ativos numa data |
| `GET` | `/attendance/monthly/:year/:month` | Relatório mensal simplificado por funcionário |

**Query parameters de `/attendance/summary`:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `employee_id` | `number` | Filtrar por funcionário |
| `date_from` | `YYYY-MM-DD` | Data de início |
| `date_to` | `YYYY-MM-DD` | Data de fim |
| `department_id` | `number` | Filtrar por departamento |
| `limit` | `number` | Defeito: 100 |
| `offset` | `number` | Paginação |

**Query parameters de `/attendance/monthly/:year/:month`:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `department_id` | `number` | Filtrar por departamento (opcional) |

---

### Terminais Biométricos — `/terminals`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/terminals` | Listar todos os terminais biométricos |
| `GET` | `/terminals/:id` | Detalhes completos de um terminal |
| `GET` | `/terminals/:id/stats` | Estatísticas de uso (punches hoje e no mês) |

---

### Turnos e Horários — `/shifts`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/shifts` | Listar todos os turnos |
| `GET` | `/shifts/timetables` | Listar todos os horários configurados |
| `GET` | `/shifts/:id/details` | Detalhes dos dias de um turno |
| `GET` | `/shifts/employee/:id` | Turnos atribuídos a um funcionário |

---

### Relatórios — `/reports`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/reports/dashboard` | Dashboard geral — totais e últimas marcações |
| `GET` | `/reports/absent/:date` | Funcionários ausentes numa data |
| `GET` | `/reports/late/:date` | Funcionários com atraso numa data |
| `GET` | `/reports/top-presence` | Ranking de presença num período |
| `GET` | `/reports/monthly-declaration` | **Relatório de Declaração Mensal** |

---

#### `GET /reports/monthly-declaration` — Relatório de Declaração Mensal

Gera o relatório de declaração mensal por funcionário, com o mesmo formato de colunas do relatório impresso pelo sistema TimeNet:

- Entrada/Saída (check-in / check-out)
- Break
- Late-In (atraso)
- Early-Out (saída antecipada)
- Ausência
- Horas Requeridas (Require Work)
- Horas Trabalhadas (Round Work)
- Overtime — OT1, OT2, OT3
- Horas de Exceção
- **Linha de Totais** por funcionário

**Query parameters:**

| Parâmetro | Obrigatório | Tipo | Descrição |
|---|---|---|---|
| `date_from` | ✅ | `YYYY-MM-DD` | Início do período |
| `date_to` | ✅ | `YYYY-MM-DD` | Fim do período |
| `department_id` | — | `number` | Filtrar por secção / departamento |
| `employee_id` | — | `number` | Filtrar por funcionário individual |

**Exemplos de chamada:**

```
# 5ª Secção — período de Março 2026
GET /reports/monthly-declaration?date_from=2026-03-02&date_to=2026-04-01&department_id=5

# Funcionário individual
GET /reports/monthly-declaration?date_from=2026-03-02&date_to=2026-04-01&employee_id=85
```

**Estrutura da resposta:**

```json
[
  {
    "id": 85,
    "pin": "85",
    "name": "Beatriz Miguel",
    "department": "5ª Secção da Sala Criminal",
    "days": [
      {
        "date": "2026-03-02",
        "dayOfWeek": "Seg",
        "schedule": "HORARIO UNICO",
        "checkIn": "07:56",
        "checkOut": "15:12",
        "break": "00:00",
        "lateIn": "00:00",
        "earlyOut": "00:00",
        "absence": "00:00",
        "requireWork": "07:00",
        "roundWork": "07:16",
        "ot1": "00:16",
        "ot2": "00:00",
        "ot3": "00:00",
        "exceptionHours": "00:00"
      }
    ],
    "totals": {
      "daysWorked": 24,
      "break": "00:00",
      "lateIn": "00:15",
      "earlyOut": "00:00",
      "absence": "07:00",
      "requireWork": "189:00",
      "roundWork": "176:42",
      "ot1": "03:22",
      "ot2": "00:00",
      "ot3": "00:00",
      "exceptionHours": "00:00"
    }
  }
]
```

---

## Estrutura do Projeto

```
src/
├── app.module.ts
├── main.ts                        # Arranque — porta 3000, Swagger em /docs
├── database/
│   └── database.service.ts        # Ligação SQLite (better-sqlite3, readonly)
├── departments/                   # Módulo de departamentos
├── employees/                     # Módulo de funcionários
├── punches/                       # Módulo de registos de ponto
├── attendance/                    # Módulo de frequência / assiduidade
├── terminals/                     # Módulo de terminais biométricos
├── shifts/                        # Módulo de turnos e horários
└── reports/                       # Módulo de relatórios
    ├── reports.controller.ts
    └── reports.service.ts
```

---

## Swagger

Toda a API está documentada interativamente em:

```
http://localhost:3000/docs
```

Os endpoints estão agrupados por módulo (tags): Funcionários, Departamentos, Registos de Ponto, Frequência / Assiduidade, Terminais Biométricos, Turnos e Horários, Relatórios.
