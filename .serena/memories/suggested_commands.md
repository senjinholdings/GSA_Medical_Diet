# 推奨コマンド一覧

## 開発環境セットアップ
```bash
npm install
npm start  # サーバー起動（http://localhost:8090）
```

## テスト実行
```bash
npm test                    # 全テスト実行
npm run test:mouthpiece     # マウスピース関連テストのみ
npm run test:headed         # ヘッド付きモード
npm run test:debug          # デバッグモード
npm run test:report         # テストレポート表示
```

## データ変換（CSV→JSON）
```bash
# マウスピースサイト用
node public/mouthpiece/data/convert-clinic-texts.js
node public/mouthpiece/data/convert-site-common-texts.js

# その他サイト用
node public/{site}/data/convert-csv-to-json.js
```

## Git操作
```bash
git status
git add .
git commit -m "message"
git push
```

## システムコマンド（macOS/Darwin）
```bash
ls -la      # ファイル一覧
find . -name "*.js"  # ファイル検索
grep -r "pattern" .  # パターン検索
```