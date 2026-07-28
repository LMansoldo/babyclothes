## WP7 — i18n

Editar `apps/web/src/lib/i18n/pt.json` e `en.json`. Blocos completos a adicionar (en análogo):

```json
"auth": {
  "register_pf": {
    "back": "Voltar",
    "create_account": "Criar conta",
    "lead": "Leva menos de um minuto",
    "title": "Comece a conversar",
    "title_accent": "com o agente",
    "google": "Registrar com Google",
    "divider": "ou com e-mail",
    "name_label": "Nome completo",
    "name_placeholder": "Maria Clara Santos",
    "email_label": "E-mail",
    "email_placeholder": "voce@email.com",
    "password_label": "Senha",
    "password_placeholder": "Mínimo 8 caracteres",
    "city_label": "Cidade",
    "city_placeholder": "São Paulo, SP",
    "city_hint": "Usada para encontrar itens perto de você",
    "cpf_label": "CPF",
    "cpf_placeholder": "000.000.000-00",
    "submit": "Criar conta",
    "step_indicator": "Passo {{step}} de 2",
    "continue": "Continuar",
    "step2_title": "Contato e endereço",
    "step2_lead": "Para entregas e itens perto de você",
    "phone_label": "Telefone",
    "phone_placeholder": "(11) 98765-4321",
    "nationality_label": "Nacionalidade",
    "nationality_placeholder": "Brasileira",
    "cep_label": "CEP",
    "cep_placeholder": "00000-000",
    "address_label": "Endereço",
    "address_placeholder": "Rua, número e complemento",
    "state_label": "Estado",
    "state_placeholder": "UF",
    "error_email_taken": "Este e-mail já está cadastrado.",
    "error_pj_disabled": "Cadastro de empresas indisponível no momento.",
    "error_generic": "Não foi possível criar a conta. Tente novamente."
  },
  "login_email": {
    "divider": "ou entre com e-mail",
    "email_label": "E-mail",
    "email_placeholder": "voce@email.com",
    "password_label": "Senha",
    "password_placeholder": "Sua senha",
    "submit": "Entrar",
    "error_invalid_credentials": "E-mail ou senha incorretos.",
    "error_generic": "Não foi possível entrar. Tente novamente."
  }
},
"validation": {
  "name_required": "Nome é obrigatório",
  "email_invalid": "E-mail inválido",
  "password_min": "Mínimo 8 caracteres",
  "password_required": "Informe a senha",
  "city_required": "Cidade é obrigatória",
  "cpf_invalid": "CPF inválido — verifique os dígitos",
  "phone_invalid": "Telefone inválido — use DDD + número",
  "nationality_required": "Nacionalidade é obrigatória",
  "cep_invalid": "CEP inválido",
  "address_required": "Endereço é obrigatório",
  "state_required": "Selecione o estado"
},
"onboarding": {
  "skip": "Pular",
  "title": "Um agente que",
  "title_accent": "garimpa",
  "title_rest": "o brechó por você",
  "description": "A IA procura roupas e itens ideais combinando tamanho, idade, peso e a sua localização.",
  "features": { "size": "Tamanho", "age": "Idade", "weight": "Peso", "location": "Localização" },
  "cta": "Conversar com o agente"
},
"agent": {
  "topbar": { "name": "Assistente IA", "online": "online", "offline": "offline", "typing": "digitando..." },
  "intake": {
    "greeting": "Oi, {{name}}! Sou o assistente do BabyClothes. Vou te ajudar a encontrar roupinhas ideais em brechós.",
    "has_children": "Pra começar: você tem filhos?",
    "yes": "Sim", "no": "Não", "expecting": "Bebê a caminho",
    "how_many": "Que bom! Quantos filhos você tem?",
    "count_3plus": "3+",
    "child_form_intro": "Perfeito! Me conta sobre ela(e) — preencha os dados abaixo:",
    "child_form_title": "Cadastro da criança",
    "child_saved": "{{name}} cadastrada! Já sei o tamanho ideal.",
    "due_date_intro": "Que alegria! Qual é a previsão de nascimento? Assim já preparo o enxoval no tamanho certo.",
    "due_date_title": "Previsão de nascimento",
    "due_date_confirm": "Confirmar",
    "due_date_saved": "Anotado! Vou sugerir itens RN e P — os tamanhos que recém-nascidos mais usam nos primeiros meses.",
    "explain": "A plataforma funciona assim: eu procuro em brechós roupas e itens ideais combinando tamanho, idade, peso e a sua localização.",
    "search_intent": "Tudo pronto! Agora me conta: o que você quer encontrar? Posso buscar por tipo de peça, ocasião ou estação.",
    "suggestions_heading": "Sugestões",
    "input_placeholder": "Pergunte sobre roupas, tamanhos...",
    "choice_placeholder": "Ou responda por aqui..."
  },
  "suggestions": {
    "bodies_m": "Bodies tamanho M",
    "winter": "Roupas de inverno",
    "party": "Look para festa",
    "pajamas": "Pijamas confortáveis",
    "next_size": "Próximo tamanho (G)"
  },
  "form": {
    "name": "Nome", "age": "Idade", "height": "Altura", "weight": "Peso",
    "birth_height": "Altura ao nascer", "birth_weight": "Peso ao nascer",
    "submit": "Salvar criança"
  }
}
```

**DoD**: nenhuma string nova hardcodada em componente; `en.json` completo com traduções equivalentes.
