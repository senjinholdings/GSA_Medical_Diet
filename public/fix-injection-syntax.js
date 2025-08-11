const fs = require('fs');
const path = require('path');

// 修正するファイル
const filePath = path.join(__dirname, 'injection-lipolysis001/app.js');
let content = fs.readFileSync(filePath, 'utf8');

// パターン1: 孤立したプロパティを削除
// visible: el.offsetParent !== null, などのパターン
content = content.replace(/\n\s+visible:\s+.*?,?\s*\n/g, '\n');
content = content.replace(/\n\s+position:\s+.*?\n\s+}\);/g, '\n});');
content = content.replace(/\n\s+top:\s+.*?,?\s*\n/g, '\n');
content = content.replace(/\n\s+currentScrollY:\s+.*?\n\s+}\);/g, '\n});');
content = content.replace(/\n\s+modal:\s+.*?,?\s*\n/g, '\n');
content = content.replace(/\n\s+close:\s+.*?,?\s*\n/g, '\n');
content = content.replace(/\n\s+overlay:\s+.*?\n\s+}\);/g, '\n});');
content = content.replace(/\n\s+originalStoreName:\s+.*?,?\s*\n/g, '\n');
content = content.replace(/\n\s+clinicName:\s+clinicName,?\s*\n/g, '\n');
content = content.replace(/\n\s+clinicKey:\s+.*?,?\s*\n/g, '\n');
content = content.replace(/\n\s+startsWithClinic:\s+.*?,?\s*\n/g, '\n');
content = content.replace(/\n\s+includesClinicName:\s+.*?\n\s+}\);/g, '\n});');
content = content.replace(/\n\s+modalClinicName:\s+.*?,?\s*\n/g, '\n');
content = content.replace(/\n\s+modalAddress:\s+.*?,?\s*\n/g, '\n');
content = content.replace(/\n\s+modalAccess:\s+.*?,?\s*\n/g, '\n');
content = content.replace(/\n\s+modalMapContainer:\s+.*?\n\s+}\);/g, '\n});');
content = content.replace(/\n\s+generatedUrl:\s+.*?,?\s*\n/g, '\n');
content = content.replace(/\n\s+hasUrlHandler:\s+.*?,?\s*\n/g, '\n');
content = content.replace(/\n\s+hasClinic:\s+.*?\n\s+}\);/g, '\n});');
content = content.replace(/\n\s+text:\s+.*?,?\s*\n/g, '\n');
content = content.replace(/\n\s+href:\s+.*?,?\s*\n/g, '\n');
content = content.replace(/\n\s+className:\s+.*?\n\s+}\);/g, '\n});');

// パターン2: 孤立した }); を削除
content = content.replace(/\n\s+}\);\s*\n\s+}\);\s*\n/g, '\n        });\n');

// ファイルを保存
fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed injection-lipolysis001/app.js');