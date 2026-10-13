// =====================================================================
// 段落「深入解說」用的英文專有名詞小辭典（預先寫好，不呼叫 AI）
// 會自動比對每段英文原文，列出出現的名詞：英文 → 中文 → 一句白話解釋
// g：若名詞辭典（glossaryPlus）有公式與例子，可一鍵打開
// =====================================================================

export interface Term { en: string; zh: string; x: string; g?: string }

export const TERMS: Term[] = [
  // ── 財務與會計 ──
  { en: 'abnormal returns', zh: '超額報酬', x: '股票比「正常應有表現」多賺或少賺的部分。', g: 'Abnormal Return' },
  { en: 'cumulative abnormal returns', zh: '累積超額報酬', x: '把好幾天的超額報酬加起來。', g: 'SCAR' },
  { en: 'SCAR', zh: '標準化累積超額報酬', x: '累積超額報酬再除以平常的波動，方便不同股票比較。', g: 'SCAR' },
  { en: 'CAR', zh: '累積超額報酬', x: '事件前後幾天超額報酬的總和。', g: 'SCAR' },
  { en: 'stock returns', zh: '股票報酬', x: '股價漲跌的百分比。' },
  { en: 'stock price', zh: '股價', x: '一股在市場上的成交價格。' },
  { en: 'firm performance', zh: '企業績效', x: '公司表現好不好，本文用股價的超額報酬來衡量。' },
  { en: 'financial measures', zh: '財務指標', x: '從財報算出的數字，例如營收成長、本益比。' },
  { en: 'summary measures', zh: '總結性指標', x: '把公司表現濃縮成幾個數字的指標，例如盈餘預測、目標價。' },
  { en: 'quantitative measures', zh: '量化指標', x: '可以用數字表示的指標。' },
  { en: 'earnings', zh: '盈餘（獲利）', x: '公司賺到的錢。' },
  { en: 'earnings forecasts', zh: '盈餘預測', x: '分析師預估公司未來會賺多少。' },
  { en: 'target prices', zh: '目標價', x: '分析師認為股價合理應到的價位。' },
  { en: 'cash flows', zh: '現金流量', x: '公司實際流進、流出的現金。' },
  { en: 'revenue', zh: '營收', x: '公司賣東西或服務收到的總金額。' },
  { en: 'sales growth', zh: '營收成長率', x: '這期營收比去年同期多了幾成。', g: 'Sales_growth' },
  { en: 'market value', zh: '市值', x: '股價 × 股數，代表整間公司在市場上值多少錢。', g: 'Size' },
  { en: 'book value', zh: '帳面價值', x: '財報上記錄的股東權益（資產減負債）。' },
  { en: 'market to book', zh: '市值淨值比', x: '市值是帳面價值的幾倍。', g: 'MB_ratio' },
  { en: 'price to earnings', zh: '本益比', x: '股價是每股盈餘的幾倍。', g: 'PE_ratio' },
  { en: 'price to earning', zh: '本益比', x: '股價是每股盈餘的幾倍。', g: 'PE_ratio' },
  { en: 'returns', zh: '報酬率', x: '投資的漲跌幅度。' },
  { en: 'investors', zh: '投資人', x: '買賣股票等資產的人。' },
  { en: 'predictors', zh: '預測變數', x: '用來預測結果的因素。' },
  { en: 'stakeholders', zh: '利害關係人', x: '會受公司影響的人，例如員工、顧客、股東。' },
  { en: 'net income', zh: '淨利', x: '扣掉所有成本與稅之後真正賺到的錢。' },
  { en: 'shareholders', zh: '股東', x: '持有公司股票的人。' },
  { en: 'S&P 500', zh: '標普 500 指數', x: '美國 500 家大型上市公司組成的指數。' },
  { en: 'portfolio', zh: '投資組合', x: '一個人持有的各種投資的集合。' },
  { en: 'turnover', zh: '周轉率', x: '持股換手的頻率，越高代表交易越頻繁。' },
  { en: 'trading', zh: '交易', x: '買賣股票等金融商品。' },
  { en: 'analysts', zh: '分析師', x: '專門研究公司並提出投資建議的人。' },
  { en: '10-K', zh: '10-K 年報', x: '美國上市公司每年向主管機關申報的年度報告。' },
  { en: 'Compustat', zh: 'Compustat 資料庫', x: '收錄美國公司財報數字的商業資料庫。' },
  { en: 'Eventus', zh: 'Eventus 軟體', x: '計算事件研究超額報酬的專業工具。' },
  { en: 'CAPM', zh: '資本資產定價模型', x: '估計股票「合理應賺多少」的公式。', g: 'CAPM' },
  { en: 'event study', zh: '事件研究法', x: '看某個事件（如公告）前後幾天股價有沒有異常變化。' },
  { en: 'event window', zh: '事件窗口', x: '事件研究中觀察股價的那幾天。' },
  { en: 'volatility', zh: '波動度', x: '股價上上下下的幅度。' },
  { en: 'risk premium', zh: '風險溢酬', x: '因為承擔風險而要求多拿的報酬。' },
  { en: 'valuation', zh: '估值', x: '評估一家公司值多少錢。' },
  { en: 'discounted cash flow', zh: '現金流量折現', x: '把未來的現金換算成今天的價值來估價。' },
  { en: 'mean reversion', zh: '均值回歸', x: '表現特別好或特別差之後，常會回到平均水準。' },
  { en: 'alpha', zh: '超額收益（Alpha）', x: '扣除市場影響後，額外多賺的報酬。' },
  { en: 'benchmark', zh: '基準', x: '用來比較好壞的標準，例如大盤或全猜同一邊。', g: 'Accuracy' },
  { en: 'fiscal year', zh: '會計年度', x: '公司計算一年財報的期間。' },
  { en: 'GAAP', zh: '一般公認會計原則', x: '編製財報時共同遵守的會計規則。' },
  { en: 'liquidity', zh: '流動性', x: '資產能不能很快換成現金而不虧太多。' },
  { en: 'mergers', zh: '併購', x: '公司合併或收購其他公司。' },
  { en: 'litigation', zh: '訴訟', x: '打官司。' },
  { en: 'litigious', zh: '訴訟類詞', x: 'LM 詞典中和官司有關的字詞類別。' , g: 'McDonald-Loughran' },
  { en: 'regulatory', zh: '監管的', x: '和主管機關的規定與調查有關。' },
  { en: 'data breach', zh: '資料外洩', x: '公司保管的個資被駭或外流。' },
  { en: 'asset pricing', zh: '資產定價', x: '研究股票等資產價格怎麼決定的學問。' },
  { en: 'efficient', zh: '有效率的（市場）', x: '市場價格已經反映所有公開資訊。' },
  { en: '401(k)', zh: '401(k) 退休計畫', x: '美國常見的員工退休儲蓄帳戶。' },

  // ── 理論 ──
  { en: 'adaptive market hypothesis', zh: '適應性市場假說', x: '市場像生態系一樣會演化，效率會隨環境改變。', g: 'Adaptive Market Hypothesis' },
  { en: 'information theory', zh: '資訊理論', x: '資訊的價值在於降低不確定性。', g: 'Information Theory' },
  { en: 'entropy', zh: '熵', x: '衡量不確定性的指標，越高越難猜。', g: 'Information Theory' },
  { en: 'uncertainty', zh: '不確定性', x: '對未來沒把握的程度。' , g: 'McDonald-Loughran' },
  { en: 'expectation treadmill', zh: '預期踏車效應', x: '期待已經很高時，要一直超乎預期股價才會漲。' },
  { en: 'diminishing', zh: '遞減的', x: '效果越來越小。' },
  { en: 'negativity bias', zh: '負向偏誤', x: '人對壞消息的反應比好消息強烈。' },
  { en: 'prospect theory', zh: '展望理論', x: '人對損失的痛苦大於同樣金額的快樂。' },
  { en: 'behavioral finance', zh: '行為金融學', x: '研究人的心理偏誤如何影響投資的學問。' },
  { en: 'signaling theory', zh: '信號理論', x: '公司的行動會向外界傳遞它內部資訊的訊號。' },
  { en: 'fluency', zh: '流暢性', x: '資訊越容易處理，人越容易喜歡。' },
  { en: 'theory-driven', zh: '理論導向的', x: '先有理論再決定看哪些資料，而不是亂挖資料。' },

  // ── 文字分析 ──
  { en: 'sentiment analysis', zh: '情緒分析', x: '讓電腦判斷文字是正面、負面還是中性。', g: 'Sentiment' },
  { en: 'sentiments', zh: '情緒', x: '文字中透露的好壞態度。', g: 'Sentiment' },
  { en: 'sentiment', zh: '情緒', x: '文字中透露的好壞態度。', g: 'Sentiment' },
  { en: 'opinion mining', zh: '意見探勘', x: '情緒分析的另一個名稱。' },
  { en: 'textual content', zh: '文字內容', x: '文章、報告裡的文字資訊。' , g: 'Quantitizing' },
  { en: 'textual analysis', zh: '文字分析', x: '用電腦方法分析大量文字。' , g: 'Quantitizing' },
  { en: 'text mining', zh: '文字探勘', x: '從大量文字中找出有用資訊。' },
  { en: 'natural language processing', zh: '自然語言處理', x: '讓電腦理解人類語言的技術。' },
  { en: 'lexicon', zh: '詞典', x: '列出每個字屬於哪種情緒的清單。' },
  { en: 'dictionary', zh: '詞典', x: '列出每個字屬於哪種情緒的清單。', g: 'McDonald-Loughran' },
  { en: 'tokenization', zh: '斷詞', x: '把句子切成一個一個的詞。' },
  { en: 'syllabification', zh: '音節化', x: '依音節拆解單字，讓同一字的變化形都能被辨識。' },
  { en: 'word count', zh: '字數', x: '文章的總字數，用來把情緒詞換算成比例。' },
  { en: 'polarity', zh: '極性', x: '情緒是正面還是負面。' },
  { en: 'valence', zh: '價態', x: '情緒的好壞方向。' },
  { en: 'Loughran', zh: 'Loughran-McDonald 金融詞典', x: '專為財經文章設計的情緒詞典。', g: 'McDonald-Loughran' },
  { en: 'Harvard', zh: 'Harvard-IV 詞典', x: '一般用途的情緒詞典，用在財經文章容易誤判。' },
  { en: 'web scraping', zh: '網頁爬取', x: '用程式自動下載網頁內容。' },
  { en: 'crawler', zh: '爬蟲', x: '自動抓網頁的程式。' },
  { en: 'Python', zh: 'Python 程式語言', x: '常用來抓資料和做分析的程式語言。' },
  { en: 'topic modeling', zh: '主題模型', x: '讓電腦從大量文章中自動找出主題。' },
  { en: 'large language model', zh: '大型語言模型', x: '像 ChatGPT、Gemini 這類能理解與產生文字的 AI。' },
  { en: 'Wall Street Journal', zh: '《華爾街日報》', x: '美國重要的財經報紙。' },
  { en: 'business journals', zh: '商業報刊', x: '報導企業與財經新聞的報紙雜誌。' },
  { en: 'microblogs', zh: '微網誌', x: '像推特、微博這類短文社群平台。' },
  { en: 'online reviews', zh: '線上評論', x: '消費者在網路上留下的評價。' },

  // ── 統計與計量 ──
  { en: 'econometrics', zh: '計量經濟學', x: '用統計方法檢驗經濟問題的學問。' },
  { en: 'econometric', zh: '計量經濟的', x: '用統計方法檢驗經濟關係的。' },
  { en: 'regression', zh: '迴歸', x: '用一組變數去解釋另一個變數的統計方法。' },
  { en: 'panel data', zh: '追蹤（面板）資料', x: '同一群對象在不同時間被重複觀察的資料。', g: 'GEE' },
  { en: 'longitudinal', zh: '縱貫的', x: '同一對象隨時間追蹤觀察的。', g: 'GEE' },
  { en: 'generalized estimating equations', zh: '廣義估計方程式', x: '考慮同一對象前後相關的迴歸方法。', g: 'GEE' },
  { en: 'GEE', zh: '廣義估計方程式', x: '考慮同一對象前後相關的迴歸方法。', g: 'GEE' },
  { en: 'working correlation', zh: '工作相關結構', x: 'GEE 中對同一公司前後資料相關程度的假設。', g: 'GEE' },
  { en: 'autocorrelation', zh: '自我相關', x: '同一對象前後時間的資料互相關聯。', g: 'Autocorrelation' },
  { en: 'exchangeable', zh: '可交換結構', x: '假設同一公司任兩個時間點的相關都一樣。', g: 'GEE' },
  { en: 'QIC', zh: 'QIC 準則', x: '比較 GEE 模型哪個比較合適，越小越好。', g: 'QIC' },
  { en: 'fixed effect', zh: '固定效果', x: '先扣掉每家公司天生不同的特質。', g: 'Fixed Effects' },
  { en: 'random effect', zh: '隨機效果', x: '假設各公司的差異是隨機的。', g: 'Fixed Effects' },
  { en: 'interaction', zh: '交互作用', x: '一個因素的效果會被另一個因素放大或縮小。', g: 'Interaction Term' },
  { en: 'moderate', zh: '調節', x: '改變另一個關係的強弱或方向。', g: 'Interaction Term' },
  { en: 'direct effects', zh: '直接效果（主效果）', x: '一個變數本身對結果的影響。' },
  { en: 'main effect', zh: '主效果', x: '一個變數本身對結果的影響。' },
  { en: 'coefficient', zh: '係數', x: '變數每增加一單位，結果平均變化多少。' },
  { en: 'standard error', zh: '標準誤', x: '估計值可能的誤差大小。', g: 'Standard Error' },
  { en: 'significant', zh: '顯著的', x: '統計上不太可能只是巧合。', g: 'p-value' },
  { en: 'p <', zh: 'p 值', x: '如果其實沒有效果，看到這種結果的機率。', g: 'p-value' },
  { en: 'robustness', zh: '穩健性', x: '換方法或定義後，結論還是成立。' },
  { en: 'operationalization', zh: '操作型定義', x: '把抽象概念變成可以實際測量的方法。' },
  { en: 'mean centering', zh: '平均數中心化', x: '每個數值減去平均數，讓 0 代表平均。', g: 'Mean Centering' },
  { en: 'multicollinearity', zh: '多元共線性', x: '幾個變數彼此太相似，難以分辨各自的影響。' },
  { en: 'control variables', zh: '控制變數', x: '先扣掉其他可能的影響因素。', g: 'Prior_SCAR' },
  { en: 'confounding', zh: '混淆', x: '另一個因素同時影響原因和結果，造成誤判。' },
  { en: 'omitted variable', zh: '遺漏變數', x: '模型漏掉重要變數，導致結果偏誤。' },
  { en: 'causal', zh: '因果的', x: '一件事造成另一件事。' },
  { en: 'hypothesis', zh: '假說', x: '研究前提出、等待驗證的預測。' },
  { en: 'dependent variable', zh: '應變數', x: '研究想解釋的結果，本文是 SCAR。' },
  { en: 'standardized', zh: '標準化的', x: '調整成可以互相比較的尺度。' },
  { en: 'outliers', zh: '極端值', x: '跟其他資料差很多的少數數值。' },
  { en: 'look-ahead bias', zh: '前視偏誤', x: '不小心用到當時還不知道的未來資訊。', g: 'Data Leakage' },
  { en: 'data leakage', zh: '資料洩漏', x: '模型訓練時偷看到答案，準確率高得不合理。', g: 'Data Leakage' },
  { en: 'overfitting', zh: '過度配適', x: '模型把練習題背得太熟，遇到新題目就失靈。' , g: 'Train-Test Split' },
  { en: 'generalizability', zh: '可推廣性', x: '結論能不能套用到其他對象或情境。' },
  { en: 'validity', zh: '效度', x: '有沒有真的測到想測的東西。' },
  { en: 'reliability', zh: '信度', x: '重複測量時結果穩不穩定。' },
  { en: 'chi2', zh: '卡方統計量', x: '檢驗模型整體是否顯著的統計量。' },
  { en: 'F-statistic', zh: 'F 統計量', x: '檢驗模型整體是否顯著的統計量。' },
  { en: 'Wald', zh: 'Wald 檢定', x: '檢驗係數是否為零的統計方法。' },

  // ── 機器學習 ──
  { en: 'machine learning', zh: '機器學習', x: '讓電腦從資料中自己找出規律來預測。' },
  { en: 'predictive analytics', zh: '預測分析', x: '用資料和模型預測未來。' },
  { en: 'classification', zh: '分類', x: '預測屬於哪一類，例如會漲或會跌。' },
  { en: 'binary', zh: '二元的', x: '只有兩種結果，例如是／否、漲／跌。' },
  { en: 'accuracy', zh: '準確率', x: '猜對的比例，要和基準比較才有意義。', g: 'Accuracy' },
  { en: 'AUC', zh: 'AUC（曲線下面積）', x: '模型分辨好壞的能力，0.5 等於亂猜。', g: 'AUC' },
  { en: 'MAE', zh: '平均絕對誤差', x: '預測值和實際值平均差多少。' },
  { en: 'RMSE', zh: '均方根誤差', x: '預測誤差的平均大小，對大錯誤懲罰較重。' },
  { en: 'R²', zh: '判定係數', x: '模型能解釋多少比例的變化，負值代表比亂猜還差。' },
  { en: 'training set', zh: '訓練集', x: '讓模型練習用的資料。' , g: 'Train-Test Split' },
  { en: 'validation set', zh: '驗證集', x: '用來測試模型、模型練習時沒看過的資料。' , g: 'Train-Test Split' },
  { en: 'boosted decision tree', zh: '提升決策樹', x: '很多棵小決策樹接力修正錯誤的模型。' },
  { en: 'decision forest', zh: '決策森林', x: '很多棵決策樹投票決定答案的模型。' },
  { en: 'random forest', zh: '隨機森林', x: '很多棵決策樹投票決定答案的模型。' },
  { en: 'decision jungle', zh: '決策叢林', x: '決策森林的變形，較省記憶體。' },
  { en: 'neural network', zh: '神經網路', x: '模仿大腦神經元連結、能學複雜關係的模型。' },
  { en: 'logistic regression', zh: '邏輯迴歸', x: '預測「是或否」機率的經典統計模型。' },
  { en: 'support vector machine', zh: '支持向量機', x: '找一條最能分開兩類資料的界線的模型。' },
  { en: 'SVM', zh: '支持向量機', x: '找一條最能分開兩類資料的界線的模型。' },
  { en: 'Bayes point machine', zh: '貝氏點機', x: '一種用機率觀點找分類界線的模型。' },
  { en: 'averaged perceptron', zh: '平均感知器', x: '最簡單的神經網路分類器之一。' },
  { en: 'Bayesian linear regression', zh: '貝氏線性迴歸', x: '用機率方式估計的線性迴歸。' },
  { en: 'features', zh: '特徵', x: '餵給模型的輸入變數。' },
  { en: 'algorithms', zh: '演算法', x: '電腦解決問題的步驟方法。' },

  // ── 研究方法 ──
  { en: 'mixed-methods', zh: '混合方法', x: '同一研究結合量化與質性方法。', g: 'Mixed Methods Research' },
  { en: 'mixed methods', zh: '混合方法', x: '同一研究結合量化與質性方法。', g: 'Mixed Methods Research' },
  { en: 'quantitative', zh: '量化的', x: '用數字和統計來研究。' },
  { en: 'qualitative', zh: '質性的', x: '用文字、訪談、觀察來理解意義與原因。' },
  { en: 'triangulation', zh: '三角校正', x: '用不同資料、方法或理論看同一件事，互相印證。', g: 'Triangulation' },
  { en: 'pragmatism', zh: '實用主義', x: '能解決問題的方法就是好方法。', g: 'Pragmatism' },
  { en: 'meta-inference', zh: '元推論', x: '把質性和量化的發現合起來得到更完整的結論。', g: 'Meta-Inference' },
  { en: 'synergistic', zh: '協同的', x: '合在一起的效果大於各自加總。' },
  { en: 'framework', zh: '架構', x: '研究的整體設計藍圖。' },
  { en: 'business analytics', zh: '商業分析', x: '用資料與分析方法協助商業決策。' },
  { en: 'information systems', zh: '資訊系統（學門）', x: '研究資訊科技如何被組織與人使用的領域。' },
  { en: 'exemplar', zh: '範例', x: '示範怎麼做的代表性研究。' },
  { en: 'content analysis', zh: '內容分析', x: '有系統地閱讀並歸類文件內容的方法。' },
  { en: 'experiment', zh: '實驗', x: '控制條件、比較不同處理效果的研究方法。' },
  { en: 'multi-study', zh: '多研究設計', x: '一篇論文裡做好幾個研究互相支持。' },
  { en: 'generalizability', zh: '可推廣性', x: '結論能不能套用到其他情境。' },

  // ── 對照文獻 ──
  { en: 'logo', zh: '品牌標誌', x: '公司或品牌的識別圖案。' },
  { en: 'dynamic', zh: '動態的', x: '會動的，例如動畫標誌。' },
  { en: 'hedonic', zh: '享樂型', x: '為了開心、享受而買的產品，例如零食、遊戲。' },
  { en: 'utilitarian', zh: '實用型', x: '為了功能而買的產品，例如文具、清潔用品。' },
  { en: 'boycott', zh: '抵制', x: '集體拒絕購買或合作，表達立場。' },
  { en: 'corporate social advocacy', zh: '企業社會倡議', x: '企業公開表態支持某個社會議題。' },
  { en: 'legitimacy', zh: '正當性', x: '行為被社會認為合理、可接受。' },
  { en: 'stakeholder', zh: '利害關係人', x: '會受公司影響的人，例如員工、顧客、股東。' },
  { en: 'textual data', zh: '文字資料', x: '以文字形式存在的資料，例如新聞、報告。', g: 'Quantitizing' },
  { en: 'textual information', zh: '文字資訊', x: '從文章、報導中得到的資訊。', g: 'Quantitizing' },
  { en: 'affective', zh: '情感性的', x: '和情緒有關的，本文指正面、負面情緒字詞。', g: 'Sentiment' },
  { en: 'validation', zh: '驗證', x: '用模型沒看過的資料檢查它準不準。', g: 'Train-Test Split' },
  { en: 'press releases', zh: '新聞稿', x: '公司主動對外發布的正式聲明。' },
];

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** 找出段落英文中出現的名詞（長詞優先、去重） */
export function findTerms(text: string, max = 14): Term[] {
  const lower = text.toLowerCase();
  const sorted = [...TERMS].sort((a, b) => b.en.length - a.en.length);
  const found: Term[] = [];
  const taken: Array<[number, number]> = [];
  const seenZh = new Set<string>();
  for (const t of sorted) {
    const re = new RegExp(`(^|[^a-z])${esc(t.en.toLowerCase())}(?=$|[^a-z])`, 'i');
    const m = re.exec(lower);
    if (!m) continue;
    const start = m.index + m[1].length;
    const end = start + t.en.length;
    if (taken.some(([a, b]) => start < b && end > a)) continue; // 已被較長的詞涵蓋
    if (seenZh.has(t.zh)) continue;
    taken.push([start, end]);
    seenZh.add(t.zh);
    found.push({ ...t, en: text.slice(start, end) });
  }
  // 依原文出現順序排列
  return found.sort((a, b) => lower.indexOf(a.en.toLowerCase()) - lower.indexOf(b.en.toLowerCase())).slice(0, max);
}
