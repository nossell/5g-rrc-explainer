/* ============================================================
   assets/content/compare.js — 两代对照视图数据（v7 块 1）
   LTE（36.331）↔ NR（38.331）同过程并排对照。
   红线：
   1) note/diff 只改写 ml.js（LTE 对照课）已审计对照帧原句——零新论断；
   2) 36.331 侧锚点（sec 字段）只允许使用 spec-quotes.js 已收录的锚点集合
     （否则原文抽屉会空引）；38.331 侧锚点全量可用。
   页面 compare.html 消费本数据；spec-quotes.js 的全局点击代理提供抽屉。
   ============================================================ */
(function (g) {
  'use strict';
  var GROUPS = [
    { key: 'access', name: '建链三步与专线' },
    { key: 'sec', name: '安全激活' },
    { key: 'recfg', name: '重配置与释放' },
    { key: 'reest', name: '拒绝与重建立' },
    { key: 'meas', name: '测量与切换' }
  ];
  var ROWS = [
    /* ---------- 建链 ---------- */
    { g: 'access', topic: '敲门信',
      lte: { m: 'RRCConnectionRequest', s: '36.331#5.3.3.3', n: 'CCCH（SRB0）上行；身份带 S-TMSI 或掷 0..2^40−1 随机数，establishmentCause 写明来意供准入排队。' },
      nr: { m: 'RRCSetupRequest', s: '38.331#5.3.3.2', n: '职责一字不差；身份换 ng-5G-S-TMSI，同样掷随机值但位宽不同（NR 39 bit）。' },
      diff: '标准改名瘦身：去掉 Connection 字样，语义没变——establishmentCause 是少数跨代无缝衔接的语义。' },
    { g: 'access', topic: '准入条（建 SRB1）',
      lte: { m: 'RRCConnectionSetup', s: '36.331#5.3.3.4', n: '内容刻意精简、按出厂默认值办事，开通 SRB1 专用信令通道。' },
      nr: { m: 'RRCSetup', s: '38.331#5.3.3.4', n: '停 T300、按默认配置建 SRB1、换 DCCH 语境——职责与 LTE 逐句对应。' },
      diff: '两条款段落结构几乎镜像——"改名瘦身"之下是成段的复制粘贴级继承；另藏彩蛋：接 5GC 的 ng-eNB 发完请求即应用 NR PDCP 默认配置（36.331 §5.3.3.3）。' },
    { g: 'access', topic: '回执捎 NAS',
      lte: { m: 'RRCConnectionSetupComplete', s: '36.331#5.3.3.4', n: 'SRB1 首条 DCCH；捎带初始 NAS（EPC 语境 Attach/Service Request），§5.3.3.1 点题"送达 E-UTRAN"。' },
      nr: { m: 'RRCSetupComplete', s: '38.331#5.3.3.4', n: '捎带 Registration Request，另带 selectedPLMN-Identity 与 registeredAMF——与 LTE 的 registeredMME 完全对位。' },
      diff: '三步建链两代同构：敲门→发钥匙→递状子；只有名字和身份字段的"代际前缀"不同。' },
    { g: 'access', topic: '信令专线家族（SRB）',
      lte: { m: 'SRB0/1/2（+SRB1bis/SRB4）', s: '36.331#4.2.2', n: 'SRB2 安全激活后才配；NB-IoT 有 SRB1bis，Rel-16 加 SRB4。' },
      nr: { m: 'SRB0/1/2（+SRB3/4/5/6）', s: '38.331#4.2.2', n: '同款同分工之外新增 SRB3（辅站捷径）；捎带纪律同句，NR 上行捎带多一句 "and connection resume"。' },
      diff: '分工规矩两代照搬；NR 的 SRB3 是双连接里给副站少绕路的新专线。' },
    /* ---------- 安全 ---------- */
    { g: 'sec', topic: '安全激活命令（同名未改）',
      lte: { m: 'SecurityModeCommand', s: '36.331#5.3.4.3', n: '先按信中算法派 KRRCint、验这条命令本身；完整性立即生效（含 Complete），加密流程走完才生效。' },
      nr: { m: 'SecurityModeCommand', s: '38.331#5.3.4.3', n: '演法逐句同构——两代并排读像同一篇课文的两种排版；失败同款 SecurityModeFailure 不带病上岗。' },
      diff: '两代最像的一帧：名字根本没改；真正的差异在钥匙树（KeNB 从 KASME/KAMF ↔ KgNB 从 KAMF）与算法前缀（EIA/EEA ↔ NIA/NEA）。' },
    /* ---------- 重配置与释放 ---------- */
    { g: 'recfg', topic: '旗舰改名消息',
      lte: { m: 'RRCConnectionReconfiguration', s: '36.331#5.3.5.1', n: '用途清单：建/改/释 RB、切换、测量、SCell、捎带 NAS——内部是 radioResourceConfigDedicated 一锅炖。' },
      nr: { m: 'RRCReconfiguration', s: '38.331#5.3.5.1', n: '用途清单原文几乎照抄；字段分餐：radioBearerConfig + secondaryCellGroupConfig + spCellConfig。' },
      diff: '改名去 Connection；"一锅炖"变"分餐制"；NAS 捎带槽位换名搬家：dedicatedInfoNASList → dedicatedNAS-MessageList（NR 藏进 v1530 扩展链）。' },
    { g: 'recfg', topic: '安全前置门槛',
      lte: { m: '配置门槛（§5.3.5.2）', s: '36.331#5.3.5.2', n: 'RB 建立（SRB1 之外）只在 AS security 激活后；mobilityControlInfo 还要 SRB2+至少一条 DRB。' },
      nr: { m: '配置门槛（§5.3.5.2）', s: '38.331#5.3.5.2', n: '逐条对应，原文连措辞都保留了；另多 IAB/中继门槛（BH RLC channel 等同样安全先行）。' },
      diff: '安全是两代共同的分水岭——没有完整性保护的重配置等于让陌生人指挥改造承重墙。' },
    { g: 'recfg', topic: '连接释放',
      lte: { m: 'RRCConnectionRelease', s: '36.331#5.3.8.3', n: '延迟 60ms 执行（等底层确认）；redirectedCarrierInfo 重定向、deprioritisationReq→T325 同款。' },
      nr: { m: 'RRCRelease', s: '38.331#5.3.8.3', n: '同款细节全保留；suspend 语义天生三态——suspendConfig 一带进 RRC_INACTIVE。' },
      diff: '大分岔在挂起：EPC 版 LTE 无 INACTIVE、接 5GC 的 LTE Rel-16 起有（§4.2.1 括号原文）、NR 从第一天就是三态。' },
    { g: 'recfg', topic: '挂起恢复失败',
      lte: { m: 'Reject + rrc-SuspendIndication', s: '36.331#5.3.3.8', n: '带开关：保持挂起（SRB1 挂起、上下文还在）；不带：释放全部并丢弃 resumeIdentity——挂起作废。' },
      nr: { m: 'T319 超时 fallback', s: '38.331#5.3.13.5', n: 'resume 窗口 T319 专管；超时记 VarConnEstFailReport 后 fallback 到全新建链（RRCSetupRequest 重走三步）。' },
      diff: '共同哲学：失败就从头再来绝不硬撑；LTE 用开关量说清"还挂不挂"，NR 直接换流程重敲。' },
    /* ---------- 拒绝与重建立 ---------- */
    { g: 'reest', topic: '拒绝信与准入控制',
      lte: { m: 'RRCConnectionReject', s: '36.331#5.3.3.8', n: '核心载荷 waitTime→T302；AC barring 按 AC 0–9 位图掷骰子，退避 Tbarring=(0.7+0.6·rand)·ac-BarringTime。' },
      nr: { m: 'RRCReject', s: '38.331#5.3.15', n: 'waitTime→T302 同款；UAC 二维矩阵——Access Category（0–79）× Access Identity（1/2/11–15），高优身份一票通道。' },
      diff: '准入从一维"类"到二维"业务×身份"——拥塞控制从一刀切进化到精准分流。' },
    { g: 'reest', topic: '重建立资格与三件套',
      lte: { m: 'RRCConnectionReestablishmentRequest', s: '36.331#5.3.7.1', n: '两条硬杠原文同款：安全未激活不发起直接回 idle；成功前提 cell prepared（有有效 UE 上下文）。' },
      nr: { m: 'RRCReestablishmentRequest', s: '38.331#5.3.7.1', n: '同款硬杠；敲门砖三件套（C-RNTI+PCI+shortMAC-I 低 16 bit）两代一字不差，cause 三值同枚举。' },
      diff: '重建立不是万能保险：T310→T311→T301 三道闸两代同构；成功后只恢复 SRB1——急诊通道，不是全身复活。' },
    { g: 'reest', topic: '拒收单的有无（最冷门对照点）',
      lte: { m: 'RRCConnectionReestablishmentReject', s: '36.331#5.3.7.8', n: '有这条消息——收到即回 idle（release cause「RRC connection failure」），条款全文就一句。' },
      nr: { m: '（消息表中不存在）', s: '38.331#5.3.7.8', n: '网络对重建立失败的处置是发 RRCSetup 兜底——条款全文一句话：perform the RRC connection establishment procedure。' },
      diff: 'NR 把拒收单从消息表里删了：RRCSetup 跟在重建请求后面就是"被拒"的 NR 语法——省掉先拒绝再重来的一个往返。' },
    /* ---------- 测量与切换 ---------- */
    { g: 'meas', topic: 'A3 事件（同一公式）',
      lte: { m: 'Event A3（CRS 测量）', s: '36.331#5.5.4.4', n: '进入 Mn+Ofn+Ocn > Mp+Ofp+Ocp+Off+Hys，离开反向——配 TTT+Hys 防抖双闸。' },
      nr: { m: 'Event A3（SSB/CSI-RS 测量）', s: '38.331#5.5.4.4', n: '同一公式框架；measObject 支持 SSB/CSI-RS 两种参考信号与 TDM 图样。' },
      diff: '公式没换，量的对象换代（CRS→SSB）；NR 还多出 beam 维度的波束报告。' },
    { g: 'meas', topic: '测量上报与分工',
      lte: { m: 'MeasurementReport', s: '36.331#5.5.5.1', n: '两代同名同职，SRB1 上行；消息本体极简：measId+服务小区与邻区清单。' },
      nr: { m: 'MeasurementReport（上报流程）', s: '38.331#5.5.5.1', n: '触发后可转周期上报（reportInterval/reportAmount）；NR 上报可含 SSB Index 与三量并存。' },
      diff: '上报不等于切换——UE 只递候选名单，裁决权在网络；"测量侦察、决策归指挥部"两代同一分工哲学。' },
    { g: 'meas', topic: '切换命令的两件马甲',
      lte: { m: 'mobilityControlInfo', s: '36.331#5.3.5.4', n: '藏在重配置里；收到即停计数器、起 T304、同步目标小区并用专用前导接入——命令不等送达确认就开跑。' },
      nr: { m: 'reconfigurationWithSync', s: '38.331#5.3.5.5.2', n: '藏进 spCellConfig；字段逐项对位（targetPhysCellId/t304/rach-ConfigDedicated/new C-RNTI）。' },
      diff: '两件马甲一件函数；先进选项 DAPS 与 makeBeforeBreak 都是 NR 先有、LTE Rel-16 追平——两代趋同是主流。' },
    { g: 'meas', topic: '条件切换 CHO',
      lte: { m: 'condReconfiguration（Rel-16 补齐）', s: '36.331#5.3.5.9.1', n: '提前囤候选配置（含 mobilityControlInfo 或 nr-SCG 配置），执行条件支持 A3/A4/A5/B1+NTN 的 D1/D2/T1。' },
      nr: { m: 'Conditional Reconfiguration', s: '38.331#5.3.5.13', n: '执行条件满足时本地立即执行——不等网络二次发令；候选存 VarConditionalReconfig。' },
      diff: 'CHO 解决"切换命令晚到/丢包"：创新在 NR 出现，LTE Rel-16 补齐同款——先囤票后乘车。' }
  ];
  g.RRC_COMPARE = {
    groups: GROUPS,
    rows: ROWS,
    /* 「按流程走」走线（v8 块 4）：16 步=16 行，step.r 是行索引（rows 顺序=主
       线流程在前、失败与移动性分支在后的教学分组序：建链→SRB→安全→重配→
       释放→resume→拒绝→重建→测量→A3→切换→CHO——非严格时间轴，增量审计
       二轮 2026-10-10 措辞回修）；step.t 只是导航标签——零新论断、零协议内容。 */
    walk: [
      { t: '敲门', r: 0 }, { t: '准入 · 建 SRB1', r: 1 }, { t: '回执捎 NAS', r: 2 },
      { t: 'SRB 专线家族', r: 3 },
      { t: '安全激活', r: 4 },
      { t: '重配旗舰', r: 5 }, { t: '安全前置门槛', r: 6 },
      { t: '连接释放', r: 7 }, { t: 'resume 失败兜底', r: 8 },
      { t: '拒绝信', r: 9 },
      { t: '重建立三件套', r: 10 }, { t: '拒收单有无', r: 11 },
      { t: 'A3 同一公式', r: 12 }, { t: '测量上报', r: 13 },
      { t: '切换命令马甲', r: 14 }, { t: '条件切换 CHO', r: 15 }
    ],
    note: '对照句改写自本站《LTE/5G 对照深潜》课（ml）已审计讲解文本；§徽章点开为规范原文自动截取短引（以 3GPP 正式文本为准）。36.331 侧锚点为该课已收录条款，38.331 侧锚点全量可查。'
  };
})(typeof window !== 'undefined' ? window : globalThis);
