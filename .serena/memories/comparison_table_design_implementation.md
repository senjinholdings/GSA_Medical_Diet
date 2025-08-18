# 比較表デザイン実装仕様

## 概要
mouthpiece002サイトの比較表部分に、injection-lipolysis001のデザインを適用した実装仕様。

## デザイン要素

### カラースキーム
- タブボーダー・アクティブ背景: #6bd1d0（緑色）
- テーブルヘッダー背景: #efefef（グレー）
- 公式サイトボタン背景: #f69ca8（ピンク）
- 詳細をみるボタン: 白背景、#E0E0E0ボーダー、#4C4C4C文字色

### タブ機能
- 3つのタブ: 総合、施術内容、サービス
- 初期表示: Tab1（総合）5列表示
- タブごとに表示列を動的に切り替え

### タブ別表示列

#### Tab1（総合）
1. クリニック
2. 総合評価（comparison1）
3. 費用（comparison2）
4. 特徴（comparison3）
5. 公式サイト

#### Tab2（施術内容）
1. クリニック
2. 適用範囲（comparison4）
3. 目安期間（comparison5）
4. 通院頻度（comparison6）
5. 公式サイト

#### Tab3（サービス）
1. クリニック
2. 実績/症例数（comparison7）
3. ワイヤー矯正の紹介（comparison8）
4. サポート（comparison9）
5. 公式サイト

## 実装上の重要ポイント

### 1. 動的フィールドマッピング
- CSVではcomparison1-9のフィールド名を使用
- clinic-texts.jsonの「比較表ヘッダー設定」で日本語ヘッダー名を管理
- DataManager.getClinicTextメソッドで動的にマッピング

### 2. 初期化順序
```javascript
// 正しい初期化順序
// 1. setupComparisonTabs()を呼び出し（これが初期テーブルも生成）
// 2. generateComparisonTable()は呼ばない（重複を避ける）
```

### 3. ボタンHTML構造
```html
<!-- 公式サイトボタン -->
<a class="link_btn" href="..." target="_blank">公式サイト &gt;</a>

<!-- 詳細をみるボタン -->
<a class="detail_btn" href="#clinic1">詳細をみる</a>
```

### 4. レスポンシブ対応

#### 768px以下
```css
.comparison-table .link_btn, 
.comparison-table .detail_btn {
    padding: 4px 4px !important;
    font-size: 9px !important;
}
```

#### 480px以下
```css
.comparison-table, .comparison-table * {
    max-width: 100% !important;
    box-sizing: border-box !important;
}
```

## フィールド名変更対応
項目名が変更されても動的に参照できる仕組み：
1. CSVフィールド名（comparison1-9）は固定
2. 表示ヘッダー名のみ変更可能
3. clinic-texts.jsonの「比較表ヘッダー設定」で管理

## 注意事項
- mouthpiece独自のクラス名は使用しない（比較表部分のみ）
- injection-lipolysis001のクラス構造を維持
- 詳細ボタンのテキストは「詳細をみる」（「を」はひらがな）