export interface PaperParagraph {
  id: string;
  en: string;
  zh: string;
  section: string;
  subSection?: string;
  glossaryTerms?: string[];
  note?: string;
  pdfPage?: string;
  /** 原文校對分類（見 paperAudit.ts） */
  kind?: 'original' | 'table' | 'reference' | 'extended';
}

export interface PaperTableData {
  id: string;
  titleEn: string;
  titleZh: string;
  description: string;
  headers: string[];
  rows: (string | number)[][];
  footer?: string;
}

export const ORIGINAL_PAPER_SOURCE = {
  titleEn: "Mixed-methods research in the age of analytics, an exemplar leveraging sentiments from news articles to predict firm performance",
  titleZh: "分析學時代的混合方法研究：以新聞情緒預測企業績效之典範",
  journal: "International Journal of Information Management (IJIM)",
  journalImpact: "SSCI Q1 頂級頂尖期刊 (Impact Factor: 18.9+)",
  volume: "Volume 64, June 2022, 102451",
  doi: "10.1016/j.ijinfomgt.2021.102451",
  doiUrl: "https://doi.org/10.1016/j.ijinfomgt.2021.102451",
  scienceDirectUrl: "https://www.sciencedirect.com/science/article/pii/S0268401221001444",
  googleScholarUrl: "https://scholar.google.com/scholar?q=Mixed+Methods+Research+in+the+Age+of+Analytics+Raji+Raman+Viswanath+Venkatesh",
  authors: [
    { name: "Raji Raman", affil: "Pamplin College of Business, Virginia Tech" },
    { name: "Ruba Aljafari", affil: "Katz Graduate School of Business, University of Pittsburgh" },
    { name: "Viswanath Venkatesh", affil: "Pamplin College of Business, Virginia Tech（通訊作者）" },
    { name: "Vernon Richardson", affil: "Walton College of Business, University of Arkansas" }
  ],
  apaCitation: "Raman, R., Aljafari, R., Venkatesh, V., & Richardson, V. (2022). Mixed-methods research in the age of analytics, an exemplar leveraging sentiments from news articles to predict firm performance. International Journal of Information Management, 64, 102451.",
  bibtex: `@article{raman2022mixed,
  title={Mixed-methods research in the age of analytics, an exemplar leveraging sentiments from news articles to predict firm performance},
  author={Raman, Raji and Aljafari, Ruba and Venkatesh, Viswanath and Richardson, Vernon},
  journal={International Journal of Information Management},
  volume={64},
  pages={102451},
  year={2022},
  publisher={Elsevier},
  doi={10.1016/j.ijinfomgt.2021.102451}
}`
};

export const WANG_2023_SOURCE = {
  titleEn: "The Impacts of Logo Dynamism and Product Types on Brand Market Performance",
  titleZh: "標誌動態性與產品類型對品牌市場績效之影響：四重量化設計（/MMR文獻篩選 反例比較）",
  journal: "Journal of Business Research (JBR)",
  journalImpact: "SSCI Q1 頂級頂尖期刊 (Impact Factor: 10.5+ / JCR Q1)",
  volume: "Volume 166, November 2023, 114060",
  doi: "10.1016/j.jbusres.2023.114060",
  doiUrl: "https://doi.org/10.1016/j.jbusres.2023.114060",
  scienceDirectUrl: "https://www.sciencedirect.com/science/article/pii/S0148296323004186?casa_token=x_GFXZM-9JIAAAAA:9kUsr8s3TJuqCW3K1EFOJfYliL-vRfZUb1-dsEqNybUl5wfGKGuxRL-vpgA4JwVW6uciJ1CyeIQ",
  researchGateUrl: "https://www.researchgate.net/publication/371981313_The_impacts_of_logo_dynamism_and_product_types_on_brand_market_performance",
  googleScholarUrl: "https://scholar.google.com/scholar?q=The+impacts+of+logo+dynamism+and+product+types+on+brand+market+performance+Wang+Liu+Chen",
  authors: [
    { name: "X. Wang", affil: "Business School, Sun Yat-sen University" },
    { name: "H. Liu", affil: "Department of Marketing, Hong Kong Polytechnic University" },
    { name: "H. Chen", affil: "Faculty of Business and Economics, University of Hong Kong" }
  ],
  apaCitation: "Wang, X., Liu, H., & Chen, H. (2023). The impacts of logo dynamism and product types on brand market performance. Journal of Business Research, 166, 114060.",
  bibtex: `@article{wang2023impacts,
  title={The impacts of logo dynamism and product types on brand market performance},
  author={Wang, X. and Liu, H. and Chen, H.},
  journal={Journal of Business Research},
  volume={166},
  pages={114060},
  year={2023},
  publisher={Elsevier},
  doi={10.1016/j.jbusres.2023.114060}
}`
};

