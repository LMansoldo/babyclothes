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
5. Cole o mesmo valor em:
   - `apps/web/.env` → `PUBLIC_GOOGLE_CLIENT_ID`
   - `.env` (raiz) → `GOOGLE_CLIENT_ID`
6. Gere um `INTERNAL_JWT_SECRET` forte (32+ chars) no `.env` raiz.
7. Reinicie os containers: `yarn dev:down && yarn dev`.

## Validação

- Abra `http://localhost:5173/login`
- O botão do Google deve renderizar
- Ao logar, você deve cair em `/catalog` (ou no formulário de registro PF/PJ na primeira vez)
