# タスク完了時のチェックリスト

## データ更新タスク完了時
1. **CSV→JSON変換実行**
   ```bash
   node public/mouthpiece/data/convert-clinic-texts.js
   ```

2. **テスト実行**
   ```bash
   npm run test:mouthpiece
   ```

3. **ブラウザ確認**
   - http://localhost:8090/mouthpiece/ でビジュアル確認
   - 各タブの表示確認（総合・施術内容・サービス）
   - レスポンシブ表示確認

4. **データ整合性確認**
   - CSV ⇒ JSON ⇒ 表示 の一貫性チェック
   - ヘッダー動的更新の動作確認

## コード変更完了時
1. **構文チェック** （このプロジェクトには特定のlint設定なし）
2. **E2Eテスト実行**
3. **Git commit**（必要に応じて）

## 緊急度レベル
- **Critical**: 比較表が表示されない、タブが動作しない
- **High**: ヘッダーが正しく更新されない
- **Medium**: スタイルの軽微な問題
- **Low**: パフォーマンスの最適化