export const WANG_2023_PARAGRAPHS: PaperParagraph[] = [
  {
    id: 'wang-meta-1',
    section: 'meta',
    subSection: '文獻引用與出處資訊 (Wang et al., 2023 JBR)',
    pdfPage: 'PDF P.1 (封面與引用)',
    en: 'Wang, X., Liu, H., & Chen, H. (2023). The impacts of logo dynamism and product types on brand market performance. Journal of Business Research, 166, 114060. DOI: 10.1016/j.jbusres.2023.114060.',
    zh: 'Wang, X., Liu, H., & Chen, H. (2023). 標誌動態性與產品類型對品牌市場績效之影響。《Journal of Business Research》，166, 114060。',
  },
  {
    id: 'wang-abs-1',
    section: 'abstract',
    subSection: '摘要：品牌標誌變更與股票市場異常報酬 (反例比較)',
    pdfPage: 'PDF P.1 (摘要)',
    en: 'Branding literature has increasingly focused on visual identity modifications. In this study, we examine how logo dynamism (static vs. dynamic logos) influences brand market performance using a mixed-methods approach combining Forbes brand data, Hong Kong Stock Market Event Study (abnormal returns), and controlled experiments.',
    zh: '品牌行銷文獻日益關注視覺識別系統之修改。本研究採用混合方法（結合 Forbes 品牌資料、香港股市事件研究之異常報酬分析、以及控制實驗），探討標誌動態性（靜態與動態標誌）如何影響品牌市場績效。',
    glossaryTerms: ['Mixed Methods Research', 'SCAR'],
  },
  {
    id: 'wang-intro-1',
    section: 'intro',
    subSection: '1. 引言：視覺識別與股票市場的交會',
    pdfPage: 'PDF P.2-3 (引言)',
    en: 'Corporate visual identity (CVI) changes, particularly logo redesigns, are strategic investments. While static logo changes have been extensively studied, the recent surge in dynamic (animated or kinetic) logos demands rigorous empirical scrutiny. We investigate whether dynamic logos signal forward-looking innovativeness to financial markets.',
    zh: '企業視覺識別（CVI）變更，特別是標誌重新設計，是一項戰略投資。雖然靜態標誌變更已被廣泛研究，但近期動態（動畫或動態）標誌的激增需要嚴格的實證檢驗。我們探討動態標誌是否向金融市場傳遞了前瞻性創新信號。',
  },
  {
    id: 'wang-theory-1',
    section: 'theory',
    subSection: '2. 理論基礎：信號理論與視覺參與 (Visual Engagement)',
    pdfPage: 'PDF P.4-5 (理論基礎)',
    en: 'Drawing on signaling theory and fluency theory, we argue that dynamic logos capture consumer attention and communicate brand modernity. However, the market payoff depends critically on product types (hedonic vs. utilitarian) because visual dynamism aligns better with sensory-rich hedonic consumption.',
    zh: '借鑒信號理論與流暢性理論，我們認為動態標誌能吸引消費者注意力並傳遞品牌現代感。然而，市場回報很大程度上取決於產品類型（享樂型與實用型），因為視覺動態性與感官豐富的享樂型消費更為契合。',
  },
  {
    id: 'wang-methods-1',
    section: 'methods',
    subSection: '3. 研究方法：多研究設計 (Multi-study Design)',
    pdfPage: 'PDF P.6-8 (研究方法)',
    en: 'To establish robust conclusions, we deploy a multi-study quantitative design: Study 1 uses secondary event study methodology on 205 announcements from the Hong Kong Stock Market (2014–2018) to measure CAR [-1, +1]. Studies 2 and 3 utilize controlled laboratory experiments with 450+ consumers to unpack the underlying psychological mechanisms (brand attitude and purchase intention).',
    zh: '為建立穩健結論，我們部署了多研究量化設計：研究 1 採用香港股市（2014–2018）205 個公告的次級事件研究法來測量 CAR [-1, +1]；研究 2 與研究 3 則利用 450 多名消費者的控制實驗，解構底層心理機制（品牌態度與購買意願）。',
  },
  {
    id: 'wang-results-1',
    section: 'results',
    subSection: '4. 實證結果：動態標誌之正面超額報酬 (+1.84%)',
    pdfPage: 'PDF P.9-11 (實證結果)',
    en: 'Event study results show that dynamic logo updates generate significantly higher abnormal returns (CAR = +1.84%, t = 4.21, p < 0.001) compared to static logo updates (+0.42%, t = 1.45, not significant). Furthermore, product type moderates this effect, showing stronger market valuation for hedonic brands.',
    zh: '事件研究結果顯示，相較於靜態標誌更新（+0.42%, t = 1.45, 不顯著），動態標誌更新能產生顯著更高的異常報酬（CAR = +1.84%, t = 4.21, p < 0.001）。此外，產品類型會調節此效果，對享樂型品牌展現出更強的市場估值提升。',
  },
  {
    id: 'wang-discussion-1',
    section: 'discussion',
    subSection: '5. 討論與反例判定：為什麼這不是典型 MMR？',
    pdfPage: 'PDF P.12-14 (討論與意涵)',
    en: 'While the paper explicitly states "mixed-methods are employed" in the abstract, our rigorous methodological audit classifies this as a Multi-study Quantitative Design rather than Mixed Methods Research (MMR). It successfully combines secondary financial market data with primary experiments, but lacks qualitative textual coding or qualitative data integration.',
    zh: '雖然文章摘要明確聲稱「使用了混合方法」，但經過我們嚴格的方法論審查，這應歸類為多研究量化設計（Multi-study Quantitative Design）而非真正混合方法研究（MMR）。它成功結合了次級金融市場數據與一級實驗，但缺乏質性文本編碼或質性資料整合。',
  }
];

export const WANG_2023_TABLES: PaperTableData[] = [
  {
    id: 'wang-table-1',
    titleEn: 'Table 1. Event Study Cumulative Abnormal Returns (CAR) for Logo Dynamism',
    titleZh: '表 1. 標誌動態性之事件研究累積異常報酬 (CAR) 實證結果',
    description: '香港股市 205 個標誌變更事件之市場反應比較',
    headers: ['標誌類型 (Logo Type)', '樣本數 (N)', 'CAR [-1, +1]', 't 統計量 (t-value)', 'p 值'],
    rows: [
      ['Static Logo Redesign (靜態標誌更新)', '118', '+0.42%', '1.45', '0.148 (Not Sig.)'],
      ['Dynamic Logo Redesign (動態標誌更新)', '87', '+1.84%', '4.21', '< 0.001 (***)'],
      ['Difference (動態 vs 靜態)', '-', '+1.42%', '3.12', '< 0.01 (**)'],
    ],
    footer: '註記: *** p < 0.001, ** p < 0.01。樣本涵蓋香港股市 2014-2018 年上市公司。'
  }
];

