# Training Timer

インターバルトレーニング用タイマーアプリです。VOICEVOX によるかわいい音声ガイダンス付き。

## 起動方法

```bash
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開いてください。

## 終了方法

ターミナルで `Ctrl + C` を押すと開発サーバーが停止します。

## 音声ガイダンス（VOICEVOX）の使い方

1. [VOICEVOX](https://voicevox.hiroshiba.jp/) をダウンロード・インストール
2. VOICEVOXアプリを起動しておく
3. アプリの設定画面で **「かわいい(VOICEVOX)」** を選択

> VOICEVOXが起動していない場合はシステム音声に自動切り替えされます。

## 技術スタック

- React 18
- Vite
- Web Audio API
- Web Speech API / VOICEVOX
