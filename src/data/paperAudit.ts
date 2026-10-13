// =====================================================================
// 原文校對結果（依期刊正式版 PDF：IJIM 64 (2022) 102451，共 11 頁）逐段比對產生。
// kind：original＝原文逐字（含正確頁碼與忠實中譯）；table＝依原文表格數字整理；
//       reference＝原文參考文獻；extended＝本平台延伸解說，不是論文原文。
// =====================================================================
export type ParaKind = 'original' | 'table' | 'reference' | 'extended';
export interface ParaAudit { kind: ParaKind; en?: string; zh?: string; pdfPage?: string; subSection?: string }
export const PAPER_AUDIT: Record<string, ParaAudit> = {
 "abs-1": {
  "kind": "original",
  "en": "Investors and companies have always aspired to make informed investment decisions by using diverse information sources. With the explosion of information sources on the web and emergence of predictive analytics, many investors moved beyond traditional financial measures, as key predictors of firm performance, to textual content from analysts’ reports.",
  "zh": "投資人與企業一直希望運用多元的資訊來源，做出有根據的投資決策。隨著網路資訊來源爆炸性增加與預測分析興起，許多投資人已不再只把傳統財務指標當作企業績效的主要預測因子，而是進一步參考分析師報告中的文字內容。",
  "pdfPage": "PDF P.1",
  "subSection": "摘要｜投資決策與預測分析學興起"
 },
 "abs-2": {
  "kind": "original",
  "en": "Empirical research suggests that these information sources complement each other by providing a clear picture of firm performance, but remains silent on the role of additional textual content that continues to emerge and reach more potential investors on the web.",
  "zh": "實證研究指出，這些資訊來源彼此互補，能更清楚地呈現企業績效；但對於網路上持續出現、並觸及更多潛在投資人的其他文字內容扮演什麼角色，現有研究則沒有著墨。",
  "pdfPage": "PDF P.1",
  "subSection": "摘要｜現有文獻對網路新興文本之空白"
 },
 "abs-3": {
  "kind": "original",
  "en": "We build on this line of research to examine the effect of textual content from business journals in conjunction with summary measures on cumulative abnormal returns. We use sentiment analysis with machine learning and econometrics methods to examine content extracted from textual articles about S&P 500 index companies that are published in the Wall Street Journal (years 2013–2016).",
  "zh": "我們延續這一系列研究，探討商業期刊（報刊）的文字內容搭配總結性指標，對累積異常報酬的影響。我們結合情緒分析、機器學習與計量經濟方法，分析《華爾街日報》（2013–2016 年）刊登、與 S&P 500 指數成分公司相關的文章內容。",
  "pdfPage": "PDF P.1",
  "subSection": "摘要｜標普 500 與華爾街日報文本方法學"
 },
 "abs-4": {
  "kind": "original",
  "en": "Textual analysis of business journals in conjunction with quantitative measures revealed direct and interaction effects on abnormal returns over time. We also tested for robustness by replicating the analysis with different variable operationalization and observe consistent patterns. Relative to positive sentiments, negative sentiments have more profound effects on cumulative abnormal returns.",
  "zh": "商業報刊的文字分析搭配量化指標，顯示其對異常報酬隨時間存在直接效應與交互效應。我們也以不同的變數操作化方式重複分析進行穩健性檢定，觀察到一致的型態。相較於正面情緒，負面情緒對累積異常報酬的影響更為深遠。",
  "pdfPage": "PDF P.1",
  "subSection": "摘要｜主效應與負面情緒之深遠衝擊"
 },
 "abs-5": {
  "kind": "original",
  "en": "The effect of positive sentiments becomes weaker when past quantitative measures are high. As information sources continue to emerge on the web, this work makes key contributions to the practice of sentiment analysis in financial markets.\nKeywords: Sentiments; Machine learning; Abnormal returns; Econometrics",
  "zh": "當過去的量化指標偏高時，正面情緒的效果會變弱。隨著網路上的資訊來源持續湧現，本研究對金融市場中情緒分析的實務做出了重要貢獻。\n關鍵詞：情緒；機器學習；異常報酬；計量經濟學",
  "pdfPage": "PDF P.1",
  "subSection": "摘要｜高成長正面情緒邊際遞減與關鍵詞"
 },
 "intro-1": {
  "kind": "original",
  "en": "“You can get significant analytical lift when you combine information from the variety of sources available to you… Integrating and correlating across channels gives a more complete and useful insight into what is happening in a business” (Mighty Guides, 2016).",
  "zh": "「當你結合手邊各種來源的資訊時，可以獲得顯著的分析提升……跨通路整合並交叉比對，能讓你對企業正在發生的事有更完整、更有用的洞察。」（Mighty Guides, 2016）",
  "pdfPage": "PDF P.1",
  "subSection": "1. 引言導言與箴言"
 },
 "intro-2": {
  "kind": "original",
  "en": "Recent market dynamics confirm the need for paying closer attention to diverse information sources about companies. For instance, share prices of the top-24 companies representing different industry sectors fell considerably from 45.6% to 14.6% after the news about the data breach in these companies hit the market (Comparitech, 2017).",
  "zh": "近期的市場動態證實，我們需要更密切關注與企業有關的多元資訊來源。例如，代表不同產業的 24 家大型公司，在資料外洩的新聞傳到市場後，股價大幅下跌，從 45.6% 跌至 14.6%（Comparitech, 2017）。",
  "pdfPage": "PDF P.1",
  "subSection": "1. 市場動態與資安危機"
 },
 "intro-3": {
  "kind": "original",
  "en": "The breaches contributed to the spread of negative sentiments against the companies and ultimately, lowered their stock prices. Global equity markets dropped by $29 trillion in the 2016 crisis.",
  "zh": "這些外洩事件助長了對這些公司的負面情緒擴散，最終壓低了它們的股價。在 2016 年的危機中，全球股市市值蒸發了 29 兆美元。",
  "pdfPage": "PDF P.1",
  "subSection": "1. 負面情緒傳播與股價下挫"
 },
 "intro-4": {
  "kind": "original",
  "en": "During this global crisis, some companies recorded profits because they relied not only on past historical stock prices to project growth, but also on external factors such as news (Lee et al., 2017).",
  "zh": "在這場全球危機中，仍有些公司獲利，因為它們預測成長時不只依賴過去的歷史股價，也參考了新聞等外部因素（Lee et al., 2017）。",
  "pdfPage": "PDF P.1",
  "subSection": "1. 外部新聞因子的關鍵作用"
 },
 "intro-5": {
  "kind": "original",
  "en": "Such an incident is not surprising given our knowledge of the importance of information sources that go beyond typical quantitative predictors of companies’ performance (e.g., financial data), as suggested by earlier studies in the finance and accounting disciplines (Huang, Zang, & Zheng, 2014).",
  "zh": "這樣的情況並不令人意外：財務與會計領域的早期研究就已指出，超越典型量化預測因子（例如財務資料）的資訊來源，對預測公司績效很重要（Huang, Zang, & Zheng, 2014）。",
  "pdfPage": "PDF P.1",
  "subSection": "1. 超越傳統財務預測指標"
 },
 "intro-6": {
  "kind": "original",
  "en": "Less is known, however, about the role of additional information sources that continue to evolve on the web.",
  "zh": "然而，對於網路上持續演變的其他資訊來源扮演什麼角色，我們所知仍然有限。",
  "pdfPage": "PDF P.1",
  "subSection": "1. 網路新興資訊源之謎"
 },
 "intro-7": {
  "kind": "original",
  "en": "As a key interdisciplinary field, information systems (IS) has diffused knowledge pertaining to information use on the web and analytical techniques with quantitative and qualitative or text data to offer insights about problems and opportunities in other disciplines (e.g., finance, marketing, accounting).",
  "zh": "資訊系統（IS）作為一個重要的跨領域學科，已將網路資訊運用、以及處理量化與質性（文字）資料的分析技術等知識，擴散到其他學科（例如財務、行銷、會計），為這些領域的問題與機會提供洞見。",
  "pdfPage": "PDF P.1",
  "subSection": "1. 資訊系統 (IS) 跨領域擴散"
 },
 "intro-8": {
  "kind": "original",
  "en": "Sentiment analysis, also known as opinion mining of text data, is the process of determining the emotional tone in a series of words to gain a deeper understanding of affective states that are present in text content (Pang & Lee, 2008).",
  "zh": "情緒分析（又稱文字資料的意見探勘）是判斷一連串字詞所帶有的情感語調，以更深入理解文字內容中情感狀態的過程（Pang & Lee, 2008）。",
  "pdfPage": "PDF P.1–2",
  "subSection": "1. 文字探勘與情緒分析定義"
 },
 "intro-9": {
  "kind": "original",
  "en": "Several studies demonstrated the important role of sentiments resulting from technology adoption by organizations on their market value (Lee et al., 2017), stock returns from microblog sentiments (Deng, Huang, Sinha, & Zhao, 2018), tweets on stocks (Li, van Dalen, & van Rees, 2018), and online reviews on firm’s profitability (Tang, Mehl, Eastlick, He, & Card, 2016).",
  "zh": "已有多項研究證實情緒的重要角色，包括：企業導入科技所引發的情緒對其市值的影響（Lee et al., 2017）、微網誌情緒對股票報酬的影響（Deng, Huang, Sinha, & Zhao, 2018）、推文對股票的影響（Li, van Dalen, & van Rees, 2018），以及線上評論對企業獲利能力的影響（Tang, Mehl, Eastlick, He, & Card, 2016）。",
  "pdfPage": "PDF P.2",
  "subSection": "1. 先前文獻的情緒實證"
 },
 "intro-10": {
  "kind": "original",
  "en": "Such studies offer important insights based on sentiments, but leave two key areas that warrant further attention: (a) the role of sentiments from news articles in major news outlets, such as the Wall Street Journal (WSJ), whose scope cover diverse content (e.g., stories related to litigations and acquisitions) and (b) the interplay between sentiments from news articles and traditional quantitative financial variables for predicting firms’ financial health.",
  "zh": "這些研究以情緒為基礎提供了重要洞見，但仍留下兩個值得進一步關注的領域：（a）主要新聞媒體（例如《華爾街日報》，WSJ）新聞文章中的情緒所扮演的角色——這類媒體涵蓋的內容相當多元（例如與訴訟、併購有關的報導）；以及（b）新聞文章情緒與傳統量化財務變數之間的交互作用，如何用來預測企業的財務健全度。",
  "pdfPage": "PDF P.2",
  "subSection": "1. 兩大關鍵待解缺口 (Research Gaps)"
 },
 "intro-11": {
  "kind": "original",
  "en": "Against this backdrop, we leverage theory-informed analytics and econometric techniques to move beyond addressing typical questions of “what is hidden in the data” to “how hidden factors are inter-related” or “why is this so” (Kar & Dwivedi, 2020, p. 2) in the context of financial measures and companies.",
  "zh": "在此背景下，我們運用以理論為基礎的分析方法與計量經濟技術，在財務指標與企業的脈絡中，從回答「資料裡藏了什麼」這類典型問題，進一步走向「隱藏因素彼此如何關聯」或「為什麼會這樣」（Kar & Dwivedi, 2020, p. 2）。",
  "pdfPage": "PDF P.2",
  "subSection": "1. 從「隱藏什麼」走向「為何如此」"
 },
 "intro-12": {
  "kind": "original",
  "en": "We employ machine learning and econometric techniques to address the following research question: “How do sentiments from business journals and traditional financial measures interact to predict firm performance?”",
  "zh": "我們運用機器學習與計量經濟技術，回答以下研究問題：「商業報刊的情緒與傳統財務指標，如何交互作用來預測企業績效？」",
  "pdfPage": "PDF P.2",
  "subSection": "1. 論文核心研究問題 (RQ)"
 },
 "intro-13": {
  "kind": "original",
  "en": "The scope of our investigation focuses on the direct and interaction effects among sentiments, key financial measures, and annual cumulative abnormal returns (i.e., returns generated by a given security or portfolio over a period of time that is different from the expected rate of return).",
  "zh": "本研究的範圍聚焦在情緒、主要財務指標與年度累積異常報酬之間的直接效應與交互效應（累積異常報酬是指某一證券或投資組合在一段期間內，與預期報酬率不同的那部分報酬）。",
  "pdfPage": "PDF P.2",
  "subSection": "1. 研究範疇與工具鏈 (Python & R)"
 },
 "intro-17": {
  "kind": "original",
  "en": "We use Python and R programming approaches to extract the textual content and run the sentiment analysis, respectively.",
  "zh": "我們分別使用 Python 與 R 程式來擷取文字內容與執行情緒分析。",
  "pdfPage": "PDF P.2",
  "subSection": "1. Python 擷取文字、R 執行情緒分析"
 },
 "intro-18": {
  "kind": "original",
  "en": "We extract the summary measures of S&P 500 index companies using Compustat and Eventus database.",
  "zh": "我們使用 Compustat 與 Eventus 資料庫擷取 S&P 500 指數成分公司的總結性指標。",
  "pdfPage": "PDF P.2",
  "subSection": "1. 財務資料來源：Compustat 與 Eventus"
 },
 "intro-14": {
  "kind": "original",
  "en": "Textual content about firms (e.g., editorial opinions, market sentiments, litigations, competitive position, management policies, risks) plays a divisive role in the earnings of companies and thus represents important criteria that investors and stakeholders can use to assess financial performance.",
  "zh": "與企業有關的文字內容（例如社論觀點、市場情緒、訴訟、競爭地位、管理政策、風險）在公司獲利上扮演著分歧（divisive）的角色，因此構成投資人與利害關係人評估財務績效時可以使用的重要依據。",
  "pdfPage": "PDF P.2",
  "subSection": "1. 新聞文本的實質定價角色"
 },
 "intro-15": {
  "kind": "original",
  "en": "Our work makes key contributions to research and practice. First, our study demonstrates the value of a synergistic framework of data and methods—offering the potential to extend the contemporary literature that uses computational methods to analyze textual information from business journals in financial markets (Hájek, 2018; Huang et al., 2014; Yu & Hatzivassiloglou, 2003). Specifically, using machine learning and econometrics methods with additional data sources complements recent work on harnessing the dual power of machine learning and econometrics methods in gaining richer insights (Adamopoulos, Ghose, & Todri, 2018; Wang, Li, & Singh, 2018).",
  "zh": "本研究對學術與實務都有重要貢獻。第一，本研究展示了資料與方法「協同框架」的價值，有機會延伸當代以計算方法分析金融市場中商業報刊文字資訊的文獻（Hájek, 2018; Huang et al., 2014; Yu & Hatzivassiloglou, 2003）。具體而言，結合機器學習與計量經濟方法並納入更多資料來源，補充了近期主張同時發揮機器學習與計量經濟兩者力量以獲得更豐富洞見的研究（Adamopoulos, Ghose, & Todri, 2018; Wang, Li, & Singh, 2018）。",
  "pdfPage": "PDF P.2",
  "subSection": "1. 研究貢獻 1：協同整合框架"
 },
 "intro-16": {
  "kind": "original",
  "en": "Second, our sample of S&P 500 index companies provides greater confidence for the generalizability of the predicted patterns. Third, using a multi-theoretic approach informs data extraction and enriches our understanding of the context of financial measures of companies. Finally, our results enlighten organizations about the importance of sentiments from business articles in explaining and predicting annual cumulative abnormal returns.",
  "zh": "第二，以 S&P 500 指數成分公司為樣本，讓預測型態的可推廣性更有信心。第三，採用多理論觀點有助於引導資料擷取，並加深我們對企業財務指標脈絡的理解。最後，我們的結果讓組織了解，商業文章中的情緒對解釋與預測年度累積異常報酬的重要性。",
  "pdfPage": "PDF P.2",
  "subSection": "1. 研究貢獻 2-4：廣泛可推廣性與多理論視角"
 },
 "theory-1": {
  "kind": "original",
  "en": "2. Theory and background\n2.1. Information and firm performance\nRelevant studies in finance and economics draw upon two key theories: information theory (Shannon, 1948) and adaptive market theory (Lo, 2004) to predict firm performance.",
  "zh": "2. 理論與背景\n2.1. 資訊與企業績效\n財務與經濟學的相關研究，主要援引兩個關鍵理論來預測企業績效：資訊理論（Shannon, 1948）與適應性市場理論（Lo, 2004）。",
  "pdfPage": "PDF P.2",
  "subSection": "2.1 資訊與企業績效的兩大理論"
 },
 "theory-2": {
  "kind": "original",
  "en": "Both theories inform empirical studies by emphasizing the value of information in reducing uncertainty about firm performance, but differ in the scope and role of information.",
  "zh": "這兩個理論都強調資訊在降低企業績效不確定性上的價值，從而引導實證研究；但兩者對資訊的範圍與角色看法不同。",
  "pdfPage": "PDF P.2",
  "subSection": "2.1 降低不確定性與範疇差異"
 },
 "theory-3": {
  "kind": "original",
  "en": "Specifically, adaptive market theory (Lo, 2004) stresses that markets are not efficient and past summary measures cannot fully predict firm performance. Thus, adaptive market theory complements information theory (Shannon, 1948) by emphasizing the need for processing and utilizing diverse information sources to reduce uncertainty.",
  "zh": "具體來說，適應性市場理論（Lo, 2004）強調市場並非有效率，過去的總結性指標無法完全預測企業績效。因此，適應性市場理論強調需要處理並運用多元資訊來源來降低不確定性，與資訊理論（Shannon, 1948）互補。",
  "pdfPage": "PDF P.2",
  "subSection": "2.1 適應性市場假說 (Lo 2004) 核心"
 },
 "theory-4": {
  "kind": "original",
  "en": "For instance, studies in finance found that the impact of summary measures, such as earnings forecasts and target prices, on financial performance in the form of cash flows and revenues is significant (Asquith, Mikhail, & Au, 2005; Ertimur, Livnat, & Martikainen, 2003; Givoly et al., 2009).",
  "zh": "例如，財務領域的研究發現，盈餘預測與目標價等總結性指標，對以現金流量與營收呈現的財務績效有顯著影響（Asquith, Mikhail, & Au, 2005; Ertimur, Livnat, & Martikainen, 2003; Givoly et al., 2009）。",
  "pdfPage": "PDF P.2",
  "subSection": "2.1 財務總結指標的局限"
 },
 "theory-5": {
  "kind": "original",
  "en": "In a perfect information market, summary measures reflect all information pertaining to companies. In the era of digitization, however, information is easily accessible over the Internet (e.g., textual information published about the companies’ stock prices, quarterly or yearly results, success, failures). Such diverse information plays an important role in the prediction of company growth (Altinkilic & Hansen, 2009).",
  "zh": "在完美資訊的市場中，總結性指標會反映與公司有關的所有資訊。然而在數位化時代，資訊很容易透過網路取得（例如與公司股價、季度或年度業績、成功、失敗有關的文字資訊）。這些多元資訊在預測公司成長上扮演重要角色（Altinkilic & Hansen, 2009）。",
  "pdfPage": "PDF P.2",
  "subSection": "2.1 完美資訊市場與數位化時代"
 },
 "theory-6": {
  "kind": "original",
  "en": "Hence, studies moved beyond quantitative measures of financial performance to incorporate textual information about companies. Choi et al. (2002) suggest that when investors use the web as an information channel, trading activity in corporate 401(k) plans doubles and portfolio turnover crosses over 50%.",
  "zh": "因此，研究開始超越財務績效的量化指標，納入與公司有關的文字資訊。Choi et al.（2002）指出，當投資人把網路當作資訊管道時，企業 401(k) 退休計畫的交易活動會加倍，投資組合周轉率超過 50%。",
  "pdfPage": "PDF P.2",
  "subSection": "2.1 網路投資管道促使交易量倍增"
 },
 "theory-7": {
  "kind": "original",
  "en": "Tetlock (2007) emphasized the value of news stories for predicting earnings and stock returns. Heston and Sinha (2016) examined the role of news stories and sentiments on stock returns. Other studies developed a methodology to extract sentiments from the web (e.g., Das & Chen, 2007).",
  "zh": "Tetlock（2007）強調新聞報導對預測盈餘與股票報酬的價值。Heston 與 Sinha（2016）探討新聞報導與情緒對股票報酬的作用。也有研究發展出從網路擷取情緒的方法（例如 Das & Chen, 2007）。",
  "pdfPage": "PDF P.2",
  "subSection": "2.1 新聞報導預測盈餘與股價 (Tetlock 2007)"
 },
 "theory-8": {
  "kind": "original",
  "en": "Recent IS research acknowledged the importance of information content in microblogs (Deng et al., 2018), tweets (Li et al., 2018), and reviews (Tang et al., 2016) for predicting firm performance in terms of stocks and firms’ profitability (Kumar, Kar, & Ilavarasan, 2021). These studies, however, were either confined to analyzing a small subset of companies, analysts’ reports, or limited time frame (Asquith et al., 2005; Huang et al., 2014; Huang, Lehavy, Zang, & Zheng, 2017). The analysts’ reports mostly consist of raw data and company performance but may not capture market reactions in the event of litigations, success, etc. Market reactions play a key role in the future prospects of the company in the event of success or failure.",
  "zh": "近期的資訊系統研究肯定了微網誌（Deng et al., 2018）、推文（Li et al., 2018）與評論（Tang et al., 2016）中的資訊內容，對以股價與企業獲利能力衡量的企業績效具有預測價值（Kumar, Kar, & Ilavarasan, 2021）。然而，這些研究不是只分析一小部分公司、分析師報告，就是時間範圍有限（Asquith et al., 2005; Huang et al., 2014; Huang, Lehavy, Zang, & Zheng, 2017）。分析師報告大多是原始資料與公司績效，可能無法捕捉訴訟、成功等事件發生時的市場反應。而在成功或失敗事件發生時，市場反應對公司的未來前景扮演關鍵角色。",
  "pdfPage": "PDF P.2",
  "subSection": "2.1 分析師報告與社交媒體的文獻局限"
 },
 "theory-9": {
  "kind": "original",
  "en": "Thus, embracing additional sources is important to gain insights on the market sentiments evolving about the company in reaction to (a) textual content published about the company and (b) summary measures announcements or past financial measures reflecting the growth of the company. This wide array of information represents an important resource for investors and companies. Investors will leverage this resource in their investment decisions and companies can take proactive approaches that are based on accurate predictions.\nOverall, the existing body of knowledge has reached a consensus on the value of diverse information sources (El-Haj et al., 2019), but has not sufficiently examined approaches to leverage these sources in predicting firm performance. Consistent with Huang et al. (2014), for instance, Hájek (2018) examined financial indicators and qualitative data using analysts’ reports to assess their direct effects on abnormal stock returns. Building on this line of research, we observe an opportunity to explore direct and interaction effects with different methods and additional information sources as suggested in the next section.",
  "zh": "因此，納入更多資訊來源很重要，才能掌握市場對公司逐漸形成的情緒；這些情緒是對以下兩者的反應：（a）關於公司所發布的文字內容，以及（b）總結性指標的公告或反映公司成長的過去財務指標。這一系列廣泛的資訊對投資人與企業都是重要資源：投資人會在投資決策中運用它，企業則可依據準確的預測採取主動作為。\n整體而言，現有文獻已對多元資訊來源的價值形成共識（El-Haj et al., 2019），但對如何運用這些來源預測企業績效的方法探討仍不足。例如，與 Huang et al.（2014）一致，Hájek（2018）利用分析師報告檢視財務指標與質性資料對異常股票報酬的直接效應。延續這一系列研究，我們看到一個機會：以不同方法與更多資訊來源，探討直接效應與交互效應，如下一節所述。",
  "pdfPage": "PDF P.2",
  "subSection": "2.1 納入更多資訊來源的必要性與研究缺口"
 },
 "theory-10": {
  "kind": "original",
  "en": "2.2. A synergistic framework of information sources and methods\nMotivated by theory-based insights from prior work in (e.g., Hájek, 2018; Huang et al., 2014) and lack of studies that integrate sentiments from reputable business journals with summary financial measures, we leverage analytics to examine the interplay between quantitative financial measures and sentiments. Fig. 1 depicts our proposed framework for leveraging information sources and methods to explain and predict firm performance. Overarching frameworks provide researchers with systematic approaches to generate insights from data and guide other researchers who can continue building on research with analytics or machine learning (cf. Grover, Kar, & Davies, 2018; Jimenez-Marquez, Gonzalez-Carrasco, Lopez-Cuadrado, & Ruiz-Mezcua, 2019).",
  "zh": "2.2. 資訊來源與方法的協同框架\n受到先前研究中以理論為基礎的洞見啟發（例如 Hájek, 2018; Huang et al., 2014），加上目前缺乏將權威商業報刊的情緒與總結性財務指標整合在一起的研究，我們運用分析方法檢視量化財務指標與情緒之間的交互作用。圖 1 呈現我們提出的框架，說明如何運用資訊來源與方法來解釋並預測企業績效。整體性的框架能為研究者提供從資料產生洞見的系統化做法，也能引導其他研究者在分析或機器學習研究上持續累積（參見 Grover, Kar, & Davies, 2018; Jimenez-Marquez, Gonzalez-Carrasco, Lopez-Cuadrado, & Ruiz-Mezcua, 2019）。",
  "pdfPage": "PDF P.2",
  "subSection": "2.2 協同整合架構概述 (Fig 1)"
 },
 "theory-11": {
  "kind": "original",
  "en": "Our framework depicts a sequence of phases that start with identifying relevant variables to build a model for explaining the phenomenon. In this phase, we highlight the complementary role of qualitative data and map it to an extraction method (Grover, Kar, & Dwivedi, 2020; Grover, Kar, & Ilavarasan, 2019; Kar, 2020).",
  "zh": "我們的框架呈現一系列依序進行的階段，第一階段是辨識相關變數，以建立解釋該現象的模型。在這個階段，我們強調質性資料的互補角色，並將其對應到一種擷取方法（Grover, Kar, & Dwivedi, 2020; Grover, Kar, & Ilavarasan, 2019; Kar, 2020）。",
  "pdfPage": "PDF P.2",
  "subSection": "2.2 第一階段：辨識（Identify）"
 },
 "theory-12": {
  "kind": "original",
  "en": "The second phase involves specifying and estimating an explanatory model to shed light on an understudied relationship. This phase is recommended prior to leveraging predictive analytics to enrich our understanding of firm performance or the target variable using different data sources (Shmueli & Koppius, 2011).",
  "zh": "第二階段是設定並估計一個解釋模型，以釐清一個尚未被充分研究的關係。建議在運用預測分析之前先進行這個階段，以加深我們對企業績效、或使用不同資料來源時目標變數的理解（Shmueli & Koppius, 2011）。",
  "pdfPage": "PDF P.2–3",
  "subSection": "2.2 第二階段：解釋（Explain）"
 },
 "theory-13": {
  "kind": "original",
  "en": "In the final phase, we predict firm performance to assess accuracy and errors using machine learning techniques. Such an assessment is critical when the target variable is already deployed in practice (Shmueli & Koppius, 2011).",
  "zh": "在最後一個階段，我們使用機器學習技術預測企業績效，評估準確度與誤差。當目標變數已在實務中被使用時，這樣的評估特別重要（Shmueli & Koppius, 2011）。",
  "pdfPage": "PDF P.3",
  "subSection": "2.2 第三階段：預測（Predict）"
 },
 "theory-14": {
  "kind": "original",
  "en": "Using theory-based insights (Kar & Dwivedi, 2020), we examine the role of news opinions about S&P 500 companies in conjunction with historical summary measures to shed light on their direct and interaction effects on firm performance in terms of the standardized cumulative abnormal return (SCAR). From scientific and practical perspectives, our predicted outcome is relevant as it (a) represents an important anomalous state and (b) helps in distinguishing between excellent investment opportunities/firms and investments to avoid. As noted in the upper right portion of the framework, we assess sentiment as a key dynamic that will shape the effects of traditional quantitative financial measures.",
  "zh": "我們運用以理論為基礎的洞見（Kar & Dwivedi, 2020），檢視關於 S&P 500 公司的新聞觀點，搭配歷史總結性指標，對以標準化累積異常報酬（SCAR）衡量的企業績效有何直接效應與交互效應。從學術與實務的角度來看，我們預測的結果變數具有意義，因為它（a）代表一種重要的異常狀態，並且（b）有助於區分絕佳的投資機會／公司與應該避開的投資。如框架右上方所示，我們把情緒視為一個關鍵動態，它會影響傳統量化財務指標的效果。",
  "pdfPage": "PDF P.3",
  "subSection": "2.2 核心應變數 SCAR 的重要意義"
 },
 "theory-15": {
  "kind": "original",
  "en": "Consistent with Huang et al. (2014), we suggest that sentiment from the textual content in conjunction with quantitative measures will provide a clearer picture of firm performance, as it captures evolution in the industry by reflecting change in management policies, industry regulations, litigations firms, and competitors’ actions. Hence, with textual content, investors and stakeholders could predict financial performance effectively and make informed decisions. However, it is unclear whether positive/negative sentiments from business journals strengthen/ weaken the relationship between quantitative financial measures and cumulative abnormal returns.",
  "zh": "與 Huang et al.（2014）一致，我們認為文字內容中的情緒搭配量化指標，能更清楚地呈現企業績效，因為它反映了管理政策、產業法規、企業訴訟與競爭者行動的變化，捕捉到產業的演變。因此，有了文字內容，投資人與利害關係人可以更有效地預測財務績效並做出有根據的決策。然而，商業報刊中的正面／負面情緒究竟會強化還是削弱量化財務指標與累積異常報酬之間的關係，目前尚不清楚。",
  "pdfPage": "PDF P.3",
  "subSection": "2.2 捕捉產業動態與外部衝擊"
 },
 "theory-16": {
  "kind": "original",
  "en": "Emotive content present in the textual content can affect investors in different ways (Kumar et al., 2021). For instance, some could place more emphasis on the assertiveness, whereas others could get affected by the positiveness associated with the textual content, etc. In contrast, quantitative past summary measures provide only aggregated information that does not capture the present market sentiments about the company.",
  "zh": "文字內容中的情感成分會以不同方式影響投資人（Kumar et al., 2021）。例如，有些人可能更重視文字的肯定程度，有些人則可能受到文字中正面程度的影響等。相反地，過去的量化總結性指標只提供彙總資訊，無法捕捉市場當下對公司的情緒。",
  "pdfPage": "PDF P.3",
  "subSection": "2.2 情緒內容對投資人心理之分歧衝擊"
 },
 "theory-17": {
  "kind": "original",
  "en": "For example, as soon as the news hit the market that Facebook compromised millions of users’ data, stock price of Facebook took a nose dive (St. John, 2018). Investors became cautious in investing on Facebook stocks as data breach resulted into litigations against Facebook. Relying on past summary measures would have resulted into bullish market for Facebook but sentiments portrayed the bearish market for Facebook and saved many investors from losing money on the Facebook stocks. Thus, use of market sentiments and past summary measures will enrich the understanding of the investors about the projected company growth. Investors could adjust projections derived solely from past quantitative measures by incorporating the positiveness/negativity about the company present in the news.",
  "zh": "例如，Facebook 外洩數百萬名使用者資料的新聞一傳到市場，Facebook 股價就急遽下跌（St. John, 2018）。由於資料外洩導致 Facebook 遭到訴訟，投資人在投資 Facebook 股票時變得謹慎。如果只依賴過去的總結性指標，會得出 Facebook 屬於多頭市場的判斷；但情緒呈現的是空頭，因而讓許多投資人免於在 Facebook 股票上虧損。因此，同時使用市場情緒與過去的總結性指標，能讓投資人更了解公司的預期成長。投資人可以把新聞中對公司的正面／負面程度納入考量，調整僅以過去量化指標得出的預測。",
  "pdfPage": "PDF P.3",
  "subSection": "2.2 Facebook 數據洩漏經典案例：多空反轉"
 },
 "theory-18": {
  "kind": "original",
  "en": "Positive sentiments influence consumer behaviors (Adamopoulos et al., 2018), purchase decisions and reviews (Ahmad & Laroche, 2017), review ratings on hotel performance (Hu & Chen, 2016), and star ratings on bank’s profitability (Tang et al., 2016). Negative sentiments about the company tend to generate unfavorable perceptions in investors’ minds (Goode, Hoehle, Venkatesh, & Brown, 2017). Extant research has shown that negative sentiments lead to more uncertainty and ambiguity in the consumer mind. For instance, research suggests that consumers find negative reviews on service failure to be more helpful in ecommerce settings (Ahmad & Laroche, 2017). Similarly, Deng et al. (2018) note that negative sentiments in microblogs play a major role in stock returns. Hence, we hypothesize that sentiments from business journals will shape the relationship between quantitative financial measures and cumulative abnormal returns. In the following sections, we demonstrate how our approach to theory-based variable selection and analysis contributes meaningfully to our research objective (Kar & Dwivedi, 2020).",
  "zh": "正面情緒會影響消費者行為（Adamopoulos et al., 2018）、購買決策與評論（Ahmad & Laroche, 2017）、評論評分對飯店績效的影響（Hu & Chen, 2016），以及星等評分對銀行獲利能力的影響（Tang et al., 2016）。對公司的負面情緒往往會讓投資人形成不利的觀感（Goode, Hoehle, Venkatesh, & Brown, 2017）。既有研究顯示，負面情緒會在消費者心中造成更多不確定與模糊。例如，研究指出在電子商務情境中，消費者認為針對服務失誤的負面評論更有幫助（Ahmad & Laroche, 2017）。同樣地，Deng et al.（2018）指出微網誌中的負面情緒對股票報酬有重要影響。因此，我們提出假說：商業報刊的情緒會影響量化財務指標與累積異常報酬之間的關係。在接下來的章節中，我們將說明以理論為基礎的變數選擇與分析方法，如何對研究目標做出實質貢獻（Kar & Dwivedi, 2020）。",
  "pdfPage": "PDF P.3",
  "subSection": "2.2 正負情緒的不對稱與研究假說"
 },
 "methods-1": {
  "kind": "original",
  "en": "3. Methods\n3.1. Quantitative and qualitative data acquisition\nWe adopted a structured approach to eliminate potential noise that may arise due to variety of data sources (Kar & Dwivedi, 2020). For instance, quantitative measures may be applied differently to operationalize constructs in predictive models. Qualitative data may suggest different signals depending on mechanisms for extracting and analyzing words across different disciplines. Hence, the first phase in our framework identifies relevant variables based on research and validated approaches for extracting data.",
  "zh": "3. 研究方法\n3.1. 量化與質性資料的取得\n我們採用結構化的做法，以消除因資料來源多樣而可能產生的雜訊（Kar & Dwivedi, 2020）。例如，在預測模型中，量化指標可能會以不同方式來操作化構念；質性資料則可能因不同學科擷取與分析字詞的機制不同，而呈現不同的訊號。因此，我們框架的第一階段，是依據既有研究與經過驗證的資料擷取方法來辨識相關變數。",
  "pdfPage": "PDF P.3",
  "subSection": "3.1 結構化資料擷取程序以消除噪聲"
 },
 "methods-2": {
  "kind": "original",
  "en": "Accounting and finance research (e.g., Barth, Beaver, & Landsman, 1998) inform our variable selection to represent quantitative financial measures. Data on the variables listed in Table 1 was collected using Compustat and Eventus for the S&P 500 index companies for the year 2013–2016.",
  "zh": "會計與財務研究（例如 Barth, Beaver, & Landsman, 1998）引導我們選擇代表量化財務指標的變數。表 1 所列變數的資料，是透過 Compustat 與 Eventus 蒐集 S&P 500 指數成分公司 2013–2016 年的資料。",
  "pdfPage": "PDF P.3",
  "subSection": "3.1 會計與財務理論之變數指引"
 },
 "methods-3": {
  "kind": "original",
  "en": "To ensure objectivity in our measures, we computed the following variables using standard accounting formulas as per the generally accepted accounting principles (GAAP). Further, our data extraction approach eliminates potential noise when combining multiple sources of data to build and validate an inferential model (Kar & Dwivedi, 2020) as we explain in the sections that follow.\nreturns (t) = [ prcc_f (t) – prcc_f (t-1)] / [ prcc_f(t-1)]\nprice to earnings ratio (t) = mkvalt(t) / ib(t)\nmarket to book ratio (t) = mkvalt(t) / teq(t)\nsales growth (t) = [ revt (t) – revt (t-1)] / [ revt (t-1)]",
  "zh": "為確保衡量的客觀性，我們依照一般公認會計原則（GAAP）的標準會計公式計算下列變數。此外，我們的資料擷取做法，可在結合多個資料來源來建立並驗證推論模型時消除潛在雜訊（Kar & Dwivedi, 2020），後續章節將說明。\n報酬率 (t) = [prcc_f(t) − prcc_f(t−1)] / prcc_f(t−1)\n本益比 (t) = mkvalt(t) / ib(t)\n市值淨值比 (t) = mkvalt(t) / teq(t)\n營收成長率 (t) = [revt(t) − revt(t−1)] / revt(t−1)",
  "pdfPage": "PDF P.3–4",
  "subSection": "3.1 遵循 GAAP 標準之四大核心會計計算公式"
 },
 "methods-8": {
  "kind": "original",
  "en": "We extracted textual data from the Wall Street Journal for the S&P 500 index companies for the year 2013–2016. We developed a web scraping Python programming code to extract about 2500 journal articles representing 500 companies. The code determines and scrapes the date the article was published, web URL of the article and the textual content present in the article. Fig. 2 shows a snippet of a data file generated after running the Python script for the company Intel.",
  "zh": "我們從《華爾街日報》擷取 S&P 500 指數成分公司 2013–2016 年的文字資料。我們開發了 Python 網頁爬蟲程式，擷取約 2,500 篇報刊文章，涵蓋 500 家公司。程式會判斷並抓取文章的刊登日期、文章網址，以及文章中的文字內容。圖 2 顯示執行 Python 程式後，針對英特爾（Intel）所產生資料檔的片段。",
  "pdfPage": "PDF P.4",
  "subSection": "3.1 《華爾街日報》Python 爬蟲（圖 2：Intel）"
 },
 "methods-9": {
  "kind": "original",
  "en": "From the textual data, sentiment analysis, also known as opinion mining, was used to determine the emotional tone in a series of words and gain an understanding of the affective states present in the content of the text. We wrote an R program to extract the sentiments from the textual content of the articles obtained from Wall Street Journal for the S&P 500 index companies.",
  "zh": "我們從文字資料中，運用情緒分析（又稱意見探勘）判斷一連串字詞的情感語調，理解文字內容中的情感狀態。我們撰寫 R 程式，從《華爾街日報》取得的 S&P 500 指數成分公司文章文字內容中擷取情緒。",
  "pdfPage": "PDF P.4",
  "subSection": "3.1 R 語言文字探勘與情感分析程序"
 },
 "methods-10": {
  "kind": "original",
  "en": "The affective states present in the content for the companies were determined by using the McDonald-Loughran financial dictionary, a widely used dictionary in Accounting and Finance. McDonald-Loughran dictionary has six categories of words namely: positive, negative, uncertainty, superfluous/modal, litigious, constraining.",
  "zh": "公司內容中的情感狀態，是用 McDonald-Loughran 金融詞典判定的；這是會計與財務領域廣泛使用的詞典。McDonald-Loughran 詞典有六類字詞：正面、負面、不確定、多餘／情態（superfluous/modal）、訴訟、限制。",
  "pdfPage": "PDF P.4",
  "subSection": "3.1 McDonald-Loughran 金融專用情緒詞典六大維度"
 },
 "methods-11": {
  "kind": "original",
  "en": "By basing our word extraction on common dictionaries, we also eliminate noise in potential signals from the data and increase confidence in our procedures (Kar & Dwivedi, 2020; Kushwaha, Kar, & Dwivedi, 2021). Our study used only positive and negative sentiments, as these sentiments are widely used in accounting studies to examine the impact of sentiments on financial performance of the company (Huang et al., 2014).",
  "zh": "以常用詞典作為字詞擷取的依據，也能消除資料中潛在訊號的雜訊，並提高對研究程序的信心（Kar & Dwivedi, 2020; Kushwaha, Kar, & Dwivedi, 2021）。本研究只使用正面與負面情緒，因為會計研究普遍用這兩類情緒來檢驗情緒對公司財務績效的影響（Huang et al., 2014）。",
  "pdfPage": "PDF P.4",
  "subSection": "3.1 為何鎖定正面與負面情緒指標"
 },
 "methods-19": {
  "kind": "original",
  "en": "The dictionary mostly consists of irregular verbs and syllables derived using syllabification algorithm.\n[Footnote 1] Details about the words included in each category could be found from the link - https://sraf.nd.edu/textual-analysis/resources/#LM%20Sentiment%20Word%20Lists. Positive: positive feelings attributed such as abundance, growth, profit, achievement, etc. Negative: Negative states such as losses, bankruptcy, decline, etc.",
  "zh": "該詞典主要由不規則動詞，以及透過音節切分演算法導出的音節所組成。\n【註腳 1】各類別包含哪些字詞，可參考連結 https://sraf.nd.edu/textual-analysis/resources/#LM%20Sentiment%20Word%20Lists。正面：如豐富、成長、獲利、成就等正面感受；負面：如虧損、破產、衰退等負面狀態。",
  "pdfPage": "PDF P.4",
  "subSection": "3.1 LM 詞典的組成（含註腳 1）"
 },
 "methods-12": {
  "kind": "original",
  "en": "The R program generated sentiment flat file for yearly textual articles per company. The file consists of total word counts present in each fiscal year for respective company. The output also contains the word counts for each fiscal year file of a company. The word counts are represented for each Loughran defined classification categories of words namely, positive, negative, constraining, litigious, uncertainty and superfluous. Fig. 3 shows part of the sentiment file generated using R for the company Intel.",
  "zh": "R 程式為每家公司每年的文章產生情緒平面檔（flat file）。檔案包含各公司每個會計年度的總字數，輸出結果也包含各公司每個會計年度檔案的字數。字數依 Loughran 所定義的各類字詞分別呈現，包括正面、負面、限制、訴訟、不確定與多餘。圖 3 顯示用 R 為英特爾（Intel）產生的部分情緒檔。",
  "pdfPage": "PDF P.4",
  "subSection": "3.1 R 產生的年度情緒檔（圖 3：Intel）"
 },
 "methods-13": {
  "kind": "original",
  "en": "3.2. Approach to model specification and validation\nWe used positive and negative affective counts from the extracted sentiment data and ignored other affective wordcounts produced by the R program, as markets are more sensitive to positive and negative emotions (Huang et al., 2014). We standardized the positive and negative wordcount by dividing with total wordcounts. We also mean centered the variables to examine the interaction effects thereby removing multicollinearity.",
  "zh": "3.2. 模型設定與驗證方法\n我們使用擷取出的情緒資料中的正面與負面情感字數，忽略 R 程式產生的其他情感字數，因為市場對正面與負面情緒更敏感（Huang et al., 2014）。我們將正面與負面字數除以總字數加以標準化，並對變數做平均數中心化，以檢驗交互效應，同時消除多重共線性。",
  "pdfPage": "PDF P.4",
  "subSection": "3.2 詞頻標準化 (Standardization) 與平均數中心化"
 },
 "methods-14": {
  "kind": "original",
  "en": "We controlled for prior SCAR and firm size. Larger firms (i.e., those with higher market capitalization of equity) or firms that have been historically doing well in terms of abnormal returns may perform better in the future. Hence, we eliminate such confounding effects by specifying prior SCAR and firm size as control variables. Based on relevant accounting and finance studies, we used PE_ratio, sales growth and MB_ratio as quantitative measures (Asquith et al., 2005; Huang et al., 2014, 2017).",
  "zh": "我們控制了前期 SCAR 與公司規模。規模較大的公司（即股權市值較高者），或過去在異常報酬上表現良好的公司，未來可能表現較好。因此，我們把前期 SCAR 與公司規模設為控制變數，以排除這類干擾效果。依據相關會計與財務研究，我們以本益比（PE_ratio）、營收成長率與市值淨值比（MB_ratio）作為量化指標（Asquith et al., 2005; Huang et al., 2014, 2017）。",
  "pdfPage": "PDF P.4",
  "subSection": "3.2 控制變數設計：前期 SCAR 與公司規模 (Size)"
 },
 "methods-15": {
  "kind": "original",
  "en": "We employed generalized estimating equations (GEE) to specify a model to explain SCAR. As illustrated in Fig. 1, this specified model will become the basis for predicting SCAR using machine learning algorithms (i.e., the third phase in our framework of information sources and methods). For the econometric analysis, our model specification and validation approach is appropriate for our longitudinal dataset, as we are interested in estimating the average response for cumulative abnormal returns over the population rather than for a company. Further, the presence of autocorrelation in the data deems linear regression inappropriate. GEE takes into account autocorrelation and incorporates a time variable to control for this issue. For our analysis with sentiment data, we also used GEE (see Ballinger, 2004 for a detailed discussion of this technique).",
  "zh": "我們使用廣義估計方程式（GEE）設定一個解釋 SCAR 的模型。如圖 1 所示，這個設定好的模型將作為以機器學習演算法預測 SCAR 的基礎（也就是資訊來源與方法框架中的第三階段）。在計量分析上，我們的模型設定與驗證方式適合這份縱貫資料，因為我們關心的是估計整體母體累積異常報酬的平均反應，而不是單一公司的反應。此外，資料存在自我相關，使線性迴歸並不適用；GEE 會考量自我相關，並納入時間變數來處理此問題。對情緒資料的分析，我們也使用 GEE（此技術的詳細討論見 Ballinger, 2004）。",
  "pdfPage": "PDF P.4",
  "subSection": "3.2 廣義估計方程式 (GEE) 處理時間自相關"
 },
 "methods-16": {
  "kind": "original",
  "en": "We strengthen our model specification and validation approach by replicating the underlying procedures (Kar & Dwivedi, 2020) to predict abnormal returns with an alternative operationalization or binary measurement of SCAR.",
  "zh": "我們重複執行相同的基本程序（Kar & Dwivedi, 2020），改用另一種操作化方式——也就是 SCAR 的二元衡量——來預測異常報酬，以強化模型設定與驗證。",
  "pdfPage": "PDF P.4",
  "subSection": "3.2 穩健性檢定：SCAR 二元化定義"
 },
 "methods-17": {
  "kind": "original",
  "en": "As for predicting SCAR using machine learning algorithms in the third phase, we first chose algorithms that are appropriate for the measurement of the target/dependent variable or SCAR (Choudhury, Allen, & Endres, 2021). For instance, with a non-binary specification of SCAR, we adopted linear regression algorithms (e.g., boosted decision tree regression, neural network regression). With a binary specification of SCAR for robustness testing, we adopted classification algorithms (e.g., two-class Bayes point machine, two-class logistic regression, two-class boosted decision tree). Hence, our goal with machine learning was to obtain predictive accuracy of the explanatory model using different data sources rather than discover new patterns in predictors (Choudhury et al., 2021) that led to SCAR or to re-specify key relationships that have been typically examined in the literature.",
  "zh": "至於第三階段以機器學習演算法預測 SCAR，我們先挑選適合目標（依）變數 SCAR 衡量方式的演算法（Choudhury, Allen, & Endres, 2021）。例如，SCAR 為非二元設定時，我們採用線性迴歸類演算法（例如提升決策樹迴歸、類神經網路迴歸）；SCAR 為二元設定（用於穩健性檢定）時，則採用分類演算法（例如二元貝氏點機、二元邏輯迴歸、二元提升決策樹）。因此，我們使用機器學習的目的，是在不同資料來源下取得解釋模型的預測準確度，而不是在預測因子中發掘導致 SCAR 的新型態（Choudhury et al., 2021），也不是重新設定文獻中通常檢驗的關鍵關係。",
  "pdfPage": "PDF P.4",
  "subSection": "3.2 機器學習演算法之選取原則"
 },
 "methods-18": {
  "kind": "original",
  "en": "We used 60% of the data for training and 40% for prediction or validation. Our approach echoes recent calls to eliminate potential bias by leveraging diverse data sources from which theory-based variables can be extracted (Kar & Dwivedi, 2020).",
  "zh": "我們以 60% 的資料作為訓練集，40% 作為預測或驗證集。這個做法呼應了近期的呼籲：運用可從中擷取理論變數的多元資料來源，以消除潛在偏誤（Kar & Dwivedi, 2020）。",
  "pdfPage": "PDF P.7",
  "subSection": "4.2 資料切分：60% 訓練、40% 驗證（原文位於 4.2 節）"
 },
 "results-1": {
  "kind": "original",
  "en": "4. Results\n4.1. Econometric techniques\nAs discussed in Section 2.2., the second phase in our framework focuses on explaining the specified relationship that we developed based on research. From an analytical perspective, we use econometric techniques to assess the sign and significance of the direct and interaction effects—an approach that is recommended prior to applying machine learning techniques (Shmueli & Koppius, 2011).",
  "zh": "4. 研究結果\n4.1. 計量經濟技術\n如第 2.2 節所述，框架的第二階段著重在解釋我們依據既有研究所建立的關係。從分析的角度，我們用計量技術評估直接效應與交互效應的方向與顯著性——這是在應用機器學習技術之前建議採取的做法（Shmueli & Koppius, 2011）。",
  "pdfPage": "PDF P.4",
  "subSection": "4.1 計量經濟學技術與因果解釋"
 },
 "results-2": {
  "kind": "original",
  "en": "We ran the GEE model using SCAR as a continuous variable and later, binary variable as robustness testing (Kar & Dwivedi, 2020). Table 2 shows the GEE results with different correlation matrix structures (Ballinger, 2004).",
  "zh": "我們先以連續變數的 SCAR 執行 GEE 模型，之後再以二元變數進行穩健性檢定（Kar & Dwivedi, 2020）。表 2 列出採用不同相關矩陣結構的 GEE 結果（Ballinger, 2004）。",
  "pdfPage": "PDF P.4",
  "subSection": "4.1 GEE 三種相關結構估計 (Table 2)"
 },
 "results-3": {
  "kind": "original",
  "en": "The results suggest that prior year SCAR has a significant negative effect on cumulative abnormal returns. Firm size and sales growth have a significant positive effect on abnormal return.",
  "zh": "結果顯示，前一年的 SCAR 對累積異常報酬有顯著的負向影響；公司規模與營收成長率對異常報酬有顯著的正向影響。\n〔對照表 2：前期 SCAR −0.065**（獨立、AR(1)）／−0.064**（可交換）；規模 0.355***；營收成長率 1.225***〕",
  "pdfPage": "PDF P.4–5",
  "subSection": "4.1 控制變數：前期 SCAR 與公司規模"
 },
 "results-4": {
  "kind": "original",
  "en": "Consistent with Huang et al. (2014), positive sentiments have a significant positive effect on cumulative abnormal returns, whereas negative sentiments have a significant negative effect on cumulative abnormal returns.",
  "zh": "與 Huang et al.（2014）一致，正面情緒對累積異常報酬有顯著的正向影響，負面情緒則有顯著的負向影響。\n〔對照表 2：正面 13.665*（可交換 13.654*）；負面 −11.119***（可交換 −11.117***）〕",
  "pdfPage": "PDF P.5",
  "subSection": "4.1 情緒的主效應"
 },
 "results-5": {
  "kind": "original",
  "en": "Interaction of positive sentiments and sales growth has a significant negative effect on abnormal returns. Such a pattern suggests that positive sentiments show a diminishing effect at higher values of sales growth.",
  "zh": "正面情緒與營收成長率的交互作用，對異常報酬有顯著的負向影響。這個型態顯示，在營收成長率較高時，正面情緒的效果會遞減。\n〔對照表 2：−102.094**（可交換 −102.135**）〕",
  "pdfPage": "PDF P.5",
  "subSection": "4.1 交互作用：營收成長率 × 正面情緒"
 },
 "results-6": {
  "kind": "original",
  "en": "Interaction of positive sentiments and MB_ratio has a significant positive effect on abnormal returns. Such a pattern suggests that the magnitude of the positive sentiments effect becomes stronger at higher values of MB_ratio.",
  "zh": "正面情緒與市值淨值比（MB_ratio）的交互作用，對異常報酬有顯著的正向影響。這個型態顯示，市值淨值比越高，正面情緒的效果越強。\n〔對照表 2：0.027*，標準誤 0.093〕",
  "pdfPage": "PDF P.5",
  "subSection": "4.1 交互作用：市值淨值比 × 正面情緒"
 },
 "results-7": {
  "kind": "original",
  "en": "Interaction of negative sentiments and sales growth has a significant negative effect on cumulative abnormal returns. Hence, the magnitude of the negative sentiments effect becomes stronger at higher values of sales growth.",
  "zh": "負面情緒與營收成長率的交互作用，對累積異常報酬有顯著的負向影響。因此，營收成長率越高，負面情緒的效果越強。\n〔對照表 2：−30.020*（可交換 −30.026*），標準誤約 19.8〕",
  "pdfPage": "PDF P.5",
  "subSection": "4.1 交互作用：營收成長率 × 負面情緒"
 },
 "results-8": {
  "kind": "original",
  "en": "Finally, interaction of negative sentiments and MB_ratio has a significant negative effect on cumulative abnormal returns. Such a pattern suggests that the magnitude of the negative sentiments effect becomes strong at higher values of MB_ratio.",
  "zh": "最後，負面情緒與市值淨值比的交互作用，對累積異常報酬有顯著的負向影響。這個型態顯示，市值淨值比越高，負面情緒的效果越強。\n〔對照表 2：−0.052**，標準誤 0.081〕",
  "pdfPage": "PDF P.5",
  "subSection": "4.1 交互作用：市值淨值比 × 負面情緒"
 },
 "results-9": {
  "kind": "original",
  "en": "Table 3 shows estimation results from fixed effect and random effect models. The results suggest that prior year SCAR has a significant negative effect on cumulative abnormal returns. Firm size and sales growth have positive significant effects on abnormal return. Positive sentiments have a significant positive effect on cumulative abnormal returns. Negative sentiments have a significant negative effect on cumulative abnormal returns. Interaction of positive sentiments and sales growth has significant negative impact on abnormal returns. Such a pattern suggests that the magnitude of the positive sentiments effect becomes weaker at higher values of sales growth. Interaction of positive sentiments and MB_ratio have significant positive effects on abnormal returns. Hence, the magnitude of the positive sentiments effect becomes stronger at higher values of MB_ratio. Interaction of negative sentiments and sales growth has a significant negative effect on cumulative abnormal returns. Such a pattern suggests that the magnitude of negative sentiments effect becomes stronger at higher values of sales growth. Finally, interaction of negative sentiments and MB_ratio has a significant negative effect on cumulative abnormal returns. Hence, the magnitude of negative sentiments effect becomes stronger at higher values of MB_ratio. The results support our hypothesis in that there is a joint effect between sentiments from business journals and financial indicators, but reveal interesting dynamics about the differential effects of positive and negative sentiments.",
  "zh": "表 3 列出固定效果與隨機效果模型的估計結果。結果顯示，前一年的 SCAR 對累積異常報酬有顯著負向影響；公司規模與營收成長率對異常報酬有顯著正向影響。正面情緒對累積異常報酬有顯著正向影響，負面情緒有顯著負向影響。正面情緒與營收成長率的交互作用對異常報酬有顯著負向影響，顯示營收成長率越高，正面情緒的效果越弱。正面情緒與市值淨值比的交互作用有顯著正向影響，因此市值淨值比越高，正面情緒的效果越強。負面情緒與營收成長率的交互作用對累積異常報酬有顯著負向影響，顯示營收成長率越高，負面情緒的效果越強。最後，負面情緒與市值淨值比的交互作用有顯著負向影響，因此市值淨值比越高，負面情緒的效果越強。這些結果支持我們的假說：商業報刊的情緒與財務指標之間存在共同效應，同時也揭示了正面與負面情緒效果不同的有趣動態。\n〔對照表 3：固定效果模型中，負面情緒為 −1.821（標準誤 3.365），並未達顯著；隨機效果模型為 −11.544***。〕",
  "pdfPage": "PDF P.5",
  "subSection": "4.1 表 3：固定效果與隨機效果模型"
 },
 "results-10": {
  "kind": "original",
  "en": "We also studied the upward and downward trend of cumulative abnormal returns. We dichotomized the cumulative abnormal returns as high if the value was positive and low if the value was negative to further validate our model with a modified operationalization (Kar & Dwivedi, 2020). Table 4 shows the results from both fixed effect and random effect models in the classification of cumulative abnormal returns. The results suggest that prior year SCAR has a significant negative effect on cumulative abnormal returns. Firm size and sales growth have significant positive effects on cumulative abnormal returns. Negative sentiments have a significant negative effect on cumulative abnormal returns. Interaction of positive sentiments and sales growth has significant negative impact on abnormal returns. Such a pattern suggests that the magnitude of the positive sentiments effect becomes weaker at higher values of sales growth. Interaction of positive sentiments and MB_ratio has a significant positive impact on abnormal returns. Hence, the magnitude of the positive sentiments effect becomes stronger at higher values of MB_ratio. Interaction of negative sentiments and sales growth have significant negative effects on cumulative abnormal returns. Such a pattern suggests that the magnitude of the negative sentiments effect becomes stronger at higher values of sales growth. Finally, interaction of negative sentiments and MB_ratio has a significant negative effect on cumulative abnormal returns. Hence, the magnitude of the negative sentiments effect becomes stronger at higher values of MB_ratio. For additional insights on the patterns, please refer to the interaction plots in the appendix.",
  "zh": "我們也檢視了累積異常報酬的上升與下降趨勢：把累積異常報酬為正者歸為「高」、為負者歸為「低」，以修改後的操作化方式進一步驗證模型（Kar & Dwivedi, 2020）。表 4 列出固定效果與隨機效果模型對累積異常報酬分類的結果。結果顯示，前一年的 SCAR 對累積異常報酬有顯著負向影響；公司規模與營收成長率有顯著正向影響；負面情緒有顯著負向影響。正面情緒與營收成長率的交互作用對異常報酬有顯著負向影響，顯示營收成長率越高，正面情緒的效果越弱。正面情緒與市值淨值比的交互作用有顯著正向影響，因此市值淨值比越高，正面情緒的效果越強。負面情緒與營收成長率的交互作用有顯著負向影響，顯示營收成長率越高，負面情緒的效果越強。最後，負面情緒與市值淨值比的交互作用有顯著負向影響，因此市值淨值比越高，負面情緒的效果越強。更多型態請參考附錄中的交互作用圖。",
  "pdfPage": "PDF P.5–6",
  "subSection": "4.1 表 4：SCAR 二元化的穩健性檢定"
 },
 "results-11": {
  "kind": "original",
  "en": "4.2. Machine learning techniques\nThe third phase in our framework focuses on using machine learning techniques to predict firm performance and assess accuracy and errors with the specified relationship and data sources. We used several machine learning algorithms to test the accuracy of models using quantitative summary data and both quantitative and text data. Studies that apply machine learning in management disciplines typically use different specifications of decision trees, random forests, and neural networks (see Choudhury et al., 2021). In general, researchers and data scientists do not know a priori the best machine learning algorithm that fits their inquiry or situation (Choudhury et al., 2021). Given our objective of exploring the synergy among different data sources and methods, with special emphasis on prediction accuracy, we adopted two basic rules for deploying machine learning algorithms. First, we chose machine learning algorithms that fit the specification of SCAR (i.e., classification algorithms for the binary specification and regression-based algorithms for the non-binary specification). Decision trees, random forests, and neural networks can be adjusted to work with binary and non-binary specifications of the dependent variable (Choudhury et al., 2021). Second, we chose algorithms that offer medium to high capacity—algorithm’s capacity to achieve high predictive performance (Choudhury et al., 2021). For classification and regression-based prediction, decision trees, random forests, and neural networks also satisfy the objective of prediction performance (Choudhury et al., 2021).",
  "zh": "4.2. 機器學習技術\n框架的第三階段著重在使用機器學習技術預測企業績效，並在設定好的關係與資料來源下評估準確度與誤差。我們使用多種機器學習演算法，分別測試「只用量化總結資料」與「同時使用量化與文字資料」的模型準確度。在管理學科中應用機器學習的研究，通常會使用不同設定的決策樹、隨機森林與類神經網路（見 Choudhury et al., 2021）。一般而言，研究者與資料科學家事前並不知道哪一種演算法最適合他們的問題或情境（Choudhury et al., 2021）。由於我們的目標是探索不同資料來源與方法之間的綜效，並特別重視預測準確度，我們採用兩個部署機器學習演算法的基本原則。第一，選擇符合 SCAR 設定的演算法（二元設定用分類演算法，非二元設定用迴歸類演算法）；決策樹、隨機森林與類神經網路都可以調整為適用於二元與非二元的依變數（Choudhury et al., 2021）。第二，選擇具有中到高「容量」的演算法——也就是能達到高預測表現的能力（Choudhury et al., 2021）。就分類與迴歸預測而言，決策樹、隨機森林與類神經網路也都符合預測表現的目標（Choudhury et al., 2021）。",
  "pdfPage": "PDF P.6–7",
  "subSection": "4.2 機器學習的兩個選用原則"
 },
 "results-12": {
  "kind": "original",
  "en": "We found that accuracy of the models was quite high and errors were low when both quantitative and textual data was used. Table 5 shows the results of machine learning algorithms using only quantitative data. Table 6 shows the results of machine learning algorithms using both quantitative and text data in predicting cumulative abnormal returns. On comparing Tables 5 and 6, we notice that textual data in conjunction with quantitative data results in better accuracy and low errors.",
  "zh": "我們發現，同時使用量化與文字資料時，模型的準確度相當高、誤差較低。表 5 列出只使用量化資料的機器學習結果，表 6 列出同時使用量化與文字資料預測累積異常報酬的結果。比較表 5 與表 6，我們注意到文字資料搭配量化資料，能得到較好的準確度與較低的誤差。\n〔對照表 5、6：並非每個模型都改善。五個模型中有四個的 RMSE 上升（提升決策樹 0.340→0.386、決策森林 0.321→0.341、線性迴歸 2.358→2.490、類神經網路 0.306→0.450），只有貝氏線性迴歸下降；類神經網路的 MAE 也由 0.224 升至 0.265；除決策森林（0.149）外，其餘模型的判定係數皆為負值。〕",
  "pdfPage": "PDF P.7",
  "subSection": "4.2 表 5 vs 表 6：連續 SCAR 的預測"
 },
 "results-14": {
  "kind": "original",
  "en": "We also used machine learning techniques to compare the accuracy of the classification of cumulative abnormal returns. We notice from Tables 7 and 8 that text data along with quantitative data provide better accuracy as compared to quantitative data used alone in the classification of cumulative abnormal returns. For instance, two-class bayes point machine provided 84% accuracy when both quantitative and text data was used as compared to the accuracy of 70.7% when only quantitative data was used.",
  "zh": "我們也用機器學習技術比較累積異常報酬的分類準確度。從表 7 與表 8 可以看出，在累積異常報酬的分類上，文字資料搭配量化資料的準確度，優於只使用量化資料。例如，二元貝氏點機在同時使用量化與文字資料時準確度為 84%，只使用量化資料時則為 70.7%。",
  "pdfPage": "PDF P.7",
  "subSection": "4.2 表 7 vs 表 8：SCAR 二元分類"
 },
 "disc-1": {
  "kind": "original",
  "en": "5. Discussion and implications\nAs diverse information sources continue to explode on the web, investors and companies will find systematic approaches that embrace these sources indispensable for investment decisions. Building on existing research, we propose a framework of synergistic data sources and methods to move beyond addressing typical questions of “what is hidden in the data” to “how hidden factors are inter-related” or “why is this so” (Kar & Dwivedi, 2020, p. 2) in the context of financial measures and companies. We employ both machine learning and econometric techniques to examine the effects of sentiments from news articles and financial measures on annual cumulative abnormal returns.",
  "zh": "5. 討論與意涵\n隨著網路上的多元資訊來源持續爆增，投資人與企業會發現，能納入這些來源的系統化做法是投資決策不可或缺的。在既有研究的基礎上，我們提出一個資料來源與方法協同的框架，在財務指標與企業的脈絡中，從回答「資料裡藏了什麼」這類典型問題，進一步走向「隱藏因素彼此如何關聯」或「為什麼會這樣」（Kar & Dwivedi, 2020, p. 2）。我們同時使用機器學習與計量經濟技術，檢驗新聞文章情緒與財務指標對年度累積異常報酬的影響。",
  "pdfPage": "PDF P.7",
  "subSection": "5. 討論與研究發現總結"
 },
 "disc-2": {
  "kind": "original",
  "en": "Our findings suggest that sentiments introduce important dynamics that shape the effects of quantitative financial measures on annual cumulative abnormal returns. The findings were consistent across different model estimations—suggesting positive effects of positive sentiments and negative effects of negative sentiments on cumulative abnormal returns.",
  "zh": "我們的研究發現顯示，情緒帶來了重要的動態，會改變量化財務指標對年度累積異常報酬的影響。不同模型估計的結果一致：正面情緒對累積異常報酬有正向影響，負面情緒則有負向影響。",
  "pdfPage": "PDF P.7",
  "subSection": "5. 動態交互作用與實證規律的一致性"
 },
 "disc-3": {
  "kind": "original",
  "en": "We also found that high sales growth and MB_ratio generate high cumulative abnormal returns but the effect diminishes when the positive sentiments in the market are high. On the contrary, higher negative sentiments subsides the influence of higher sales growth and MB_ratio on cumulative abnormal returns. We extended the econometric analysis using machine learning techniques and found that textual data in conjunction with quantitative measures provide higher prediction accuracy of cumulative abnormal returns.",
  "zh": "我們也發現，高營收成長率與高市值淨值比會帶來較高的累積異常報酬，但當市場上的正面情緒很高時，這個效果會減弱。相反地，較高的負面情緒會削弱高營收成長率與高市值淨值比對累積異常報酬的影響。我們以機器學習技術延伸計量分析，發現文字資料搭配量化指標，能提高對累積異常報酬的預測準確度。",
  "pdfPage": "PDF P.7–8",
  "subSection": "5. 非線性機制：高成長的鈍化 vs 負面情緒的破壞"
 },
 "disc-4": {
  "kind": "original",
  "en": "5.1. Theoretical implications and expected contributions\nThe main objective of the proposed framework is to illustrate the value of diverse information sources and methods. Although our work presents an exemplar, our findings introduce a new lens for potential theory development in two ways. First, our framework offers guidance with problem formulation using analytics. Specifically, we propose a realistic view of firm performance by examining interactions of predictors that have been typically examined as direct effects.",
  "zh": "5.1. 理論意涵與預期貢獻\n所提出框架的主要目的，是說明多元資訊來源與方法的價值。雖然本研究只是一個範例，但研究發現從兩方面為未來的理論發展提供新的視角。第一，我們的框架為運用分析方法建構研究問題提供指引。具體而言，我們檢視以往通常只被當作直接效應檢驗的預測因子之間的交互作用，對企業績效提出更貼近現實的看法。",
  "pdfPage": "PDF P.8",
  "subSection": "5.1 理論意涵 1：問題建構視角的典範轉移"
 },
 "disc-5": {
  "kind": "original",
  "en": "For instance, Hájek (2018) used financial indicators and qualitative data to examine direct effects on abnormal stock returns but did not consider interaction effects tied to new data sources. Hence, our findings complement the finance and accounting literature on predictive analytics in the context of financial performance of companies.",
  "zh": "例如，Hájek（2018）使用財務指標與質性資料檢驗對異常股票報酬的直接效應，但沒有考慮與新資料來源相關的交互效應。因此，我們的發現補充了財務與會計文獻中，以預測分析探討公司財務績效的研究。",
  "pdfPage": "PDF P.8",
  "subSection": "5.1 理論意涵 2：彌補財務會計文獻之主流媒體空白"
 },
 "disc-6": {
  "kind": "original",
  "en": "Prior literature has studied the role of online word-of-mouth and sentiments, mainly using analysts’ reports, in predicting key performance measures of companies, but remained silent on the role of news articles on cumulative abnormal returns of the company. Our study highlighted the importance of diverse information by using information theory and market adaptive theory in the new context (see Johns, 2006).",
  "zh": "過去文獻主要使用分析師報告，研究線上口碑與情緒對公司主要績效指標的預測作用，但對新聞文章與公司累積異常報酬之間的關係則沒有著墨。本研究在新的脈絡中運用資訊理論與適應性市場理論，凸顯多元資訊的重要性（見 Johns, 2006）。",
  "pdfPage": "PDF P.8",
  "subSection": "5.1 理論意涵 3：權威報刊 vs 散戶口耳相傳"
 },
 "disc-7": {
  "kind": "original",
  "en": "Second, our framework offers guidance with leveraging mixed-methods and setting a threshold for sample size and accuracy and error rates. For instance, a sample of S&P 500 index companies provides greater confidence for the generalizability of the results. With higher accuracy and lower error rates, our work complements prior literature on word-of-mouth by rigorously demonstrating that sentiments from business journals play an important role in the prediction of financial measures of a company. Further, we developed a web-scraping program in Python to extract rich text for each company on a day to day basis. Our dataset comprises diverse information content about the examined companies. Finally, our use of machine learning and econometric techniques opens avenues for future researchers to deploy similar effective approaches and unearth insights from textual information.",
  "zh": "第二，我們的框架為運用混合方法，以及設定樣本規模、準確度與誤差率的門檻提供指引。例如，以 S&P 500 指數成分公司為樣本，讓結果的可推廣性更有信心。本研究以較高的準確度與較低的誤差率，嚴謹地證明商業報刊的情緒在預測公司財務指標上扮演重要角色，補充了過去關於口碑的文獻。此外，我們開發了 Python 網頁爬蟲程式，逐日擷取每家公司的豐富文字，資料集涵蓋了所研究公司的多元資訊內容。最後，結合機器學習與計量經濟技術，也為未來研究者運用類似的有效方法、從文字資訊中挖掘洞見開闢了道路。",
  "pdfPage": "PDF P.8",
  "subSection": "5.1 理論意涵 4：混合方法樣本規模與精度基準"
 },
 "disc-8": {
  "kind": "original",
  "en": "5.2. Limitations and future research\nOur results indicate that sentiments play a major part in predicting financial performance of the companies. We used longitudinal data for S&P 500 index companies from news articles published in the Wall Street Journal. However, future research could build on our study in three ways. First, although the Wall Street Journal is a reputable source with high coverage, future research could study news articles published in other business journals.",
  "zh": "5.2. 研究限制與未來研究\n我們的結果顯示，情緒在預測公司財務績效上扮演重要角色。我們使用的是 S&P 500 指數成分公司、來自《華爾街日報》新聞文章的縱貫資料。未來研究可以從三方面延續本研究。第一，雖然《華爾街日報》是報導涵蓋面廣的權威來源，未來研究可以探討其他商業報刊所刊登的新聞文章。",
  "pdfPage": "PDF P.8",
  "subSection": "5.2 研究限制與未來方向：新聞來源拓展"
 },
 "disc-9": {
  "kind": "original",
  "en": "Second, future research could reassess the interaction effect in our model (i.e., identify an additional moderator) using more sources and approaches to sentiment analysis, such as social media and topic modeling in general (Kar, 2020) or content pertaining to corporate social responsibility in particular (Grover et al., 2019).",
  "zh": "第二，未來研究可以使用更多資料來源與情緒分析方法，重新評估模型中的交互效應（也就是找出額外的調節變數），例如一般性的社群媒體與主題模型（Kar, 2020），或特別是與企業社會責任相關的內容（Grover et al., 2019）。",
  "pdfPage": "PDF P.8",
  "subSection": "5.2 研究限制與未來方向：新興調節變數與主題模型"
 },
 "disc-10": {
  "kind": "original",
  "en": "Finally, we studied sentiments from news articles published in 2013–2016. Future research could build on our approach to extract data over longer and other periods of time, as longer and/or different manifestations of time may reveal additional insights on the phenomenon of interest (Venkatesh, Maruping, & Brown, 2006; Venkatesh, Sykes, Aljafari, & Poole, 2021).",
  "zh": "最後，我們研究的是 2013–2016 年刊登的新聞文章情緒。未來研究可以沿用我們的方法，擷取更長或其他期間的資料，因為更長及／或不同形式的時間，可能揭示關於此現象的更多洞見（Venkatesh, Maruping, & Brown, 2006; Venkatesh, Sykes, Aljafari, & Poole, 2021）。",
  "pdfPage": "PDF P.8",
  "subSection": "5.2 研究限制與未來方向：縱向時間維度延展"
 },
 "disc-11": {
  "kind": "original",
  "en": "5.3. Implications to practice\nOur findings offer important practical guidance, especially with our focus on a key outcome for distinguishing between excellent investment opportunities and firms and/or investments and sentiments from news articles. Investors should not rely solely on past summary measures given their interaction effects with sentiments from news articles.",
  "zh": "5.3. 實務意涵\n我們的研究發現提供了重要的實務指引，特別是因為我們聚焦在一個能區分絕佳投資機會與公司、和／或投資與新聞文章情緒的關鍵結果。由於過去的總結性指標與新聞文章情緒之間存在交互效應，投資人不應只依賴過去的總結性指標。",
  "pdfPage": "PDF P.8",
  "subSection": "5.3 實務啟示：投資人與基金經理人之決策指南"
 },
 "disc-12": {
  "kind": "original",
  "en": "Given that sentiment analysis is widely used in practice (Kumar et al., 2021), managers could adopt our approach and consider employing sentiments in their analytical models when forecasting the growth of their companies. Although positive sentiments could foster growth as management can engage in expansion of the company, negative sentiments caution the management and provide an opportunity to take corrective actions before the company starts to fall apart. Also, our study highlights that positive sentiments do not play a major role when the quantitative performance of the companies is high and the effect of positive sentiments diminishes over a period of time. On the contrary, negative sentiments play an important role and subsides the influence of past quantitative measures in the prediction of cumulative abnormal returns.",
  "zh": "由於情緒分析在實務上已被廣泛使用（Kumar et al., 2021），管理者可以採用我們的方法，在預測公司成長時，考慮把情緒納入分析模型。正面情緒可以促進成長，讓管理階層推動公司擴張；負面情緒則提醒管理階層，讓他們有機會在公司開始崩壞之前採取修正行動。此外，本研究也凸顯：當公司的量化績效很高時，正面情緒的作用不大，而且正面情緒的效果會隨時間遞減。相反地，在預測累積異常報酬時，負面情緒扮演重要角色，並會削弱過去量化指標的影響。",
  "pdfPage": "PDF P.8",
  "subSection": "5.3 實務啟示：企業高層管理者的預警與擴張策略"
 },
 "conc-1": {
  "kind": "original",
  "en": "6. Conclusion\nDiverse information sources on the web and the emergence of predictive analytics emphasize the need to move beyond traditional financial measures as key predictors of firm performance. Although empirical research suggests that information sources from particular sources and financial measures complement each other by providing a clear picture of firm performance, less is known about the role of additional textual content that continues to emerge and reach more potential investors on the web.",
  "zh": "6. 結論\n網路上的多元資訊來源與預測分析的興起，凸顯必須超越傳統財務指標作為企業績效主要預測因子的做法。雖然實證研究指出，特定來源的資訊與財務指標彼此互補，能更清楚地呈現企業績效，但對於網路上持續出現、並觸及更多潛在投資人的其他文字內容扮演什麼角色，我們所知仍然有限。",
  "pdfPage": "PDF P.8",
  "subSection": "6. 結論：預測分析學時代的典範轉移"
 },
 "conc-2": {
  "kind": "original",
  "en": "Using additional textual content, we demonstrate a valuable synergy among sentiment analysis, machine learning, and econometrics methods to predict abnormal returns over time. We examine content extracted from the textual articles for S&P 500 index companies published in the Wall Street Journal (years 2013–2016).",
  "zh": "我們運用更多文字內容，展示了情緒分析、機器學習與計量經濟方法在預測異常報酬上的綜效。我們分析了《華爾街日報》（2013–2016 年）刊登、與 S&P 500 指數成分公司相關的文章內容。",
  "pdfPage": "PDF P.8",
  "subSection": "6. 協同綜效與標普 500 實證總結"
 },
 "conc-3": {
  "kind": "original",
  "en": "We find that textual analysis of business journals in conjunction with quantitative measures introduce direct and interaction effects, as sentiments shape the effects of quantitative measures on cumulative abnormal returns. Our theory-based approach offers important practical insights about the role of sentiment in conjunction with past quantitative summary measures.",
  "zh": "我們發現，商業報刊的文字分析搭配量化指標，會產生直接效應與交互效應，因為情緒會改變量化指標對累積異常報酬的影響。我們以理論為基礎的做法，為情緒搭配過去量化總結性指標所扮演的角色，提供了重要的實務洞見。",
  "pdfPage": "PDF P.8",
  "subSection": "6. 終極發現：情緒重塑財務指標之實質定價"
 },
 "methods-4": {
  "kind": "original",
  "en": "Table 1. Financial data variable list (1/4)\nDatadate: fiscal year end date; Fyear: fiscal year; Tic: company code/ ticker symbol; Conm: company name",
  "zh": "表 1. 財務資料變數清單（1/4）\nDatadate：會計年度結束日；Fyear：會計年度；Tic：公司代碼／股票代號；Conm：公司名稱",
  "pdfPage": "PDF P.4（表 1）",
  "subSection": "3.1 表 1 財務變數清單（1/4）"
 },
 "methods-5": {
  "kind": "original",
  "en": "Table 1. Financial data variable list (2/4)\nCsho: common shares outstanding for fiscal year; Ib: income before extraordinary items for fiscal year; Revt: total revenues for a fiscal year; Teq: stockholders’ equity",
  "zh": "表 1. 財務資料變數清單（2/4）\nCsho：該會計年度流通在外普通股股數；Ib：該會計年度非常項目前淨利；Revt：該會計年度總營收；Teq：股東權益",
  "pdfPage": "PDF P.4（表 1）",
  "subSection": "3.1 表 1 財務變數清單（2/4）"
 },
 "methods-6": {
  "kind": "original",
  "en": "Table 1. Financial data variable list (3/4)\nXsga: selling, general and administrative expenses; Mkvalt: total market value (also used as a proxy for firm size); Prcc_f: fiscal year closing price; Returns: change in fiscal year closing price as a percentage of previous fiscal year closing price",
  "zh": "表 1. 財務資料變數清單（3/4）\nXsga：銷售、一般及管理費用；Mkvalt：總市值（也作為公司規模的代理變數）；Prcc_f：會計年度收盤價；Returns：會計年度收盤價相對前一會計年度收盤價的變動百分比",
  "pdfPage": "PDF P.4（表 1）",
  "subSection": "3.1 表 1 財務變數清單（3/4）"
 },
 "methods-7": {
  "kind": "original",
  "en": "Table 1. Financial data variable list (4/4)\nPrice to earnings ratio: proportion of total market to the income before extraordinary items for given fiscal year; Market to book ratio: proportion of total market to the stockholders’ equity for given fiscal year; sales growth: change in total revenues for fiscal year as percentage of previous fiscal year total revenues; SCAR: standardized cumulative abnormal returns",
  "zh": "表 1. 財務資料變數清單（4/4）\n本益比：該會計年度總市值除以非常項目前淨利；市值淨值比：該會計年度總市值除以股東權益；營收成長率：該會計年度總營收相對前一年度總營收的變動百分比；SCAR：標準化累積異常報酬",
  "pdfPage": "PDF P.4（表 1）",
  "subSection": "3.1 表 1 財務變數清單（4/4）"
 },
 "meta-1": {
  "kind": "original",
  "pdfPage": "PDF P.1",
  "subSection": "書目資訊與引用格式",
  "en": "Raman, R., Aljafari, R., Venkatesh, V., & Richardson, V. (2022). Mixed-methods research in the age of analytics, an exemplar leveraging sentiments from news articles to predict firm performance. International Journal of Information Management, 64, 102451. https://doi.org/10.1016/j.ijinfomgt.2021.102451\nReceived 28 February 2021; Received in revised form 5 October 2021; Accepted 4 November 2021; Available online 28 February 2022. Open access under the CC BY-NC-ND license.",
  "zh": "引用格式（APA）：Raman, R., Aljafari, R., Venkatesh, V., & Richardson, V. (2022). 分析學時代的混合方法研究：以新聞文章情緒預測企業績效的範例。International Journal of Information Management, 64, 102451.\n2021 年 2 月 28 日收稿；2021 年 10 月 5 日修訂；2021 年 11 月 4 日接受；2022 年 2 月 28 日線上刊出。以 CC BY-NC-ND 授權開放取用。\n（註：SSRN 預印本的標題是「…to Explain Firm Performance」，期刊正式版是「…to Predict Firm Performance」。）"
 },
 "meta-2": {
  "kind": "original",
  "pdfPage": "PDF P.1",
  "subSection": "作者與所屬機構",
  "en": "Raji Raman (Pamplin College of Business, Virginia Tech, Blacksburg, Virginia, USA); Ruba Aljafari (Katz Graduate School of Business, University of Pittsburgh, Pittsburgh, Pennsylvania, USA); Viswanath Venkatesh* (Pamplin College of Business, Virginia Tech, Blacksburg, Virginia, USA); Vernon Richardson (Walton College of Business, University of Arkansas, Fayetteville, Arkansas, USA). *Corresponding author.",
  "zh": "Raji Raman（美國維吉尼亞理工大學 Pamplin 商學院）；Ruba Aljafari（美國匹茲堡大學 Katz 商學研究院）；Viswanath Venkatesh*（美國維吉尼亞理工大學 Pamplin 商學院）；Vernon Richardson（美國阿肯色大學 Walton 商學院）。*通訊作者。"
 },
 "conc-4": {
  "kind": "original",
  "pdfPage": "PDF P.3、P.5",
  "subSection": "圖說（原文）",
  "en": "Fig. 1. A framework of information sources and methods. (p. 3)\nFig. 2. Textual file for Intel generated from Python. (p. 5)\nFig. 3. Part of the sentiment file generated using R for Intel. (p. 5)",
  "zh": "圖 1. 資訊來源與方法的框架（第 3 頁）\n圖 2. 以 Python 產生的 Intel 文字檔（第 5 頁）\n圖 3. 以 R 產生的 Intel 部分情緒檔（第 5 頁）"
 },
 "conc-5": {
  "kind": "extended",
  "pdfPage": "依 PDF P.9 附錄圖整理",
  "subSection": "附錄：交互作用圖（情緒 × 營收成長率）",
  "en": "Appendix. Interaction plots — \"Sentiments and Sales Growth\" (p. 9). The appendix contains a single figure with two panels (Low/High Positive; Low/High Negative). In each panel only one solid line is visible, rising from SCAR ≈ 2.0 (low sales growth) to ≈ 5.4 (high sales growth); the \"High\" series is not visibly plotted (only a vertical dashed line appears). There is no interaction plot for MB_ratio.",
  "zh": "附錄：交互作用圖「情緒與營收成長率」（第 9 頁）。附錄只有一張圖，分上下兩格（低／高正面情緒；低／高負面情緒）。兩格都只看得到一條實線，SCAR 從低營收成長時約 2.0 升到高營收成長時約 5.4；圖例中的「高」那一組並沒有清楚畫出來（只出現一條垂直虛線）。因此，從這張圖本身其實看不出「斜率變平」的交互效果。原文也沒有市值淨值比的交互作用圖。"
 },
 "conc-6": {
  "kind": "extended",
  "pdfPage": "非原文",
  "subSection": "附錄說明（非原文）",
  "en": "Note (not in the paper): The published article has no interaction plot for MB_ratio. The MB_ratio interactions are reported only in Tables 2–4 and described in the text of Section 4.1.",
  "zh": "說明（非原文）：期刊正式版沒有「市值淨值比」的交互作用圖。市值淨值比的交互作用只出現在表 2–4，以及 4.1 節的文字描述中。"
 },
 "conc-7": {
  "kind": "reference",
  "pdfPage": "PDF P.9–11（參考文獻）",
  "subSection": "本文引用的重要文獻",
  "en": "Key references cited in the paper: Ballinger (2004); Choudhury, Allen, & Endres (2021); Hájek (2018); Huang, Zang, & Zheng (2014); Kar & Dwivedi (2020); Lo (2004); Shannon (1948); Shmueli & Koppius (2011); Tetlock (2007).",
  "zh": "本文引用的重要文獻：Ballinger（2004，GEE）；Choudhury、Allen 與 Endres（2021，管理研究中的機器學習）；Hájek（2018，年報文字與異常報酬）；Huang、Zang 與 Zheng（2014，分析師報告的文字資訊含量）；Kar 與 Dwivedi（2020，從 What 走向 Why）；Lo（2004，適應性市場假說）；Shannon（1948，資訊理論）；Shmueli 與 Koppius（2011，資訊系統研究中的預測分析）；Tetlock（2007，媒體與投資人情緒）。\n（註：Loughran & McDonald（2011）的原始詞典論文並未列在本文參考文獻中。）"
 },
 "conc-10": {
  "kind": "reference",
  "en": "Shannon, C. E. (1948). A mathematical theory of communication. Bell System Technical Journal, 27(3), 379–423.",
  "zh": "Shannon（1948）〈通訊的數學理論〉。資訊理論的奠基論文，本文用來說明「資訊能降低不確定性」。（說明為本平台補充）",
  "pdfPage": "PDF P.9–11（參考文獻）",
  "subSection": "參考文獻：Shannon, C. E."
 },
 "conc-11": {
  "kind": "reference",
  "en": "Lo, A. (2004). The adaptive market hypothesis: Market efficiency from an evolutionary perspective. Journal of Portfolio Management, 30, 15–29.",
  "zh": "Lo（2004）〈適應性市場假說：從演化觀點看市場效率〉。本文用來說明市場並非完全有效率，需要納入多元資訊。（說明為本平台補充）",
  "pdfPage": "PDF P.9–11（參考文獻）",
  "subSection": "參考文獻：Lo, A."
 },
 "conc-12": {
  "kind": "reference",
  "en": "Tetlock, P. C. (2007). Giving content to investor sentiment: The role of media in the stock market. The Journal of finance, 62(3), 1139–1168.",
  "zh": "Tetlock（2007）〈為投資人情緒賦予內容：媒體在股市中的角色〉。本文引用它說明新聞報導對預測盈餘與報酬的價值。（說明為本平台補充）",
  "pdfPage": "PDF P.9–11（參考文獻）",
  "subSection": "參考文獻：Tetlock, P. C."
 },
 "conc-13": {
  "kind": "reference",
  "en": "Ballinger, G. A. (2004). Using generalized estimating equations for longitudinal data analysis. Organizational Research Methods, 7(2), 127–150.",
  "zh": "Ballinger（2004）〈以廣義估計方程式分析縱貫資料〉。本文 GEE 方法與相關矩陣結構的依據。（說明為本平台補充）",
  "pdfPage": "PDF P.9–11（參考文獻）",
  "subSection": "參考文獻：Ballinger, G. A."
 },
 "conc-14": {
  "kind": "reference",
  "en": "Shmueli, G., & Koppius, O. R. (2011). Predictive analytics in information systems research. MIS Quarterly, 35(3), 553–572.",
  "zh": "Shmueli 與 Koppius（2011）〈資訊系統研究中的預測分析〉。本文「先解釋、再預測」順序的依據。（說明為本平台補充）",
  "pdfPage": "PDF P.9–11（參考文獻）",
  "subSection": "參考文獻：Shmueli, G., & Koppius, O. R."
 },
 "conc-16": {
  "kind": "reference",
  "en": "Choudhury, P., Allen, R. T., & Endres, M. G. (2021). Machine learning for pattern discovery in management research. Strategic Management Journal, 42(1), 30–57.",
  "zh": "Choudhury、Allen 與 Endres（2021）〈管理研究中以機器學習發掘型態〉。本文挑選演算法的兩個原則即引自此文。（說明為本平台補充）",
  "pdfPage": "PDF P.9–11（參考文獻）",
  "subSection": "參考文獻：Choudhury, P., Allen, R. T., & Endres, M. G."
 },
 "conc-17": {
  "kind": "reference",
  "en": "Huang, A. H., Zang, A. Y., & Zheng, R. (2014). Evidence on the information content of text in analyst reports. The Accounting Review, 89(6), 2151–2180.",
  "zh": "Huang、Zang 與 Zheng（2014）〈分析師報告中文字資訊含量的證據〉。本文只用正負面情緒、以及多項變數選擇的依據。（說明為本平台補充）",
  "pdfPage": "PDF P.9–11（參考文獻）",
  "subSection": "參考文獻：Huang, A. H., Zang, A. Y., & Zheng, R."
 },
 "conc-18": {
  "kind": "reference",
  "en": "Kar, A. K., & Dwivedi, Y. K. (2020). Theory building with big data-driven research–Moving away from the “What” towards the “Why”. International Journal of Information Management, 54, Article 102205.",
  "zh": "Kar 與 Dwivedi（2020）〈大數據研究中的理論建構：從 What 走向 Why〉。本文最常引用的方法依據。（說明為本平台補充）",
  "pdfPage": "PDF P.9–11（參考文獻）",
  "subSection": "參考文獻：Kar, A. K., & Dwivedi, Y. K."
 },
 "conc-19": {
  "kind": "reference",
  "en": "Comparitech, 2017, Analysis: How data breaches affect stock market share prices. St. John, A., 2018, Facebook breach exposed personal data of millions of users.",
  "zh": "Comparitech（2017）〈資料外洩如何影響股價〉；St. John（2018）〈Facebook 外洩數百萬名使用者個資〉。本文引言與 2.2 節案例的出處（皆為網路文章）。（說明為本平台補充）",
  "pdfPage": "PDF P.9–11（參考文獻）",
  "subSection": "參考文獻：Comparitech, 2017, Analysis: How data breaches affect stock market share prices. St. John, A., 2018, Facebook breach exposed personal data of millions of users."
 },
 "conc-15": {
  "kind": "extended",
  "pdfPage": "非原文",
  "subSection": "延伸文獻：Loughran & McDonald (2011)",
  "en": "Loughran, T., & McDonald, B. (2011). When is a liability not a liability? Textual analysis, dictionaries, and 10-Ks. The Journal of Finance, 66(1), 35–65. — Note: this is the original source of the LM dictionary, but it is NOT listed in the paper’s references; the paper only links to the LM word lists in footnote 1.",
  "zh": "Loughran 與 McDonald（2011）〈負債何時不是負債？文字分析、詞典與 10-K〉。這是 LM 金融詞典的原始出處，但本文參考文獻並未列出；本文只在註腳 1 附上 LM 詞表的網址。"
 },
 "results-13": {
  "kind": "table",
  "pdfPage": "依表 5–6 整理（P.7）"
 },
 "results-15": {
  "kind": "table",
  "pdfPage": "依表 7–8 整理（P.7）"
 },
 "results-19": {
  "kind": "table",
  "pdfPage": "依表 7–8 整理（P.7）"
 },
 "conc-9": {
  "kind": "table",
  "pdfPage": "依表 7–8 整理（P.7）"
 },
 "results-16": {
  "kind": "table",
  "pdfPage": "依表 7–8 整理（P.7）",
  "subSection": "表 7 vs 表 8：九種分類演算法全部提升",
  "en": "Across all nine classification algorithms in Tables 7 and 8 (Bayes Point Machine, Averaged Perceptron, Boosted Decision Tree, Decision Forest, Decision Jungle, Locally-Deep SVM, Logistic Regression, Neural Network, SVM), both accuracy and AUC are higher when text metrics are added.",
  "zh": "表 7 與表 8 共九種分類演算法（貝氏點機、平均感知器、提升決策樹、決策森林、決策叢林、局部深層 SVM、邏輯迴歸、類神經網路、SVM），加入文字指標後，準確率與 AUC 全部提高。"
 },
 "results-20": {
  "kind": "table",
  "pdfPage": "依表 7–8 整理（P.7）",
  "subSection": "表 7 vs 表 8：類神經網路",
  "en": "Two-Class Neural Network accuracy rose from 71.4% (AUC 51.5%) to 79.7% (AUC 74.0%) when text metrics were added. Note that the text metrics are only two standardized word-count proportions (Positive, Negative), not text embeddings.",
  "zh": "加入文字指標後，二元類神經網路的準確率由 71.4%（AUC 51.5%）提高到 79.7%（AUC 74.0%）。要注意：這裡的「文字指標」只有正面、負面兩個標準化字數比例，並不是詞向量（embedding）。"
 },
 "conc-8": {
  "kind": "table",
  "pdfPage": "依表 2–4 整理（P.5–6）",
  "subSection": "表 2–4 計量結果整理",
  "en": "Summary of Tables 2–4: Positive sentiment is positive in every model (GEE 13.665*, FE 16.621**, RE 11.791*). Negative sentiment is negative and significant in GEE (−11.119***) and RE (−11.544***), but not significant in the fixed-effect model of Table 3 (−1.821, SE 3.365). Sales_growth × Positive is negative in every model (GEE −102.094**, FE −15.313*, RE −99.499**), with very different magnitudes.",
  "zh": "表 2–4 整理：正面情緒在每個模型都為正（GEE 13.665*、固定效果 16.621**、隨機效果 11.791*）。負面情緒在 GEE（−11.119***）與隨機效果（−11.544***）為顯著負向，但在表 3 的固定效果模型並不顯著（−1.821，標準誤 3.365）。營收成長率 × 正面情緒在每個模型都為負（GEE −102.094**、固定效果 −15.313*、隨機效果 −99.499**），但大小差異很大。"
 },
 "meta-3": {
  "kind": "extended",
  "pdfPage": "非原文"
 },
 "intro-19": {
  "kind": "extended",
  "pdfPage": "非原文",
  "en": "Note (not in the paper): The paper uses standardized cumulative abnormal returns (SCAR) as the outcome, but does not specify the expected-return benchmark (e.g., market model or CAPM), the accumulation window, or how the standardization was done; it only states that the data came from Compustat and Eventus.",
  "zh": "說明（非原文）：本文以標準化累積異常報酬（SCAR）作為結果變數，但沒有說明預期報酬的基準模型（例如市場模型或 CAPM）、累積的期間，也沒有說明如何標準化；只提到資料來自 Compustat 與 Eventus。這是復刻時必須自行補齊的設定。"
 },
 "intro-20": {
  "kind": "extended",
  "pdfPage": "非原文"
 },
 "intro-21": {
  "kind": "extended",
  "pdfPage": "非原文"
 },
 "theory-19": {
  "kind": "extended",
  "pdfPage": "非原文"
 },
 "theory-20": {
  "kind": "extended",
  "pdfPage": "非原文"
 },
 "theory-21": {
  "kind": "extended",
  "pdfPage": "非原文"
 },
 "theory-22": {
  "kind": "extended",
  "pdfPage": "非原文"
 },
 "methods-20": {
  "kind": "extended",
  "pdfPage": "非原文"
 },
 "methods-21": {
  "kind": "extended",
  "pdfPage": "非原文",
  "subSection": "GEE 的 QIC 適配指標（延伸說明）"
 },
 "results-17": {
  "kind": "extended",
  "pdfPage": "非原文"
 },
 "results-18": {
  "kind": "extended",
  "pdfPage": "非原文"
 },
 "results-21": {
  "kind": "extended",
  "pdfPage": "非原文"
 },
 "results-22": {
  "kind": "extended",
  "pdfPage": "非原文"
 },
 "disc-13": {
  "kind": "extended",
  "pdfPage": "非原文"
 },
 "disc-14": {
  "kind": "extended",
  "pdfPage": "非原文"
 },
 "disc-15": {
  "kind": "extended",
  "pdfPage": "非原文"
 },
 "disc-16": {
  "kind": "extended",
  "pdfPage": "非原文"
 },
 "disc-17": {
  "kind": "extended",
  "pdfPage": "非原文"
 },
 "disc-18": {
  "kind": "extended",
  "pdfPage": "非原文"
 },
 "disc-19": {
  "kind": "extended",
  "pdfPage": "非原文"
 },
 "disc-20": {
  "kind": "extended",
  "pdfPage": "非原文"
 },
 "disc-21": {
  "kind": "extended",
  "pdfPage": "非原文"
 },
 "disc-22": {
  "kind": "extended",
  "pdfPage": "非原文"
 },
 "conc-20": {
  "kind": "extended",
  "pdfPage": "非原文"
 },
 "methods-22": {
  "kind": "extended",
  "pdfPage": "非原文",
  "subSection": "時間對齊與資料切分（原文未說明）",
  "en": "Note (not in the paper): The paper does not state how predictors were time-aligned with SCAR (e.g., lagged to t−1) or whether the 60/40 split was chronological or random. Given the panel structure, a random split could let information from the same firm-year leak between training and validation sets.",
  "zh": "說明（非原文）：原文沒有說明預測變數與 SCAR 如何對齊時間（例如是否落後一期），也沒有說明 60%／40% 的切分是依時間還是隨機。由於是面板資料，若隨機切分，同一家公司的資訊可能同時出現在訓練集與驗證集，造成資料洩漏。這也是表 8 出現 99.7% 準確率時值得追問的地方。"
 }
};
export const PARA_KIND_LABEL: Record<ParaKind, string> = { original: '原文', table: '依原文表格整理', reference: '原文參考文獻', extended: '延伸解說・非原文' };