export const AFEGO_2021_SOURCE = {
  titleEn: "What Does Corporate Social Advocacy Signal? Evidence from Boycott Participation Decisions",
  titleZh: "企業社會倡議傳遞了什麼信號？來自抵制參與決策的實證研究",
  journal: "Journal of Capital Markets Studies (JCMS)",
  journalImpact: "Emerald 開放取用期刊（非 SSCI）",
  volume: "Volume 5, Issue 1, 2021, pp. 49–68",
  doi: "10.1108/JCMS-10-2020-0040",
  doiUrl: "https://doi.org/10.1108/JCMS-10-2020-0040",
  scienceDirectUrl: "https://www.emerald.com/insight/content/doi/10.1108/JCMS-10-2020-0040/full/html",
  googleScholarUrl: "https://scholar.google.com/scholar?q=What+does+corporate+social+advocacy+signal+Evidence+from+boycott+participation+decisions+Afego+Alagidede",
  authors: [
    { name: "Pyemo N. Afego", affil: "（所屬機構請以原文核對）" },
    { name: "Imhotep P. Alagidede", affil: "（所屬機構請以原文核對）" }
  ],
  apaCitation: "Afego, P. N., & Alagidede, I. P. (2021). What does corporate social advocacy signal? Evidence from boycott participation decisions. Journal of Capital Markets Studies, 5(1), 49–68.",
  bibtex: `@article{afego2021what,
  title={What does corporate social advocacy signal? Evidence from boycott participation decisions},
  author={Afego, Pyemo N. and Alagidede, Imhotep P.},
  journal={Journal of Capital Markets Studies},
  volume={5},
  number={1},
  pages={49--68},
  year={2021},
  publisher={Emerald Publishing Limited},
  doi={10.1108/JCMS-10-2020-0040}
}`
};

// 依原文全文（University of Pretoria 典藏 PDF，CC BY 4.0）整理；非逐字翻譯，數字皆取自原文
export const AFEGO_2021_PARAGRAPHS: PaperParagraph[] = [
  {
    id: 'afego-meta-1',
    section: 'meta',
    subSection: '文獻引用與出處資訊 (Afego & Alagidede, 2021 JCMS)',
    pdfPage: '書目',
    en: 'Afego, P. N., & Alagidede, I. P. (2021). What does corporate social advocacy signal? Evidence from boycott participation decisions. Journal of Capital Markets Studies, 5(1), 49–68. https://doi.org/10.1108/JCMS-10-2020-0040 (CC BY 4.0). Keywords: Abnormal return; Content analysis; Event study; Boycotts; Corporate social advocacy; Signalling effect.',
    zh: 'Afego, P. N., & Alagidede, I. P. (2021). 企業社會倡議傳遞了什麼訊號？來自參與抵制決策的證據。Journal of Capital Markets Studies, 5(1), 49–68。開放取用（CC BY 4.0）。關鍵詞：異常報酬、內容分析、事件研究、抵制、企業社會倡議、訊號效果。',
  },
  {
    id: 'afego-abs-1',
    section: 'abstract',
    subSection: '摘要（整理）',
    pdfPage: '摘要',
    en: 'Summary of the abstract: The study asks whether a firm\'s public stance on a social-political issue signals its values, identity and reputation, using boycott participation. It uses "a mixed-methods design" combining content analysis with event study methodology on US firms that joined a boycott of Facebook over hate speech, misinformation and discriminatory content.',
    zh: '摘要整理：研究探討企業對社會政治議題公開表態（以參與抵制為例），是否傳遞其價值、認同與聲譽的訊號。作者採用「混合方法設計」，結合內容分析與事件研究，對象是參與抵制 Facebook（針對仇恨言論、錯誤訊息與歧視內容）的美國公司。',
    glossaryTerms: ['Mixed Methods Research'],
  },
  {
    id: 'afego-intro-1',
    section: 'intro',
    subSection: '1–2. 研究問題與假說（整理）',
    pdfPage: '第 1–2 節',
    en: 'Research questions: what motivates firms to engage and how they negotiate their legitimacy; and whether such engagement signals a firm\'s reputation or organizational values that are capitalized into its stock price. Hypothesis: announcing engagement will positively impact reputation and short-term stock market performance.',
    zh: '研究問題：企業為何參與、如何協商（建立）自身的正當性；以及這類參與是否傳遞企業聲譽或組織價值的訊號，並反映在股價上。假說：宣布參與會對企業聲譽與短期股價表現有正面影響。',
  },
  {
    id: 'afego-methods-1',
    section: 'methods',
    subSection: '3. 樣本與方法（整理）',
    pdfPage: '第 3 節',
    en: 'Sample: 27 announcement events by US firms joining the "Stop Hate for Profit" campaign (17 June – 2 July 2020). Qualitative: content analysis of the firms\' public statements (coding procedure, coders and reliability are not reported). Quantitative: event study using the constant mean return model with a 200-day estimation window; daily abnormal returns for days −5 to +5 and CARs for several windows.',
    zh: '樣本：參與「Stop Hate for Profit」行動的美國公司共 27 個公告事件（2020 年 6 月 17 日至 7 月 2 日）。質性：對公司公開聲明做內容分析（原文未交代編碼程序、編碼者與信度）。量化：事件研究，採常數平均報酬模型，估計期 200 天；報告第 −5 到 +5 天的每日異常報酬與多個窗口的 CAR。',
  },
  {
    id: 'afego-results-1',
    section: 'results',
    subSection: '4. 結果（整理）',
    pdfPage: '第 4 節、表 2–4',
    en: 'Qualitative (Table 2): six legitimation categories — strengthening communities/social cohesion; standing together for positive change; safe spaces; human respect and dignity; accountability and transparency of internet firms; inclusion and diversity. Quantitative (Table 4): CAR(+1,+4) = 2.68%, significant at 1% on all three tests; CAR(+1,+2) = 1.57%, CAR(+1,+3) = 2.16%, CAR(+1,+5) = 2.30%. Pre-announcement CAR(−5,−1) = 2.13% is also significant.',
    zh: '質性（表 2）：6 類正當化主題——強化社區與社會凝聚、共同推動正向改變、安全空間、人的尊重與尊嚴、網路平台的問責與透明、包容與多元。量化（表 4）：CAR(+1,+4) = 2.68%，三種檢定皆在 1% 水準顯著；CAR(+1,+2) = 1.57%、CAR(+1,+3) = 2.16%、CAR(+1,+5) = 2.30%。公告前 CAR(−5,−1) = 2.13% 也顯著。',
  },
  {
    id: 'afego-integ-1',
    section: 'discussion',
    subSection: '5. 整合方式（整理與評估）',
    pdfPage: '第 5–6 節',
    en: 'The two strands are reported separately and combined narratively in the discussion ("Taken together, the boycott participation announcements are informationally strategic"). There is no test linking themes to returns (e.g., CAR by theme or a cross-sectional regression). The authors note limitations: a single boycott case, a small sample, US stocks only, and no control group.',
    zh: '兩股結果分開報告，在討論段以敘事方式合併（“Taken together, the boycott participation announcements are informationally strategic”）。沒有檢驗主題與報酬的關係（例如依主題比較 CAR 或做橫斷面迴歸）。作者自述的限制：單一抵制事件、樣本小、只看美股、沒有對照組。因此整合停在詮釋敘事層。',
  }
];

