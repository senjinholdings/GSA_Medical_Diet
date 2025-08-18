# プロジェクト概要

## プロジェクトの目的
医療美容クリニック比較サイトのE2Eテストスイートプロジェクト。特にマウスピース矯正サイトの地域名表示機能とクリニック比較表機能をテストする。

## 技術スタック
- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Testing**: Playwright for E2E testing
- **Backend**: Node.js (Express server for local development)
- **Data**: CSV → JSON変換システム

## 主要機能
1. **地域名表示機能**: URLパラメータ `region_id` に基づく動的地域名表示
2. **クリニック比較表**: 動的ヘッダーシステム（CSV→JSON→表示）
3. **タブ型UI**: 総合・施術内容・サービスタブでの情報表示
4. **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応

## プロジェクト構造
```
public/
├── mouthpiece/           # マウスピース矯正サイト
│   ├── data/            # CSV/JSON変換システム
│   ├── images/          # 画像ファイル
│   ├── index.html       # メインページ
│   ├── app.js           # アプリケーション制御
│   └── styles.css       # スタイル
├── medical-diet001/      # その他医療サイト
├── threadlift/          # その他医療サイト
└── glp1/               # その他医療サイト
tests/                   # E2Eテストファイル
```