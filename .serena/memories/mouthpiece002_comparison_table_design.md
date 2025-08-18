# Mouthpiece002 比較表デザイン実装仕様

## 概要
injection-lipolysis001の比較表デザインをmouthpiece002に適用した実装パターン。
タブ切り替え機能と注意事項表示を含む完全な実装。

## 主要機能

### 1. タブ切り替え機能
- Tab1（総合）: 5列表示
- Tab2（comparison2）: 10列表示  
- Tab3（comparison3）: 11列表示
- 初期表示はTab1で5列のみ表示

### 2. モバイル対応
```css
@media (max-width: 768px) {
    .comparison-table .link_btn,
    .comparison-table .detail_btn,
    #comparison-table .detail_btn {
        padding: 4px 4px !important;
        font-size: 9px !important;
    }
}

@media (max-width: 480px) {
    .comparison-table, .comparison-table * {
        max-width: 100% !important;
        box-sizing: border-box !important;
    }
}
```

### 3. 初期化順序の修正
```javascript
// generateComparisonTable()を直接呼ばない
// setupComparisonTabs()内で初期テーブル生成を行う
this.setupComparisonTabs();
```

### 4. 注意事項の二箇所表示
- ランキング表示セクション下
- 比較表下
両方に同じ注意事項を表示

### 5. クリニックコード
実際のコード:
- omt (Oh my teeth)
- kireiline (キレイライン矯正)
- ws (ウィ・スマイル矯正)
- zenyum (ゼニュム)

### 6. デザインのポイント
- injection-lipolysis001のスタイルを完全に踏襲
- mouthpiece固有のクラス名は使用しない
- ボタンのpadding/font-sizeは厳密に指定
- CSS specificityに注意（!importantが必要な場合あり）

## テスト確認項目
1. 初期表示でTab1が選択され5列のみ表示
2. タブ切り替えで適切な列数が表示
3. モバイルでボタンスタイルが正しく適用
4. 注意事項が両方の場所に表示
5. URLパラメータ comparison_tab が機能

## 実装完了日
2025-08-18