export const AFEGO_2021_TABLES: PaperTableData[] = [
  {
    id: 'afego-table-1',
    titleEn: 'Table 4 (selected). Cumulative abnormal returns around boycott participation announcements',
    titleZh: '原文表 4（節錄）：參與抵制公告前後的累積異常報酬',
    description: '依原文表 4 節錄；N = 27 個事件，常數平均報酬模型',
    headers: ['事件窗口', 'CAR', '顯著性（原文）'],
    rows: [
      ['(+1, +2)', '1.57%', '1%（t 檢定）、10%（符號檢定）'],
      ['(+1, +3)', '2.16%', '1%（t 檢定、Boehmer）'],
      ['(+1, +4)', '2.68%', '1%（三種檢定）'],
      ['(+1, +5)', '2.30%', '1%（t 檢定、Boehmer）'],
      ['(−5, −1)', '2.13%', '1%（公告前）'],
    ],
    footer: '原文正文把公告前描述為負的異常報酬，但表 3、表 4 顯示為正值，兩者不一致。'
  }
];

export interface BenchmarkPaperProfile {
  id: string;
  shortName: string;
  source: typeof ORIGINAL_PAPER_SOURCE;
  paragraphs: PaperParagraph[];
  tables: PaperTableData[];
}

// Moved BENCHMARK_PAPERS to bottom


export interface PaperSection {
  id: string;
  titleEn: string;
  titleZh: string;
  iconName: string;
}

export const PAPER_SECTIONS: PaperSection[] = [
  { id: 'meta', titleEn: 'Citation & Authors', titleZh: '文獻引用與作者資訊', iconName: 'FileText' },
  { id: 'abstract', titleEn: 'Abstract & Keywords', titleZh: '論文摘要與關鍵詞', iconName: 'Bookmark' },
  { id: 'intro', titleEn: '1. Introduction', titleZh: '1. 研究背景與引言', iconName: 'Compass' },
  { id: 'theory', titleEn: '2. Theory & Framework', titleZh: '2. 理論基礎與協同架構', iconName: 'Layers' },
  { id: 'methods', titleEn: '3. Methods & Data Acquisition', titleZh: '3. 研究方法與資料擷取', iconName: 'Cpu' },
  { id: 'results', titleEn: '4. Empirical Results', titleZh: '4. 實證結果分析 (Table 1-8)', iconName: 'BarChart3' },
  { id: 'discussion', titleEn: '5. Discussion & Implications', titleZh: '5. 討論、實務與理論意涵', iconName: 'MessageSquare' },
  { id: 'conclusion', titleEn: '6. Conclusion & Appendix', titleZh: '6. 結論與附錄交互作用圖', iconName: 'CheckCircle2' },
];

export const GLOSSARY_DICT: Record<string, { termZh: string; definition: string; category: string }> = {
  'SCAR': {
    termZh: '標準化累積超額報酬 (Standardized Cumulative Abnormal Return)',
    definition: '衡量個股報酬率偏離大盤或 CAPM 預期報酬率的累積異常幅度，經波動度標準化後消除市場系統性干擾，為本論文預測之核心應變數 (Y)。',
    category: '計量財務指標',
  },
  'GEE': {
    termZh: '廣義估計方程式 (Generalized Estimating Equations)',
    definition: '用於處理縱向追蹤資料 (Longitudinal / Panel Data) 的半母數計量迴歸技術。能有效克服同公司跨時間點的殘差自我相關 (Autocorrelation) 與群聚效應。',
    category: '計量經濟學',
  },
  'Mixed Methods Research': {
    termZh: '混合方法研究 (MMR)',
    definition: '在同一個研究計畫中同時結合量化研究（數字廣度）與質性研究（敘事深度），以實用主義 (Pragmatism) 為哲學基礎，透過三角交叉檢驗提高信效度。',
    category: '研究方法論',
  },
  'Triangulation': {
    termZh: '三角交叉檢驗 (相互印證)',
    definition: '使用多種資料來源、研究方法或理論視角來檢視同一現象，互相驗證以減少單一方法帶來的偏差，確認研究結果的穩健性。',
    category: '研究方法論',
  },
  'Pragmatism': {
    termZh: '實用主義',
    definition: 'MMR 的核心哲學基礎，主張知識的價值在於其解決實際問題的有效性，破除純粹客觀主義（實證論）與純粹主觀主義（建構論）的二元對立。',
    category: '科學哲學',
  },
  'McDonald-Loughran': {
    termZh: 'Loughran-McDonald 金融情緒詞典',
    definition: '針對商業與財務報告（如 10-K、財經新聞）專門開發的情緒辭典，包含正面 (Positive)、負面 (Negative)、不確定性 (Uncertainty)、訴訟 (Litigious)、強迫性 (Constraining) 與贅詞六大類，大幅降低通用詞典（如 Harvard-IV）在金融領域的誤判率。',
    category: '文字探勘',
  },
  'Adaptive Market Hypothesis': {
    termZh: '適應性市場假說 (AMH, Andrew Lo 2004)',
    definition: '將達爾文演化論融入金融市場，認為市場並非永遠有效，投資人行為受競爭、突變與環境刺激影響，過去的量化指標無法完全捕捉動態變化，因此需納入即時新聞等質性資訊。',
    category: '金融理論',
  },
  'Information Theory': {
    termZh: '資訊理論 (Claude Shannon 1948)',
    definition: '探討資訊的量化、儲存與傳播，指出多元外部資訊能有效降低對未來的「不確定性 (Entropy)」，為結合多源數據提供理論依據。',
    category: '理論基礎',
  },
  'PE_ratio': {
    termZh: '本益比 (Price-to-Earnings Ratio)',
    definition: '股價與每股盈餘的比率 (mkvalt / ib)，反映市場對企業每單位獲利的定價水準與未來成長預期。',
    category: '財務指標',
  },
  'MB_ratio': {
    termZh: '市值淨值比 (Market-to-Book Ratio)',
    definition: '企業總市值與股東權益帳面價值的比率 (mkvalt / teq)，常用於衡量成長型股票 vs 價值型股票。',
    category: '財務指標',
  },
  'Sales_growth': {
    termZh: '營收年增率 (Sales Growth)',
    definition: '本期營業收入相對於前期營收的變動百分比 ([revt(t) - revt(t-1)] / revt(t-1))。',
    category: '財務指標',
  },
};

