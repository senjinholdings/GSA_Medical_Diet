const fs = require('fs');

// ファイルを読み込む
const filePath = process.argv[2];
if (!filePath) {
    console.error('Please provide a file path');
    process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// 修正されたラインを格納
const fixedLines = [];
let inOrphanedBlock = false;
let orphanedLines = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // 孤立したプロパティパターンを検出
    // プロパティ名: 値, のパターンで、前に適切なコンテキストがない場合
    if (trimmed.match(/^[a-zA-Z_][a-zA-Z0-9_]*:\s.*[,;]?\s*$/)) {
        // 前の行を確認
        const prevLine = i > 0 ? lines[i - 1].trim() : '';
        const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';
        
        // 正当なオブジェクトリテラルかチェック
        const validContexts = [
            'return', 'const', 'let', 'var', '=', '{', 'case', 'default',
            '.push(', '.map(', '.filter(', '.reduce(', 'export',
            'setState', 'this.', 'await', 'new ', '(', ','
        ];
        
        let isValid = false;
        for (const ctx of validContexts) {
            if (prevLine.includes(ctx) || prevLine.endsWith('{') || prevLine.endsWith(',')) {
                isValid = true;
                break;
            }
        }
        
        // });で終わる場合は孤立したconsole.logの残骸の可能性が高い
        if (!isValid && (nextLine === '});' || nextLine === '})' || nextLine === '}')) {
            console.log(`Line ${i + 1}: Removing orphaned property: ${trimmed}`);
            continue; // この行をスキップ
        }
    }
    
    // 孤立した });や}) も削除
    if (trimmed === '});' || trimmed === '})') {
        const prevLine = i > 0 ? lines[i - 1].trim() : '';
        // 前の行が削除された場合（空行）、これも削除
        if (prevLine === '' && i > 0 && fixedLines[fixedLines.length - 1].trim() === '') {
            console.log(`Line ${i + 1}: Removing orphaned closing bracket: ${trimmed}`);
            continue;
        }
    }
    
    fixedLines.push(line);
}

// ファイルを書き戻す
fs.writeFileSync(filePath, fixedLines.join('\n'), 'utf8');
console.log(`Fixed ${filePath}`);