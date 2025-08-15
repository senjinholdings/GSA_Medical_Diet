const fs = require('fs');
const path = require('path');

// Read clinic-texts.json
const clinicTexts = JSON.parse(fs.readFileSync(path.join(__dirname, 'clinic-texts.json'), 'utf8'));

// Define the clinics based on clinic-texts.json
const clinics = [
    {
        id: "1",
        code: "omt",
        name: "Oh my teeth",
        regions: ["013", "014", "023", "027", "028", "040"], // 主要都市
        stores: [
            { id: "1", name: "新宿店", address: "東京都新宿区", zipcode: "160-0022", access: "新宿駅徒歩3分" },
            { id: "2", name: "池袋店", address: "東京都豊島区", zipcode: "171-0022", access: "池袋駅徒歩5分" },
            { id: "3", name: "表参道店", address: "東京都港区", zipcode: "107-0061", access: "表参道駅徒歩2分" },
            { id: "4", name: "有楽町店", address: "東京都千代田区", zipcode: "100-0006", access: "有楽町駅徒歩1分" },
            { id: "5", name: "心斎橋店", address: "大阪府大阪市", zipcode: "542-0081", access: "心斎橋駅徒歩3分" },
            { id: "6", name: "梅田店", address: "大阪府大阪市", zipcode: "530-0001", access: "梅田駅徒歩5分" },
            { id: "7", name: "名古屋店", address: "愛知県名古屋市", zipcode: "450-0002", access: "名古屋駅徒歩3分" },
            { id: "8", name: "博多店", address: "福岡県福岡市", zipcode: "812-0011", access: "博多駅徒歩5分" }
        ]
    },
    {
        id: "2",
        code: "inv",
        name: "インビザライン",
        regions: ["013", "014", "023", "027", "028", "040", "011", "012"], // 全国展開
        stores: [
            { id: "9", name: "東京院", address: "東京都中央区", zipcode: "104-0061", access: "銀座駅徒歩2分" },
            { id: "10", name: "横浜院", address: "神奈川県横浜市", zipcode: "220-0011", access: "横浜駅徒歩3分" },
            { id: "11", name: "大阪院", address: "大阪府大阪市", zipcode: "530-0001", access: "大阪駅徒歩5分" },
            { id: "12", name: "名古屋院", address: "愛知県名古屋市", zipcode: "450-0002", access: "名古屋駅徒歩3分" }
        ]
    },
    {
        id: "3",
        code: "ws",
        name: "ウィスマイル",
        regions: ["013", "014", "027", "028", "040"],
        stores: [
            { id: "13", name: "渋谷店", address: "東京都渋谷区", zipcode: "150-0002", access: "渋谷駅徒歩5分" },
            { id: "14", name: "新宿店", address: "東京都新宿区", zipcode: "160-0022", access: "新宿駅徒歩3分" },
            { id: "15", name: "大阪店", address: "大阪府大阪市", zipcode: "542-0081", access: "心斎橋駅徒歩5分" }
        ]
    },
    {
        id: "4",
        code: "kireiline",
        name: "キレイライン矯正",
        regions: ["013", "014", "023", "027", "028", "040", "011"],
        stores: [
            { id: "16", name: "東京院", address: "東京都千代田区", zipcode: "100-0005", access: "東京駅徒歩5分" },
            { id: "17", name: "新宿院", address: "東京都新宿区", zipcode: "160-0023", access: "新宿駅徒歩3分" },
            { id: "18", name: "横浜院", address: "神奈川県横浜市", zipcode: "220-0011", access: "横浜駅徒歩3分" },
            { id: "19", name: "大阪院", address: "大阪府大阪市", zipcode: "530-0001", access: "大阪駅徒歩5分" },
            { id: "20", name: "名古屋院", address: "愛知県名古屋市", zipcode: "450-0002", access: "名古屋駅徒歩3分" }
        ]
    },
    {
        id: "5",
        code: "zenyum",
        name: "ゼニュム",
        regions: ["013", "014", "027", "028"],
        stores: [
            { id: "21", name: "表参道店", address: "東京都港区", zipcode: "107-0061", access: "表参道駅徒歩3分" },
            { id: "22", name: "銀座店", address: "東京都中央区", zipcode: "104-0061", access: "銀座駅徒歩2分" },
            { id: "23", name: "大阪店", address: "大阪府大阪市", zipcode: "542-0081", access: "心斎橋駅徒歩5分" }
        ]
    }
];