import { PAPER_AUDIT } from './paperAudit.ts';
import { INTRO_PARAGRAPHS } from './sections/intro.ts';
import { THEORY_PARAGRAPHS } from './sections/theory.ts';
import { METHODS_PARAGRAPHS } from './sections/methods.ts';
import { RESULTS_PARAGRAPHS } from './sections/results.ts';
import { DISCUSSION_PARAGRAPHS } from './sections/discussion.ts';
import { CONCLUSION_PARAGRAPHS } from './sections/conclusion.ts';

export const META_PARAGRAPHS: PaperParagraph[] = [
  {
    id: 'meta-1',
    section: 'meta',
    subSection: '封面文獻引用與出處資訊',
    pdfPage: 'PDF P.1 (封面與引用)',
    en: 'Please cite this article as: Raman, R., Aljafari, R., Venkatesh, V., and Richardson, V. “Mixed Methods Research in the Age of Analytics: An Exemplar Leveraging Sentiments from News Articles to Explain Firm Performance,” International Journal of Information Management (64), 2022, 102451. https://doi.org/10.1016/j.ijinfomgt.2021.102451',
    zh: '請引用本文章為：Raman, R., Aljafari, R., Venkatesh, V., and Richardson, V.〈分析學時代的混合方法研究：以新聞情緒預測企業績效為例〉，《International Journal of Information Management》（國際資訊管理期刊），第64卷，2022年，論文編號102451。https://doi.org/10.1016/j.ijinfomgt.2021.102451',
    glossaryTerms: ['Mixed Methods Research'],
  },
  {
    id: 'meta-2',
    section: 'meta',
    subSection: '作者團隊陣容與所屬頂尖學術機構',
    pdfPage: 'PDF P.1 (作者資訊)',
    en: 'Authors: Raji Raman (Pamplin College of Business, Virginia Tech, Blacksburg, Virginia, USA), Ruba Aljafari (Katz Graduate School of Business, University of Pittsburgh, Pittsburgh, Pennsylvania, USA), Viswanath Venkatesh (Pamplin College of Business, Virginia Tech, Blacksburg, Virginia, USA, vvenkatesh@vvenkatesh.us), Vernon Richardson (Walton College of Business, University of Arkansas, Fayetteville, Arkansas, USA). Pre-publication version subject to copyediting.',
    zh: '作者陣容：Raji Raman（維吉尼亞理工大學 潘普林商學院）、Ruba Aljafari（匹茲堡大學 卡茨商學研究所）、Viswanath Venkatesh（維吉尼亞理工大學 潘普林商學院，資訊系統領域頂尖學者院士）、Vernon Richardson（阿肯色大學 沃爾頓商學院，會計與計算財務權威）。',
  },
  {
    id: 'meta-3',
    section: 'meta',
    subSection: '期刊地位與學術影響力',
    pdfPage: 'PDF P.1 (期刊指標)',
    en: 'International Journal of Information Management (IJIM) is a premier SSCI Q1 ranked journal published by Elsevier, recognized globally for groundbreaking research bridging Information Systems, Analytics, and Organizational Management.',
    zh: '《International Journal of Information Management》（IJIM）為 Elsevier 出版之頂級 SSCI Q1 旗艦期刊（Impact Factor: 18.9+），在資訊系統、商業分析與組織管理領域享有崇高國際學術地位。',
  },
];

