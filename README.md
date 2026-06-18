# CoC NPC Digitizer (Web版)

クトゥルフ神話TRPGのNPCをデジタル化し、cocofolia用JSONを生成するツールです。
Google / Discord ログインに対応し、作成したNPCをクラウドに保存・一覧・再編集できます。

## 技術スタック

- Next.js 16 (App Router, TypeScript, Tailwind CSS)
- Supabase (認証 + Postgres データベース)
- Vercel へのデプロイを想定

## セットアップ手順

### 1. Supabase プロジェクトを作成

1. https://supabase.com でプロジェクトを新規作成
2. Project Settings > API から `Project URL` と `anon public key` を取得

### 2. データベースのマイグレーションを実行

Supabase の SQL Editor で `supabase/migrations/0001_create_npcs_table.sql` の内容を実行してください。
`npcs` テーブルが作成され、Row Level Security（本人のデータのみ読み書き可能）が設定されます。

### 3. OAuth プロバイダーを設定

Supabase の Authentication > Providers で以下を有効化してください。

- **Google**: Google Cloud Console で OAuth クライアントIDを作成し、Client ID / Secret を Supabase に設定
- **Discord**: Discord Developer Portal でアプリケーションを作成し、Client ID / Secret を Supabase に設定

どちらも Redirect URL は Supabase が指定するURL（`https://xxxx.supabase.co/auth/v1/callback`）を使用します。

### 4. 環境変数を設定

`.env.local.example` を `.env.local` にコピーし、Supabase の値を入力してください。

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
```

### 5. ローカルで起動

```bash
npm install
npm run dev
```

http://localhost:3000 で確認できます。

### 6. Vercel へデプロイ

1. このリポジトリを GitHub にプッシュ
2. Vercel で New Project からリポジトリを選択
3. Environment Variables に `.env.local` と同じ内容を設定
4. Deploy

デプロイ後、Supabase の Authentication > URL Configuration で、Vercel のドメイン（`https://your-app.vercel.app/auth/callback` 等）を Redirect URLs に追加してください。

## フォントについて

`src/app/layout.tsx` は現在システムフォントを使用しています。Google Fonts（Geist）を使いたい場合は、以下のように戻してください。

```tsx
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
```

## ディレクトリ構成

```
src/
  app/
    page.tsx              # トップページ（ログイン）
    dashboard/page.tsx     # マイページ（NPC一覧）
    editor/page.tsx        # 新規NPC作成
    editor/[id]/page.tsx   # 既存NPC編集
    auth/callback/route.ts # OAuthコールバック
    api/npcs/              # NPC保存・一覧・更新・削除API
  components/
    npc-editor/            # NPCデジタイザー本体のUIパーツ
    dashboard/              # マイページ用UIパーツ
    auth/                   # ログイン・ログアウトボタン
  lib/
    coc/                    # CoC計算ロジック・cocofolia JSON生成
    supabase/                # Supabaseクライアント（ブラウザ/サーバー/middleware）
  types/npc.ts              # NPCデータの型定義
supabase/migrations/         # DBスキーマ
```

## 機能一覧

- 6版 / 7版 切り替え
- 能力値の並び順切り替え（初期版 / 同人シナリオ用）
- HP・MP・SAN・イニシアチブの自動計算＋手動上書き
- 技能の自由入力（10刻み/5刻み/自由値）
- 攻撃技能のダメージ・ダメージボーナス（DB）設定
- シークレットダイス出力オプション
- cocofolia用JSONのコピー・ファイル保存
- ログイン（Google / Discord）でNPCをクラウド保存
- マイページでのNPC一覧・再編集・削除

## アップデート方法（運用中の機能追加・修正）

ローカルでファイルを編集し、以下を実行するだけで本番環境（Vercel）に反映されます。コードを書き換えても、Supabase側に保存済みのNPCデータは消えません（コードとデータは完全に分離されています）。

```bash
git add .
git commit -m "変更内容のメモ"
git push
```

pushすると、Vercelが自動でビルド・再デプロイします。

## データベースのマイグレーション追加について

機能追加でテーブル構造を変える場合は、`supabase/migrations/` に新しいSQLファイル（例: `0002_xxx.sql`）を追加し、SupabaseのSQL Editorで実行してください。既存データは保持されます。

## セキュリティ・規模対応について

- 各APIには簡易レート制限（インメモリ）を設けています。本格的に高トラフィックになった場合は `src/lib/rate-limit.ts` をUpstash Redis等の外部ストアに置き換えることを推奨します。
- NPCデータの保存内容には文字数・件数・データサイズの上限があります（`src/lib/validate-npc.ts`）。
- アクセス規模が大きくなった場合、Supabase / Vercel ともに無料プランの上限（データベース容量、MAU、帯域幅等）を超える可能性があります。各ダッシュボードの使用量を定期的に確認してください。
- Supabase無料プランは7日間アクセスがないとプロジェクトが自動停止します（データは消えませんが、再アクセスで復帰が必要です）。
- バックアップは自動で取られません。重要なデータがある場合は、Supabase Proプラン（自動バックアップあり）への切り替え、または定期的な手動エクスポートを検討してください。

## フォルダ機能について

NPCはフォルダ（シナリオ単位など）に分類して保存できます。

- フォルダは階層構造を持てます（フォルダの中にフォルダを作成可能）
- 1つのNPCは1つのフォルダにのみ所属します（未分類も可）
- マイページのドロップダウンからフォルダを移動できます
- フォルダを削除すると、中のNPCは「未分類」に移動し、サブフォルダは連動して削除されます