// Create regions (simplified)
const regions = [
    { id: "011", name: "埼玉", parentId: null },
    { id: "012", name: "千葉", parentId: null },
    { id: "013", name: "東京", parentId: null },
    { id: "014", name: "神奈川", parentId: null },
    { id: "023", name: "愛知", parentId: null },
    { id: "027", name: "大阪", parentId: null },
    { id: "028", name: "兵庫", parentId: null },
    { id: "040", name: "福岡", parentId: null }
];

// Create rankings - different for each region
const rankings = {
    "013": { // 東京
        "no1": "1",  // Oh my teeth
        "no2": "4",  // キレイライン矯正
        "no3": "2",  // インビザライン
        "no4": "3",  // ウィスマイル
        "no5": "5"   // ゼニュム
    },
    "014": { // 神奈川
        "no1": "1",  // Oh my teeth
        "no2": "2",  // インビザライン
        "no3": "4",  // キレイライン矯正
        "no4": "3",  // ウィスマイル
        "no5": "5"   // ゼニュム
    },
    "027": { // 大阪
        "no1": "1",  // Oh my teeth
        "no2": "4",  // キレイライン矯正
        "no3": "3",  // ウィスマイル
        "no4": "2",  // インビザライン
        "no5": "5"   // ゼニュム
    },
    "023": { // 愛知
        "no1": "1",  // Oh my teeth
        "no2": "2",  // インビザライン
        "no3": "4",  // キレイライン矯正
        "no4": "3",  // ウィスマイル
        "no5": "-"
    },
    "040": { // 福岡
        "no1": "1",  // Oh my teeth
        "no2": "4",  // キレイライン矯正
        "no3": "2",  // インビザライン
        "no4": "3",  // ウィスマイル
        "no5": "5"   // ゼニュム
    },
    "011": { // 埼玉
        "no1": "4",  // キレイライン矯正
        "no2": "2",  // インビザライン
        "no3": "-",
        "no4": "-",
        "no5": "-"
    },
    "012": { // 千葉
        "no1": "2",  // インビザライン
        "no2": "-",
        "no3": "-",
        "no4": "-",
        "no5": "-"
    },
    "028": { // 兵庫
        "no1": "1",  // Oh my teeth
        "no2": "4",  // キレイライン矯正
        "no3": "2",  // インビザライン
        "no4": "3",  // ウィスマイル
        "no5": "5"   // ゼニュム
    }
};

// Create storeViews
const storeViews = {};
Object.keys(rankings).forEach(regionId => {
    storeViews[regionId] = {};
    clinics.forEach(clinic => {
        if (clinic.regions.includes(regionId)) {
            const stores = clinic.stores.filter(store => {
                // Simple region matching based on address
                if (regionId === "013" && store.address.includes("東京都")) return true;
                if (regionId === "014" && store.address.includes("神奈川県")) return true;
                if (regionId === "027" && store.address.includes("大阪府")) return true;
                if (regionId === "023" && store.address.includes("愛知県")) return true;
                if (regionId === "040" && store.address.includes("福岡県")) return true;
                return false;
            });
            if (stores.length > 0) {
                storeViews[regionId][clinic.code + "_stores"] = stores.map(s => s.id);
            }
        }
    });
});

// Create campaigns (empty for now)
const campaigns = [];

// Create the compiled data
const compiledData = {
    regions,
    clinics,
    rankings,
    storeViews,
    campaigns
};

// Write the file
fs.writeFileSync(
    path.join(__dirname, 'compiled-data.json'),
    JSON.stringify(compiledData, null, 2),
    'utf8'
);

console.log('compiled-data.json has been created successfully!');