export const ABSTRACT_PARAGRAPHS: PaperParagraph[] = [
  {
    id: 'abs-1',
    section: 'abstract',
    subSection: '摘要 1：投資決策與預測分析學興起',
    pdfPage: 'PDF P.2 (摘要第1句)',
    en: 'Investors and companies have always aspired to make informed investment decisions by using diverse information sources. With the explosion of information sources on the web and emergence of predictive analytics, many investors moved beyond traditional financial measures, as key predictors of firm performance, to textual content from analysts’ reports.',
    zh: '投資人與企業一向渴望運用多元的資訊來源以制定明智的投資決策。隨著網路資訊來源的爆炸性增長以及預測分析學的興起，許多投資人已不再僅將傳統財務指標視為預測企業績效的唯一關鍵，而是進一步轉向分析師報告中的文本內容。',
    glossaryTerms: ['Information Theory'],
  },
  {
    id: 'abs-2',
    section: 'abstract',
    subSection: '摘要 2：現有文獻對網路新興文本之空白',
    pdfPage: 'PDF P.2 (摘要第2句)',
    en: 'Empirical research suggests that these information sources complement each other by providing a clear picture of firm performance, but remains silent on the role of additional textual content that continues to emerge and reach more potential investors on the web.',
    zh: '實證研究表明，這些資訊來源能夠相互補充，為企業的經營績效勾勒出更清晰的樣貌；然而，現有文獻對於網路上不斷湧現並觸及更多潛在投資人的龐大額外文本資訊（如主流商業新聞媒體），其所扮演的角色依然探討不足。',
  },
  {
    id: 'abs-3',
    section: 'abstract',
    subSection: '摘要 3：標普 500 與華爾街日報文本方法學',
    pdfPage: 'PDF P.2 (摘要第3句)',
    en: 'We build on this line of research to examine the effect of textual content from business journals in conjunction with summary measures on cumulative abnormal returns. We use sentiment analysis with machine learning and econometrics methods to examine content extracted from textual articles about S&P 500 index companies that are published in the Wall Street Journal (years 2013-2016).',
    zh: '我們奠基於此研究脈絡，深入探討商業報刊文本內容結合財務總結性指標，對累積超額報酬（Cumulative Abnormal Returns, SCAR）的綜合影響。我們結合情緒分析、機器學習與計量經濟學方法，檢驗自《華爾街日報》（Wall Street Journal, 2013-2016年）所爬取之標普500指數（S&P 500）成分股新聞文本內容。',
    glossaryTerms: ['SCAR', 'Mixed Methods Research'],
  },
  {
    id: 'abs-4',
    section: 'abstract',
    subSection: '摘要 4：主效應與負面情緒之深遠衝擊',
    pdfPage: 'PDF P.2 (摘要第4句)',
    en: 'Textual analysis of business journals in conjunction with quantitative measures revealed direct and interaction effects on abnormal returns over time. We also tested for robustness by replicating the analysis with different variable operationalization and observe consistent patterns. Relative to positive sentiments, negative sentiments have more profound effects on cumulative abnormal returns.',
    zh: '商業報刊的文本分析結合量化財務指標顯示，兩者對企業跨期超額報酬具有顯著的直接效果與交互作用效果。我們亦透過不同變數操作型定義進行穩健性檢定，發現一致的規律：相較於正面情緒，負面情緒對累積超額報酬具有更深遠且劇烈的衝擊（負面不對稱性）。',
    glossaryTerms: ['SCAR'],
  },
  {
    id: 'abs-5',
    section: 'abstract',
    subSection: '摘要 5：高成長正面情緒邊際遞減與關鍵詞',
    pdfPage: 'PDF P.2 (摘要第5句)',
    en: 'The effect of positive sentiments becomes weaker when past quantitative measures are high. As information sources continue to emerge on the web, this work makes key contributions to the practice of sentiment analysis in financial markets. Keywords: sentiments, machine learning, abnormal returns, econometrics.',
    zh: '研究更發現一項關鍵機制：當企業過去的量化財務指標（如營收成長率）已經處於高水準時，正面情緒的邊際激勵效果反而呈現「遞減現象」（Diminishing Effect）。隨著網路資訊源持續蓬勃發展，本研究為金融市場的情緒分析實踐做出了重大貢獻。關鍵字：情緒分析 (sentiments)、機器學習 (machine learning)、超額報酬 (abnormal returns)、計量經濟學 (econometrics)。',
    glossaryTerms: ['Sales_growth', 'SCAR', 'GEE'],
  },
];

// 依原文 PDF 校對結果覆寫英文、中譯、頁碼與分類（延伸內容會標示「非原文」）
export const PAPER_PARAGRAPHS: PaperParagraph[] = [
  ...META_PARAGRAPHS,
  ...ABSTRACT_PARAGRAPHS,
  ...INTRO_PARAGRAPHS,
  ...THEORY_PARAGRAPHS,
  ...METHODS_PARAGRAPHS,
  ...RESULTS_PARAGRAPHS,
  ...DISCUSSION_PARAGRAPHS,
  ...CONCLUSION_PARAGRAPHS,
].map((p) => {
  const a = PAPER_AUDIT[p.id] || { kind: 'extended' as const, pdfPage: '非原文' };
  // 原文段落不掛「三角檢驗／實用主義」等原文沒有使用的術語標籤
  const glossaryTerms = a.kind === 'original' ? (p.glossaryTerms || []).filter((t) => !['Triangulation', 'Pragmatism', 'Meta-Inference'].includes(t)) : p.glossaryTerms;
  return { ...p, ...a, glossaryTerms };
});

