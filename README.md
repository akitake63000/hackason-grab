# hackason-grab

## 構成

- フロント: `apps/web` (Next.js / App Router)
- API: `services/agent-api` (FastAPI)
- Hosting: Firebase Hosting から `/api/**` を Cloud Run へ rewrite

## フロントのセットアップ

```bash
cp apps/web/.env.example apps/web/.env.local
```

`.env.local` に Firebase Web SDK の設定値を入れてください。
ローカル開発で Cloud Run を直接叩く場合は `NEXT_PUBLIC_API_BASE` に
`https://agent-api-...run.app` を設定してください。

ビルドは以下で実行します。

```bash
npm --prefix apps/web run build
```

## Firebase Hosting へのデプロイ

1. Firebase CLI でプロジェクトを設定

```bash
firebase use --add
```

2. デプロイ

```bash
firebase deploy --only hosting
```

`firebase.json` の `predeploy` で `apps/web` のビルドが実行され、
`apps/web/out` が Hosting に配信されます。

## Cloud Run (agent-api) のデプロイ

`services/agent-api` を Cloud Run にデプロイし、サービス名は `agent-api` にしてください。
環境変数に `FIREBASE_STORAGE_BUCKET` を設定します。
Vertex AI (Gemini) を使う場合は以下も設定してください。

- `GOOGLE_CLOUD_PROJECT=hackason-grab`
- `GOOGLE_CLOUD_LOCATION=global`
- `GOOGLE_GENAI_USE_VERTEXAI=true`
- `GEMINI_MODEL=gemini-2.5-flash`
- `GEMINI_ENABLED=true`

Firebase Hosting の `/api/**` rewrite が Cloud Run の `agent-api` を参照します。
