# Google OAuth Setup

O login usa Google Identity Services (GSI) com ID token. Não precisa de Client Secret.

## Passos

1. Acesse [Google Cloud Console](https://console.cloud.google.com) → crie um projeto (ou selecione um existente).
2. **APIs & Services → OAuth consent screen**:
   - User type: **External**
   - Preencha App name, User support email, Developer contact email
   - Salve (pode deixar em "Testing")
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (dev)
     - domínio de produção quando houver
   - Não é necessário Authorized redirect URI (o fluxo GSI usa ID token, não authorization code)
4. Copie o **Client ID** gerado.
5. Cole o **mesmo valor** nas duas variáveis do `.env` da raiz (o Docker injeta em todos os serviços via `env_file`):
   - `GOOGLE_CLIENT_ID` (usada pela API Elixir para validar o token)
   - `PUBLIC_GOOGLE_CLIENT_ID` (usada pelo front para renderizar o botão)
6. Gere um `INTERNAL_JWT_SECRET` forte (32+ chars) no `.env` raiz.
7. Recrie os containers para reler o `.env`: `docker-compose up -d --force-recreate web api` (um simples `restart` **não** relê o `env_file`).

> Alterou a origem autorizada no Google Console e ainda vê 403 `The given origin is not allowed`? A propagação leva de 5 minutos a algumas horas e o GSI cacheia a verificação — teste em janela anônima.

## Validação

- Abra `http://localhost:5173/login`
- O botão do Google deve renderizar
- Ao logar, você deve cair em `/catalog` (ou no formulário de registro PF/PJ na primeira vez)