export const PAPER_TABLES: PaperTableData[] = [
  {
    id: 'table-1',
    titleEn: 'Table 1. Financial data variable list',
    titleZh: '表 1. 財務量化數據變數定義清單 (Compustat & Eventus)',
    description: '原文表 1（PDF 第 4 頁）逐字列出；中文欄為翻譯，公式取自原文 3.1 節。',
    headers: ['變數代號 (Variable)', '英文說明 (Description)', '中文定義與公式'],
    rows: [
      ['Datadate', 'fiscal year end date', '會計年度結束日'],
      ['Fyear', 'fiscal year', '會計年度'],
      ['Tic', 'company code/ ticker symbol', '公司代碼／股票代號'],
      ['Conm', 'company name', '公司名稱'],
      ['Csho', 'common shares outstanding for fiscal year', '該會計年度流通在外普通股股數'],
      ['Ib', 'income before extraordinary items for fiscal year', '該會計年度非常項目前淨利'],
      ['Revt', 'total revenues for a fiscal year', '該會計年度總營收'],
      ['Teq', 'stockholders’ equity', '股東權益'],
      ['Xsga', 'selling, general and administrative expenses', '銷售、一般及管理費用（SG&A）'],
      ['Mkvalt', 'total market value (also used as a proxy for firm size)', '總市值（也作為公司規模的代理變數）'],
      ['Prcc_f', 'fiscal year closing price', '會計年度收盤價'],
      ['Returns', 'change in fiscal year closing price as a percentage of previous fiscal year closing price', '報酬率：[prcc_f(t) − prcc_f(t−1)] / prcc_f(t−1)'],
      ['Price to earnings ratio', 'proportion of total market to the income before extraordinary items for given fiscal year', '本益比：mkvalt(t) / ib(t)'],
      ['Market to book ratio', 'proportion of total market to the stockholders’ equity for given fiscal year', '市值淨值比：mkvalt(t) / teq(t)'],
      ['sales growth', 'change in total revenues for fiscal year as percentage of previous fiscal year total revenues', '營收成長率：[revt(t) − revt(t−1)] / revt(t−1)'],
      ['SCAR', 'standardized cumulative abnormal returns', '標準化累積異常報酬（原文未說明預期報酬模型與標準化方式）'],
    ],
  },
  {
    id: 'table-2',
    titleEn: 'Table 2. GEE results predicting SCAR',
    titleZh: '表 2. 廣義估計方程式 (GEE) 預測 SCAR 計量實證結果',
    description: '三種殘差相關矩陣結構之 GEE 估計係數與標準誤（跨期縱向面板分析）',
    headers: ['自變數與交互作用項', 'Model 1 (Independent)', 'Model 2 (AR(1))', 'Model 3 (Exchangeable)'],
    rows: [
      ['Prior_SCAR (前期超額報酬)', '-0.065** (0.024)', '-0.065** (0.024)', '-0.064** (0.024)'],
      ['Size (公司規模對數)', '0.355*** (0.063)', '0.355*** (0.063)', '0.355*** (0.063)'],
      ['Positive (正面新聞情緒比率)', '13.665* (5.711)', '13.665* (5.711)', '13.654* (5.710)'],
      ['Negative (負面新聞情緒比率)', '-11.119*** (2.974)', '-11.119*** (2.974)', '-11.117*** (2.974)'],
      ['PE_ratio (本益比)', '0.000 (0.000)', '0.000 (0.000)', '0.000 (0.000)'],
      ['Sales_growth (營收年增率)', '1.225*** (0.285)', '1.225*** (0.285)', '1.225*** (0.285)'],
      ['MB_ratio (市值淨值比)', '0.001 (0.002)', '0.001 (0.002)', '0.001 (0.002)'],
      ['PE_ratio X Positive', '0.105 (0.093)', '0.105 (0.093)', '0.106 (0.093)'],
      ['Sales_growth X Positive (關鍵交互作用)', '-102.094** (39.289)', '-102.094** (39.289)', '-102.135** (39.286)'],
      ['MB_ratio X Positive', '0.027* (0.093)', '0.027* (0.093)', '0.027* (0.093)'],
      ['PE_ratio X Negative', '-0.044** (0.037)', '-0.044** (0.037)', '-0.044** (0.037)'],
      ['Sales_growth X Negative (負面加乘)', '-30.020* (19.796)', '-30.020* (19.796)', '-30.026* (19.794)'],
      ['MB_ratio X Negative', '-0.052** (0.081)', '-0.052** (0.081)', '-0.052** (0.081)'],
      ['Goodness of Fit (QIC)', '1442.801', '1442.801', '1442.802'],
    ],
    footer: '原文註：+p < 0.1；*p < 0.05；**p < 0.01；***p < 0.001。（原文表 2 未說明括號內數字的性質；表 3、表 4 註明為標準誤。正文 3.2 節說明變數已做平均數中心化。）校對提醒：部分星號與括號數字不一致，例如 MB_ratio × Positive 0.027*（0.093）、MB_ratio × Negative −0.052**（0.081）、PE_ratio × Negative −0.044**（0.037）、Sales_growth × Negative −30.020*（19.796），若括號為標準誤，這些係數按一般 z 檢定並不顯著。獨立與 AR(1) 兩欄數字完全相同。',
  },
  {
    id: 'table-3',
    titleEn: 'Table 3. Results from fixed effect and random effect models predicting SCAR',
    titleZh: '表 3. 固定效應 (Fixed Effect) 與隨機效應 (Random Effect) 模型估計結果',
    description: '檢驗個別公司不可觀察之異質性對 SCAR 估計的穩健性',
    headers: ['變數名稱', '固定效應模型 (Fixed Effect)', '隨機效應模型 (Random Effect)'],
    rows: [
      ['Prior_SCAR', '-0.492*** (0.027)', '-0.062* (0.026)'],
      ['Size', '5.493*** (0.319)', '0.366*** (0.064)'],
      ['Positive', '16.621** (6.193)', '11.791* (5.238)'],
      ['Negative', '-1.821 (3.365)', '-11.544*** (2.779)'],
      ['PE_ratio', '-0.000 (0.000)', '0.000 (0.000)'],
      ['Sales_growth', '0.409* (0.187)', '0.956*** (0.151)'],
      ['MB_ratio', '0.001 (0.001)', '0.001 (0.001)'],
      ['PE_ratio X Positive', '0.112 (0.098)', '0.102 (0.093)'],
      ['Sales_growth X Positive', '-15.313* (40.252)', '-99.499** (36.534)'],
      ['MB_ratio X Positive', '0.070* (0.183)', '0.027* (0.138)'],
      ['PE_ratio X Negative', '-0.002 (0.045)', '-0.043 (0.044)'],
      ['Sales_growth X Negative', '-12.527** (16.980)', '-27.957+ (15.739)'],
      ['MB_ratio X Negative', '-0.044** (0.099)', '-0.051** (0.083)'],
      ['Goodness of Fit', 'F-statistic: 42.96', 'Wald chi2: 107.25'],
    ],
    footer: '+p < .1; *p < .05; **p < .01; ***p < .001。括號中為標準誤。',
  },
  {
    id: 'table-4',
    titleEn: 'Table 4. Results from fixed/random effect models classifying SCAR (Binary)',
    titleZh: '表 4. SCAR 二元化分類之固定/隨機效應模型實證結果 (正報酬 vs 負報酬)',
    description: '將 SCAR 二元化為正異常報酬(High)與負異常報酬(Low)之穩健性檢驗',
    headers: ['變數名稱', 'Fixed Effect (二元)', 'Random Effect (二元)'],
    rows: [
      ['Prior_SCAR', '-1.058*** (0.108)', '-0.127* (0.056)'],
      ['Size', '12.747*** (1.323)', '0.605*** (0.143)'],
      ['Positive', '14.745*** (20.332)', '16.159*** (11.665)'],
      ['Negative', '-8.893* (10.558)', '-16.652** (5.996)'],
      ['PE_ratio', '0.002 (0.002)', '0.001 (0.001)'],
      ['Sales_growth', '0.670** (0.577)', '1.230** (0.356)'],
      ['MB_ratio', '0.001 (0.003)', '0.001 (0.002)'],
      ['PE_ratio X Positive', '-0.648 (0.511)', '-0.055 (0.281)'],
      ['Sales_growth X Positive', '-107.300* (133.088)', '-122.894* (83.614)'],
      ['MB_ratio X Positive', '0.733** (0.765)', '0.245** (0.311)'],
      ['PE_ratio X Negative', '-0.098 (0.126)', '-0.091 (0.102)'],
      ['Sales_growth X Negative', '-13.936* (59.502)', '-70.471+ (37.477)'],
      ['MB_ratio X Negative', '-0.150* (0.304)', '-0.101* (0.187)'],
      ['Goodness of Fit', 'LR chi2: 246.27', 'Wald chi2: 46.96'],
    ],
    footer: '+p < .1; *p < .05; **p < .01; ***p < .001。',
  },
  {
    id: 'table-5-6',
    titleEn: 'Table 5 & 6. Machine Learning Regression Comparison (Quant vs Quant+Text)',
    titleZh: '表 5 與表 6. 機器學習連續迴歸預測對照 (僅量化 vs 量化+新聞文本)',
    description: '評估加入華爾街日報新聞情緒指標後，各迴歸演算法在 MAE 與 RMSE 上的誤差縮減效益',
    headers: ['演算法 (Algorithm)', '純量化 MAE', '加入情緒後 MAE', '純量化 RMSE', '加入情緒後 RMSE', 'R² (Quant+Text)'],
    rows: [
      ['Decision Forest Regression (決策森林)', '0.237', '0.217 (最佳)', '0.321', '0.341', '0.149'],
      ['Boosted Decision Tree (提升決策樹)', '0.255', '0.250', '0.340', '0.386', '-0.091'],
      ['Neural Network Regression (神經網路)', '0.224', '0.265', '0.306', '0.450', '-0.484'],
      ['Bayesian Linear Regression (貝氏線性)', '0.538', '0.388', '3.425', '2.770', '-55.259'],
      ['Linear Regression (經典線性迴歸)', '0.430', '0.372', '2.358', '2.490', '-44.446'],
    ],
    footer: '依原文表 5、表 6 整理（PDF 第 7 頁）。決策森林迴歸加入文字後 MAE 最低（0.217），也是唯一判定係數為正（0.149）的模型；其餘模型判定係數皆為負；五個模型中有四個的 RMSE 反而上升（只有貝氏線性迴歸下降），類神經網路的 MAE 也變差。',
  },
  {
    id: 'table-7-8',
    titleEn: 'Table 7 & 8. Machine Learning Classification Comparison (Quant vs Quant+Text)',
    titleZh: '表 7 與表 8. 機器學習二元分類預測對照 (僅量化 vs 量化+新聞文本)',
    description: '預測 SCAR 是否為正 (超額獲利) 之分類準確率 (Accuracy) 與受試者操作特徵曲線下面積 (AUC)',
    headers: ['演算法 (Algorithm)', '純量化 Accuracy', '加入情緒後 Accuracy', '純量化 AUC', '加入情緒後 AUC'],
    rows: [
      ['Two-Class Boosted Decision Tree (提升決策樹)', '67.9%', '99.7% 💥 (極限)', '54.0%', '99.9% 💥 (完美)'],
      ['Two-Class Bayes Point Machine (貝氏點機)', '70.7%', '84.0%', '62.9%', '85.7%'],
      ['Two-Class Decision Forest (決策森林)', '68.6%', '83.9%', '48.7%', '86.0%'],
      ['Two-Class Logistic Regression (邏輯迴歸)', '72.9%', '82.8%', '38.8%', '85.2%'],
      ['Two-Class Decision Jungle (決策叢林)', '68.8%', '82.8%', '52.2%', '84.7%'],
      ['Two-Class Support Vector Machine (SVM)', '72.1%', '78.2%', '49.5%', '78.7%'],
      ['Two-Class Averaged Perceptron (平均感知器)', '70.0%', '78.4%', '58.2%', '79.0%'],
      ['Two-Class Neural Network (神經網路)', '71.4%', '79.7%', '51.5%', '74.0%'],
      ['Two-Class Locally-Deep Support Vector Machine (局部深層 SVM)', '69.3%', '80.6%', '54.1%', '81.8%'],
    ],
    footer: '依原文表 7、表 8 整理（PDF 第 7 頁），九種演算法全列。提升決策樹加入文字後達 99.7%（AUC 99.9%），高得不尋常；原文沒有說明 60/40 是否依時間切分，解讀時宜留意資料洩漏的可能。',
  },
];

export const BENCHMARK_PAPERS: BenchmarkPaperProfile[] = [
  {
    id: 'raman_2022',
    shortName: 'Raman et al. (2022, IJIM Q1)',
    source: ORIGINAL_PAPER_SOURCE,
    paragraphs: PAPER_PARAGRAPHS,
    tables: PAPER_TABLES
  },
  {
    id: 'wang_2023',
    shortName: 'Wang et al. (2023, JBR Q1)',
    source: WANG_2023_SOURCE,
    paragraphs: WANG_2023_PARAGRAPHS,
    tables: WANG_2023_TABLES
  },
  {
    id: 'afego_2021',
    shortName: 'Afego & Alagidede (2021, JCMS)',
    source: AFEGO_2021_SOURCE,
    paragraphs: AFEGO_2021_PARAGRAPHS,
    tables: AFEGO_2021_TABLES
  }
];
