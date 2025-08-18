#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import csv
import json
import sys

def convert_csv_to_json(csv_file_path, json_file_path):
    """
    CSVファイルをJSONに変換
    2つの「費用」フィールドを区別して処理
    """
    
    # CSVファイルを読み込み
    with open(csv_file_path, 'r', encoding='utf-8') as csv_file:
        csv_reader = csv.reader(csv_file)
        headers = next(csv_reader)  # ヘッダー行を読み込み
        
        # データを格納する辞書
        clinic_data = {}
        
        # 各クリニック名をキーとして初期化
        for i in range(2, len(headers)):
            clinic_name = headers[i]
            if clinic_name:
                clinic_data[clinic_name] = {}
        
        # データ行を読み込み
        fee_count = 0  # 費用フィールドのカウンター
        for row in csv_reader:
            if len(row) < 3:
                continue
                
            field_name = row[0]
            
            # 費用フィールドの処理
            if field_name == "費用":
                fee_count += 1
                if fee_count == 1:
                    # 1つ目の費用 = 比較表用
                    actual_field_name = "費用"  # 比較表用（既存のキー名を維持）
                elif fee_count == 2:
                    # 2つ目の費用 = 詳細セクション用
                    actual_field_name = "詳細費用"  # 新しいキー名
                else:
                    continue
            else:
                actual_field_name = field_name
            
            # 各クリニックのデータを設定
            for i in range(2, min(len(headers), len(row))):
                clinic_name = headers[i]
                if clinic_name and clinic_name in clinic_data:
                    value = row[i] if i < len(row) else ""
                    clinic_data[clinic_name][actual_field_name] = value
        
        # 比較表ヘッダー設定と詳細フィールドマッピングを追加
        clinic_data["比較表ヘッダー設定"] = {
            "ヘッダー1": "費用",
            "ヘッダー2": "特徴",
            "ヘッダー3": "矯正範囲",
            "ヘッダー4": "目安期間",
            "ヘッダー5": "通院頻度",
            "ヘッダー6": "実績/症例数",
            "ヘッダー7": "ワイヤー矯正の紹介",
            "ヘッダー8": "サポート"
        }
        
        clinic_data["詳細フィールドマッピング"] = {
            "priceDetail": "詳細費用",  # 詳細セクション用の費用フィールドを指定
            "planCount": "特徴タグ",
            "periods": "営業時間",
            "stores": "店舗"
        }
    
    # JSONファイルに書き込み
    with open(json_file_path, 'w', encoding='utf-8') as json_file:
        json.dump(clinic_data, json_file, ensure_ascii=False, indent=2)
    
    print(f"✅ JSONファイルを更新しました: {json_file_path}")
    print(f"📝 費用フィールドを分離:")
    print(f"   - '費用': 比較表用")
    print(f"   - '詳細費用': 詳細セクション用")

if __name__ == "__main__":
    csv_path = "/Users/hattaryoga/Desktop/kiro_2_サイト構成分析/public/mouthpiece002/data/clinic-texts.csv"
    json_path = "/Users/hattaryoga/Desktop/kiro_2_サイト構成分析/public/mouthpiece002/data/clinic-texts.json"
    
    convert_csv_to_json(csv_path, json_path)