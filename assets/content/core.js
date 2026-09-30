/* ============================================================
   assets/content/core.js — 内容注册 · M1（免费样品，自 demo 移植）
   【内容书写规范】
   - 全部文案自写，禁止复制 3GPP 规范原文（版权红线）；
   - narr 用大白话 + 生活类比；exam 写"面试考法"；chan 标逻辑信道/承载；
  - 不确定的常量值（RNTI 数值、定时器默认值）一律不写死，只做定性描述（核验清单见使用手册）；
   - panel.cards 1–4 张卡纵向堆叠，panelMap 按步骤点亮；paths.fail 可为 null。
   ============================================================ */
(function (g) {
  'use strict';
  var R = g.RRC;

  R.register({
    id: 'm0', num: 1, title: 'RRC 连接建立', tagline: 'UE 是怎么"上网落户"的',
    schema: 2,
    free: true, tech: '5G NR · SA', minutes: 8, prereq: [],
    intro: {
      title: '场景：从 IDLE 到"能打电话"的第一步',
      narr: 'UE 已开机，完成小区搜索与驻留，读完了 MIB/SIB1——其中就包括本模块的主角之一：定时器 T300 的取值（SIB1 里 ue-TimersAndConstants 配置，规范给了 100ms 到 2000ms 共 8 档，§6.3.2）。UE 停在 RRC_IDLE：只听寻呼、没有专用通道。用户此刻点开一个网页——NAS 层向 AS 层请求建立 RRC 连接，整个"入住登记"流程由此展开：敲门（随机接入）、递表（RRCSetupRequest）、拿房卡（RRCSetup）、签字（RRCSetupComplete）。本模块同时把这趟旅程的**全部四种失败出口**讲透——成功只是故事的一半，失败才是面试和网优排障的分水岭。',
      plain: '这门课演手机从待机到能上网的第一段路：敲门、递申请、拿房卡、签字，四步入住登记步步看透——还把这趟路的失败出口一并讲清，因为排障时失败路径比成功路径更常走。',
    },
    actors: [
      { x: 150, label: 'UE', sub: '你的手机' },
      { x: 460, label: 'gNB', sub: '基站' },
      { x: 790, label: 'AMF', sub: '核心网 5GC' }
    ],
    failLabel: '失败分支（消息丢失 → T300 超时）',
    panelTitle: 'RRC 状态机',
    failTagText: '建立失败 · T300 超时',
    panelNote: '信令图每走一步，这里的当前状态会实时点亮——建立流程的本质就是 IDLE → CONNECTED 的受控迁移。',
    paths: {
      success: ['m0s1', 'm0s2', 'm0s3', 'm0s4', 'm0s5', 'm0s6'],
      fail: ['m0s1', 'm0s2', 'm0s3', 'm0f1', 'm0f2']
    },
    steps: {
      m0s1: {
        title: 'Msg1 · PRACH 前导码', dir: 'ul', from: 0, to: 1,
        label: 'Msg1 · PRACH 前导码', chan: 'PRACH · 物理层过程（非 RRC 消息）',
        narr: 'UE 还没有任何上行通道，只能用"公共敲门砖"PRACH 发一个前导码：一是完成上行同步（跟基站对表），二是申请资源。相当于在大堂喊一嗓子："有人吗，我要办入住！"\n\n**RRC 视角的准备工作**（§5.3.3.2）：喊这一嗓子之前，RRC 发起建立时要先过三道关——①确认已拿到 essential 系统信息（MIB/SIB1）；②做统一接入控制（UAC）检查：若被 barred，过程当场结束，连 Msg1 都不发；③应用默认 L1/MAC/CCCH 配置（SRB0 走 CCCH 的配置就来自这里），然后启动 T300。PRACH 前导码本身的机制（preamble 选择、功率爬坡）属 TS 38.321 的随机接入过程。',
        plain: '手机还没有任何能说话的通道，只能拿公共敲门砖喊一嗓子：有人吗，我要办入住——喊之前还得先过门禁检查，被拦的话连这一嗓子都不许喊。',
        refs: ['5.3.3.2'],
        ies: [],
        exam: '面试常问"RRC 建立之前发生了什么"——标准答案链：读系统信息 → UAC 检查 → 应用默认配置 + 启动 T300 → 随机接入（PRACH/RAR 属物理层/MAC 过程，不是 RRC 消息）。能分清这层关系很加分。'
      },
      m0s2: {
        title: 'Msg2 · 随机接入响应 RAR', dir: 'dl', from: 1, to: 0,
        label: 'Msg2 · 随机接入响应 RAR', chan: 'PDCCH（RA-RNTI）+ PDSCH · TA / TC-RNTI / UL grant',
        narr: '基站回话："听到了，你是 X 号。"RAR 带三样东西——上行定时提前量 TA（对表用，纠正传播时延）、临时身份 TC-RNTI（后续 Msg3 重传时的身份标识）、上行授权 UL grant（在哪个时频资源上发 Msg3）。UE 从此有资格开口说话。\n\n**身份的接力棒**：TC-RNTI 是"临时工牌"，等 Msg4 竞争解决后转正为 C-RNTI，成为 CONNECTED 态的正式身份——这个接力（随机值 → TC-RNTI → C-RNTI）是理解整个建立流程身份管理的主线。TA/TC-RNTI/UL grant 的机制细节在 TS 38.321。',
        plain: '基站应门，一次递来三样：对表用的提前量、一块临时工牌、下一条消息该用哪段无线资源的指定——手机从此有资格正式开口。',
        refs: ['5.3.3.2'],
        ies: [],
        exam: 'RAR 是用 RA-RNTI 加扰的 PDCCH 调度的；TA 是上行同步关键词，答对这两个词面试官就知道你真看过流程。追问"TC-RNTI 后来去哪了"——竞争解决后转正为 C-RNTI。'
      },
      m0s3: {
        title: 'Msg3 · RRCSetupRequest', dir: 'ul', from: 0, to: 1,
        label: 'Msg3 · RRCSetupRequest', chan: 'CCCH · SRB0 · 发送起启动 T300',
        narr: '第一条真正的 RRC 消息，走 CCCH（SRB0，RLC 用 TM 模式——不重传不确认，丢了就靠 T300 兜底）。消息只带两个有效字段：ue-Identity 和 establishmentCause。\n\n**ue-Identity 的两种填法**（§5.3.3.3）：上层提供了 5G-S-TMSI（UE 在本跟踪区注册过）就用 ng-5G-S-TMSI-Part1（S-TMSI 的前 39 bit）；否则抽一个 0..2³⁹-1 的随机值。两种都占 39 bit——随机值只用于 Msg4 竞争解决时的比对，S-TMSI 还能帮网络"想起你是谁"。\n\n**establishmentCause** 按上层给的来由填：emergency（紧急呼叫）、mt-Access（被叫）、mo-Signalling/mo-Data/mo-VoiceCall/mo-VideoCall/mo-SMS（主叫各类）、mps/mcs-PriorityAccess（优先级服务）。它影响接入优先级——紧急呼叫和被叫可以"插队"。\n\n从过程发起这一刻起，T300 已在计时（§5.3.3.2 在 initiation 动作里启动它）。等待期间 UE 仍继续小区重选测量——若重选条件满足，直接转投别的小区，本次建立就地终止（§5.3.3.6，详见失败分支卡）。',
        plain: '入住申请表只有两栏：我是谁、来干什么——紧急呼叫这类来由还能插队；这张表走的通道不重传，丢了全靠后面的计时器兜底。',
        refs: ['5.3.3.3', '6.2.2'],
        ies: [
        { name: 'criticalExtensions', type: 'CHOICE { rrcSetupRequest, criticalExtensionsFuture }', pres: 'M', dict: 'criticalExtensions', meta: '版本信封——每条 RRC 消息的标准外套，信纸夹在选定的分支里', sem: '公共外壳（详见词典）；接收方按分支名对版本', ref: '6.2.2', children: [
{ name: 'rrcSetupRequest', type: 'RRCSetupRequest-IEs', pres: 'M', meta: '选中的分支：请求信纸本体', sem: '含身份/来由/填充三字段', ref: '6.2.2', children: [
{ name: 'ue-Identity', type: 'InitialUE-Identity（CHOICE，39bit）', pres: 'M', dict: 'ue-Identity', meta: '临时胸牌号——老学员戴学号（S-TMSI 前段），新学员现场抽号；等宽是为了竞争解决统一比对', sem: '身份二选一（详见词典）', ref: '6.2.2', children: [
{ name: 'ng-5G-S-TMSI-Part1', type: 'BIT STRING (SIZE (39))', pres: 'M', meta: '老学员胸牌：48bit 档案号的前 39 位', sem: '曾注册过，用 S-TMSI 前 39bit；核心网可续档', ref: '6.2.2' },
{ name: 'randomValue', type: 'BIT STRING (SIZE (39))', pres: 'M', meta: '新学员抽的随机号——第一次来，没有档案', sem: '首次接入抽 39bit 随机数，碰撞靠竞争解决', ref: '6.2.2' }
                  ] },
{ name: 'establishmentCause', type: 'EstablishmentCause（枚举 16 值）', pres: 'M', dict: 'establishmentCause', meta: '来意申报单——网络按它排资源优先级（紧急呼叫永远优先）', sem: '接入原因枚举（详见词典）', ref: '6.2.2', vals: [
{ v: 'emergency', note: '紧急呼叫（无 SIM 也要接）' },
{ v: 'highPriorityAccess', note: '高优先级用户（运营商特种终端）' },
{ v: 'mt-Access', note: '被叫触发的接入（寻呼响应）' },
{ v: 'mo-Signalling', note: '主叫信令——注册/去附着属这类' },
{ v: 'mo-Data', note: '主叫数据（后台流量）' },
{ v: 'mo-VoiceCall', note: '主叫语音' },
{ v: 'mo-VideoCall', note: '主叫视频' },
{ v: 'mo-SMS', note: '主叫短信' },
{ v: 'mps-PriorityAccess', note: '多媒体优先级业务接入' },
{ v: 'mcs-PriorityAccess', note: '关键业务服务接入' },
{ v: 'spare6..spare1', note: '6 个备用值——给未来新增来由留位' }
                  ] },
{ name: 'spare', type: 'BIT STRING (SIZE (1))', pres: 'M', focus: 'extra', dict: 'spare', meta: '占位填充——凑整防老设备误读，永远填 0', sem: '1bit 填充位', ref: '6.2.2' }
              ] },
{ name: 'criticalExtensionsFuture', type: 'SEQUENCE {}', pres: 'M', focus: 'extra', meta: '留给未来版本的空信封——本版永远空着，占位防死锁', sem: 'CHOICE 的第二分支：新版本扩展位', ref: '6.2.2' }
          ] },
      ],
        exam: 'establishmentCause 影响接入优先级（紧急呼叫、被叫可插队）——规范里的必考细节，实战里也是接入类投诉分析入口。追问"为什么随机 ID 恰好 39 bit"——因为要与 S-TMSI-Part1 等宽，竞争解决时统一按 39 bit 比对。'
      },
      m0s4: {
        title: 'Msg4 · RRCSetup', dir: 'dl', from: 1, to: 0,
        label: 'Msg4 · RRCSetup', chan: 'CCCH · 携带 SRB1 配置 · 停 T300 → 转 CONNECTED',
        narr: '录取通知书到了——同样走 CCCH（SRB0/TM）。UE 收到后的**动作顺序**（§5.3.3.4）：先按 masterCellGroup 执行小区组配置、按 radioBearerConfig 执行无线承载配置（SRB1 在这一步建立），然后停掉 T300（连同 T301/T319 等一串定时器），**进入 RRC_CONNECTED**、停小区重选、把当前小区定为 PCell。\n\n注意 masterCellGroup 的形态：OCTET STRING (CONTAINING CellGroupConfig)——字节串里封着完整的 CellGroupConfig 结构。为什么这么包？因为 CellGroupConfig 是 MAC/PHY 侧的配置树，RRC 直接整体转交，避免逐字段翻译。\n\n**竞争解决**也在这一步发生（Msg4 的 MAC CE 携带竞争解决身份，与 Msg3 的 39 bit 比对，成功后 TC-RNTI 转正为 C-RNTI）——这是 MAC 层机制，但时间点与 RRCSetup 重合，面试常混在一起问。',
        plain: '录取通知书到手：手机照单装好专属信令通道，停掉计时表，从待机正式转入连接状态；同一步还顺带核对身份，临时工牌转正。',
        refs: ['5.3.3.4', '6.2.2'],
        ies: [
        { name: 'rrc-TransactionIdentifier', type: 'RRC-TransactionIdentifier (0..3)', pres: 'M', dict: 'rrc-TransactionIdentifier', meta: '柜台小票号——Setup 与 SetupComplete 凭它配对', sem: '事务标识（详见词典）', ref: '6.2.2' },
        { name: 'criticalExtensions', type: 'CHOICE { rrcSetup, criticalExtensionsFuture }', pres: 'M', dict: 'criticalExtensions', meta: '版本信封', sem: '公共外壳（详见词典）', ref: '6.2.2', children: [
{ name: 'rrcSetup', type: 'RRCSetup-IEs', pres: 'M', meta: '选中的分支：准入批复信纸', sem: '含车道图与小区组总图', ref: '6.2.2', children: [
{ name: 'radioBearerConfig', type: 'RadioBearerConfig', pres: 'M', dict: 'radioBearerConfig', meta: '信令车道施工图——本步建 SRB1', sem: '承载配置（详见词典）', ref: '6.2.2', children: [
{ name: 'srb-ToAddModList', type: 'SRB-ToAddModList', pres: 'C', dict: 'srb-ToAddModList', meta: '要新建/改建的信令车道清单——本步只配 SRB1', sem: 'Cond HO-Conn：切换到 NR 连接时带', ref: '6.3.2' },
{ name: 'srb3-ToRelease', type: 'ENUMERATED {true}', pres: 'O', focus: 'extra', meta: '要拆掉的 SRB3 车道（C2 口令线）', sem: 'Need N', ref: '6.3.2' },
{ name: 'drb-ToAddModList', type: 'DRB-ToAddModList', pres: 'C', focus: 'extra', dict: 'drb-ToAddModList', meta: '要新建的数据车道清单——本步还没有', sem: 'Cond HO-toNR：从 LTE 切到 NR 时带', ref: '6.3.2' },
{ name: 'drb-ToReleaseList', type: 'DRB-ToReleaseList', pres: 'O', focus: 'extra', meta: '要拆掉的数据车道清单', sem: 'Need N', ref: '6.3.2' },
{ name: 'securityConfig', type: 'SecurityConfig', pres: 'O', focus: 'extra', meta: '车道级的锁具设置', sem: 'Need M；含算法与用哪把钥匙', ref: '6.3.2', children: [
{ name: 'securityAlgorithmConfig', type: 'SecurityAlgorithmConfig', pres: 'O', focus: 'extra', meta: '车道算法——不用随车队全局走时单独设', sem: 'Need R', ref: '6.3.2' },
{ name: 'keyToUse', type: 'ENUMERATED {master, secondary}', pres: 'O', focus: 'extra', meta: '用主钥匙还是副钥匙开这条车道', sem: '双连接时 SN 车道用 secondary', ref: '6.3.2' }
                      ] }
                  ] },
{ name: 'masterCellGroup', type: 'OCTET STRING (CONTAINING CellGroupConfig)', pres: 'M', dict: 'masterCellGroup', meta: '整个小区组的施工总图（MAC/RLC/PHY 参数）——gNB-CU 画好交给 gNB-DU 执行，RRC 只当图纸搬运工', sem: '小区组配置（详见词典）', ref: '6.2.2' },
{ name: 'lateNonCriticalExtension', type: 'OCTET STRING', pres: 'O', focus: 'extra', dict: 'lateNonCriticalExtension', meta: '晚到的非紧急附件——收方先办正事再拆它', sem: '非关键晚到扩展（详见词典）', ref: '6.2.2' },
{ name: 'nonCriticalExtension', type: 'RRCSetup-v1700-IEs', pres: 'O', focus: 'extra', dict: 'nonCriticalExtension', meta: '版本扩展抽屉——一代版本一个抽屉，抽屉里还有抽屉', sem: '非关键扩展链（详见词典）', ref: '6.2.2', children: [
{ name: 'sl-ConfigDedicatedNR-r17', type: 'SL-ConfigDedicatedNR-r16', pres: 'C', focus: 'extra', meta: '侧行直连专用配置', sem: 'Cond L2RemoteUE', ref: '6.2.2' },
{ name: 'sl-L2RemoteUE-Config-r17', type: 'SL-L2RemoteUE-Config-r17', pres: 'C', focus: 'extra', meta: '远端 UE 经中继上网的配置', sem: 'Cond L2RemoteUE', ref: '6.2.2' },
{ name: 'nonCriticalExtension', type: 'SEQUENCE {}', pres: 'O', focus: 'extra', meta: '抽屉链终点——本版到头了', sem: '空容器', ref: '6.2.2' }
                  ] }
              ] },
{ name: 'criticalExtensionsFuture', type: 'SEQUENCE {}', pres: 'M', focus: 'extra', meta: '留给未来版本的空信封——本版永远空着，占位防死锁', sem: 'CHOICE 的第二分支：新版本扩展位', ref: '6.2.2' }
          ] },
      ],
        exam: '"UE 什么时候算连上？"——收到 RRCSetup 即转 CONNECTED，不等 Complete 发出。答成"发完 Complete 才算"会被扣分。追问"为什么 masterCellGroup 是字节串"——CellGroupConfig 属 MAC/PHY 配置域，RRC 整体封装转交，两域各改各的互不牵连。'
      },
      m0s5: {
        title: 'RRCSetupComplete', dir: 'ul', from: 0, to: 1,
        label: 'RRCSetupComplete', chan: 'DCCH · SRB1 · 捎带 NAS 注册请求',
        narr: 'UE 在**新建的 SRB1**（DCCH，RLC 切到 AM 模式——从此信令有重传确认）上发确认。这条消息的精髓在"捎带"（piggyback）：dedicatedNAS-Message 里装着 NAS 层的注册请求——**5GC 注册流程从这一刻搭上了 RRC 的顺风车**，不用等专用承载建好。\n\n**身份的最后一块拼图**：若 UE 注册过，ng-5G-S-TMSI-Value 填 Part2（后 9 bit）——与 Msg3 里的 Part1（前 39 bit）拼成完整的 48 bit 5G-S-TMSI（AMF Set ID 10 + AMF Pointer 6 + TMSI 32）。网络由此能把这条连接路由到 UE 之前注册的旧 AMF，免走全套注册。selectedPLMN-Identity 在多 PLMN 共享小区时声明"我选的是哪家运营商"。\n\nComplete 发出，RRC 连接建立过程即告结束（§5.3.3.4：submit 之后 the procedure ends）。',
        plain: '手机在新通道上签字确认，顺手把核心网注册申请捎进同一封信——注册流程不用等专线建好就能搭车先走；这封回执一出，无线侧手续全部办完。',
        refs: ['5.3.3.4', '6.2.2'],
        ies: [
        { name: 'rrc-TransactionIdentifier', type: 'RRC-TransactionIdentifier (0..3)', pres: 'M', dict: 'rrc-TransactionIdentifier', meta: '柜台小票号——与 Setup 的号一致，表示"这单我接了"', sem: '事务标识（详见词典）', ref: '6.2.2' },
        { name: 'criticalExtensions', type: 'CHOICE { rrcSetupComplete, criticalExtensionsFuture }', pres: 'M', dict: 'criticalExtensions', meta: '版本信封', sem: '公共外壳（详见词典）', ref: '6.2.2', children: [
{ name: 'rrcSetupComplete', type: 'RRCSetupComplete-IEs', pres: 'M', meta: '选中的分支：交回执的信纸——本课最重的 RRC 消息，注册请求就藏在里面', sem: '含 PLMN 选择/AMF 记忆/切片清单/NAS 私信/全档案号', ref: '6.2.2', children: [
{ name: 'selectedPLMN-Identity', type: 'INTEGER (1..maxPLMN)', pres: 'M', dict: 'selectedPLMN-Identity', meta: '圈选的运营商——小区可能广播好几家，UE 圈中这家', sem: '多 PLMN 共小区时指明选了第几家', ref: '6.2.2' },
{ name: 'registeredAMF', type: 'RegisteredAMF', pres: 'O', focus: 'extra', dict: 'registeredAMF', meta: '户口记忆——上次在哪个 AMF 办过事，帮新 AMF 找旧档', sem: '注册过的 AMF 标识（详见词典）', ref: '6.2.2', children: [
{ name: 'plmn-Identity', type: 'PLMN-Identity', pres: 'O', focus: 'extra', meta: '旧户口的运营商', sem: 'MCC+MNC', ref: '6.3.2' },
{ name: 'amf-Identifier', type: 'AMF-Identifier', pres: 'M', focus: 'extra', meta: '旧户口的 AMF 门牌（SetID+Pointer+TMSI 三段）', sem: 'AMF 区域内标识', ref: '6.3.2' }
                  ] },
{ name: 'guami-Type', type: 'ENUMERATED {native, mapped}', pres: 'O', focus: 'extra', dict: 'guami-Type', meta: 'GUAMI 是原生还是映射来的（跨网漫游转换）', sem: '标识来源类型', ref: '6.2.2', vals: [
{ v: 'native', note: '本网原生分配' },
{ v: 'mapped', note: '从旧网络映射' }
                  ] },
{ name: 's-NSSAI-List', type: 'SEQUENCE (SIZE (1..maxNrofS-NSSAI)) OF S-NSSAI', pres: 'O', focus: 'extra', dict: 's-NSSAI-List', meta: '切片选号清单——UE 想加入哪些网络切片', sem: '单网络切片选号列表（详见词典）', ref: '6.2.2' },
{ name: 'dedicatedNAS-Message', type: 'DedicatedNAS-Message (OCTET STRING)', pres: 'M', dict: 'dedicatedNAS-Message', meta: '给核心网的挂号信——注册请求（Registration Request）整封装在里面，RRC 只当邮差不拆', sem: '捎带 NAS 消息（详见词典）', ref: '6.2.2' },
{ name: 'ng-5G-S-TMSI-Value', type: 'CHOICE { ng-5G-S-TMSI, ng-5G-S-TMSI-Part2 }', pres: 'M', dict: 'ng-5G-S-TMSI-Value', meta: '全档案号——Msg3 只递了前 39 位，这里把 48 位补全', sem: 'S-TMSI 递送方式二选一（详见词典）', ref: '6.2.2', children: [
{ name: 'ng-5G-S-TMSI', type: 'NG-5G-S-TMSI (48bit)', pres: 'M', meta: '整档案号一次给全（AMF SetID 10 + Pointer 6 + 32bit TMSI）', sem: '分支一：48bit 全号', ref: '6.3.2' },
{ name: 'ng-5G-S-TMSI-Part2', type: 'BIT STRING (SIZE (9))', pres: 'M', meta: '补交的后 9 位——Msg3 的 Part1(39bit)+这里(9bit)=48bit', sem: '分支二：续交后半段', ref: '6.3.2' }
                  ] },
{ name: 'lateNonCriticalExtension', type: 'OCTET STRING', pres: 'O', focus: 'extra', dict: 'lateNonCriticalExtension', meta: '晚到的非紧急附件', sem: '非关键晚到扩展（详见词典）', ref: '6.2.2' },
{ name: 'nonCriticalExtension', type: 'RRCSetupComplete-v1610-IEs', pres: 'O', focus: 'extra', dict: 'nonCriticalExtension', meta: '版本扩展抽屉——本条的抽屉藏着 UE 的几份"私货"（历史/测量）', sem: '非关键扩展链（详见词典）', ref: '6.2.2', children: [
{ name: 'iab-NodeIndication-r16', type: 'ENUMERATED {true}', pres: 'O', focus: 'extra', meta: '自报家门：我是中继节点（IAB）', sem: '指示 UE 是 IAB 节点', ref: '6.2.2' },
{ name: 'idleMeasAvailable-r16', type: 'ENUMERATED {true}', pres: 'O', focus: 'extra', meta: '口袋里有空闲态测的小报告', sem: 'IDLE 态测量可用', ref: '6.2.2' },
{ name: 'ue-MeasurementsAvailable-r16', type: 'UE-MeasurementsAvailable-r16', pres: 'O', focus: 'extra', meta: '口袋里有可用测量记录的清单', sem: '可用测量类型', ref: '6.2.2' },
{ name: 'mobilityHistoryAvail-r16', type: 'ENUMERATED {true}', pres: 'O', focus: 'extra', meta: '带着搬家史（走过哪些小区）', sem: '移动历史可用', ref: '6.2.2' },
{ name: 'mobilityState-r16', type: 'ENUMERATED {normal, medium, high, spare}', pres: 'O', focus: 'extra', meta: '自报活跃度：常驻/常挪/高频搬家', sem: '移动状态', ref: '6.2.2' },
{ name: 'nonCriticalExtension', type: 'RRCSetupComplete-v1690-IEs', pres: 'O', focus: 'extra', meta: '下一格抽屉', sem: '扩展链', ref: '6.2.2', children: [
{ name: 'ul-RRC-Segmentation-r16', type: 'ENUMERATED {enabled}', pres: 'O', focus: 'extra', meta: '超大回执可分段递交——简历太厚拆信封分批寄', sem: '上行 RRC 分段指示', ref: '6.2.2' },
{ name: 'nonCriticalExtension', type: 'SEQUENCE {}', pres: 'O', focus: 'extra', meta: '抽屉链终点', sem: '空容器', ref: '6.2.2' }
                      ] }
                  ] }
              ] },
{ name: 'criticalExtensionsFuture', type: 'SEQUENCE {}', pres: 'M', focus: 'extra', meta: '留给未来版本的空信封——本版永远空着，占位防死锁', sem: 'CHOICE 的第二分支：新版本扩展位', ref: '6.2.2' }
          ] },
      ],
        exam: 'Request 走 CCCH（SRB0/TM）、Complete 走 DCCH（SRB1/AM）——SRB0 到 SRB1 的切换（含 RLC 模式 TM→AM）是经典对比考点。追问"S-TMSI 48 bit 怎么分两半走"——Msg3 带 Part1（39bit），Complete 带 Part2（9bit），拼图式传输。'
      },
      m0s6: {
        title: '移交核心网 · RRC 的边界', dir: 'nas', from: 1, to: 2,
        label: 'Initial UE Message（NGAP）', chan: 'NGAP · 已离开 RRC 层 · NAS 透传',
        narr: 'gNB 收到 Complete，把 dedicatedNAS-Message 里的注册请求原封不动装进 NGAP 的 Initial UE Message 交给 AMF（若有 S-TMSI，顺带路由线索）。注意：这已经不属于 RRC——**RRC 只管 UE↔基站这段空口，它的职责到"把 NAS 消息如实上交/下发"为止**（§5.3.3.1：本过程的使命之一就是传输初始 NAS 信息）。后面还有鉴权、AS 安全激活、UECapability 询问、SRB2/DRB 建立，分别在 M6/M8 模块讲。',
        plain: '基站把注册信原样上交核心网登记台——到这一步无线侧的使命完成：它只管手机到基站这一段，再往后就是核心网的戏份。',
        refs: ['5.3.3.1', '5.3.3.4'],
        ies: [
          {"name": "Message Type", "type": "Message Type（9.3.1.1）", "pres": "M", "meta": "信种戳——机器先看它才知道这封信怎么读", "sem": "消息类型标识", "ref": "38.413#9.2.5.1", "focus": "extra"},
          {"name": "RAN UE NGAP ID", "type": "RAN UE NGAP ID", "pres": "M", "meta": "gNB 发的档案号——NG 侧后续信令认这对号", "sem": "gNB 分配的唯一关联标识", "ref": "38.413#9.2.5.1", "focus": "core", "dict": "ranUENGAPId"},
          {"name": "NAS-PDU", "type": "NAS-PDU（Registration Request）", "pres": "M", "meta": "原封上交的乘客——邮差不拆信（without interpretation）", "sem": "透传 NAS 消息", "ref": "38.413#9.2.5.1", "focus": "core", "dict": "nas-pdu"},
          {"name": "User Location Information", "type": "UserLocationInformation（9.3.1.16）", "pres": "M", "meta": "寄件地址——哪个小区发的件", "sem": "用户位置（NR CGI/TAI 等），AMF 选路依据", "ref": "38.413#9.2.5.1", "focus": "core"},
          {"name": "RRC Establishment Cause", "type": "RRCEstablishmentCause（9.3.1.111）", "pres": "M", "meta": "来意随信上呈——排队的理由也给核心网看", "sem": "空口建立原因透传", "ref": "38.413#9.2.5.1", "focus": "core"},
          {"name": "5G-S-TMSI", "type": "5G-S-TMSI（9.3.3.20）", "pres": "O", "meta": "旧档案号——帮 AMF 找回你以前的卷宗", "sem": "UE 的 5G-S-TMSI（空口收到过才带）", "ref": "38.413#9.2.5.1", "focus": "core"},
          {"name": "AMF Set ID", "type": "AMF Set ID（9.3.3.12）", "pres": "O", "meta": "指定客服班组——UE 提示该找哪组 AMF", "sem": "AMF 集合标识（负载分担/选路提示）", "ref": "38.413#9.2.5.1", "focus": "extra"},
          {"name": "UE Context Request", "type": "ENUMERATED {requested}", "pres": "O", "meta": "加急条——UE 要求核心网尽快建立上下文（CP 优化场景）", "sem": "UE 上下文请求指示", "ref": "38.413#9.2.5.1", "focus": "extra"},
          {"name": "Allowed NSSAI", "type": "9.3.1.31", "pres": "O", "meta": "贵宾厅通行证——允许的切片集合", "sem": "允许的 S-NSSAI", "ref": "38.413#9.2.5.1", "focus": "extra", "dict": "snssai"},
          {"name": "Requested NSSAI", "type": "9.3.1.275", "pres": "O", "meta": "贵宾厅申请单——UE 想进的切片", "sem": "UE 请求的 S-NSSAI", "ref": "38.413#9.2.5.1", "focus": "extra"},
          {"name": "Partially Allowed NSSAI", "type": "9.3.1.261", "pres": "O", "meta": "部分许可的贵宾厅——只放行部分成员", "sem": "部分允许的 S-NSSAI", "ref": "38.413#9.2.5.1", "focus": "extra"},
          {"name": "Source to Target AMF Information Reroute", "type": "9.3.3.27", "pres": "O", "meta": "改寄备注——初始 AMF 把信转寄给目标 AMF 时附言", "sem": "重路由信息", "ref": "38.413#9.2.5.1", "focus": "extra"},
          {"name": "Selected PLMN Identity", "type": "PLMN Identity（9.3.3.5）", "pres": "O", "meta": "非 3GPP 场景的运营商点名", "sem": "所选 PLMN（非 3GPP 接入）", "ref": "38.413#9.2.5.1", "focus": "extra"},
          {"name": "Selected NID", "type": "NID（9.3.3.42）", "pres": "O", "meta": "独立私网（SNPN）的网络身份点名", "sem": "与所选 PLMN 共同标识 SNPN", "ref": "38.413#9.2.5.1", "focus": "extra"},
          {"name": "IAB Node Indication", "type": "ENUMERATED {true}", "pres": "O", "meta": "自报家门：我是集成回传节点", "sem": "IAB 节点指示", "ref": "38.413#9.2.5.1", "focus": "extra"},
          {"name": "Mobile IAB Node Indication", "type": "ENUMERATED {true}", "pres": "O", "meta": "自报家门：我是移动回传节点", "sem": "移动 IAB 节点指示", "ref": "38.413#9.2.5.1", "focus": "extra"},
          {"name": "CE-mode-B Support Indicator", "type": "9.3.1.156", "pres": "O", "meta": "覆盖增强 B 模式支持标记", "sem": "CE-mode-B 支持", "ref": "38.413#9.2.5.1", "focus": "extra"},
          {"name": "LTE-M Indication", "type": "9.3.1.157", "pres": "O", "meta": "物联网（LTE-M）终端标记", "sem": "LTE-M 指示", "ref": "38.413#9.2.5.1", "focus": "extra"},
          {"name": "EDT Session", "type": "ENUMERATED {true}", "pres": "O", "meta": "早期数据传输会话标记——提前捎货", "sem": "EDT 会话指示", "ref": "38.413#9.2.5.1", "focus": "extra"},
          {"name": "Authenticated Indication", "type": "ENUMERATED {true}", "pres": "O", "meta": "有线网关的保荐信——接入网已代为验身（FN-RG）", "sem": "固网 RG 鉴权指示", "ref": "38.413#9.2.5.1", "focus": "extra"},
          {"name": "NPN Access Information", "type": "9.3.3.46", "pres": "O", "meta": "私网接入档案", "sem": "非公网接入信息", "ref": "38.413#9.2.5.1", "focus": "extra"},
          {"name": "AUN3 Device Access Information", "type": "9.3.3.66", "pres": "O", "meta": "车联网 AUN3 设备接入档案", "sem": "AUN3 接入信息", "ref": "38.413#9.2.5.1", "focus": "extra"},
          {"name": "RedCap Indication", "type": "9.3.1.228", "pres": "O", "meta": "轻量级终端自报（RedCap）", "sem": "RedCap 指示", "ref": "38.413#9.2.5.1", "focus": "extra"},
          {"name": "eRedCap Indication", "type": "ENUMERATED {true}", "pres": "O", "meta": "更轻量终端自报（eRedCap）", "sem": "eRedCap 指示", "ref": "38.413#9.2.5.1", "focus": "extra"},
          {"name": "GUAMI", "type": "GUAMI（9.3.3.3）", "pres": "O", "meta": "点名户籍——非 3GPP 侧带入的归属", "sem": "AMF 归属标识", "ref": "38.413#9.2.5.1", "focus": "extra", "dict": "guami"},
          {"name": "GUAMI Type", "type": "ENUMERATED {native, mapped}", "pres": "O", "meta": "户籍原件/复印件标注", "sem": "GUAMI 类型", "ref": "38.413#9.2.5.1", "focus": "extra"}
        ],
        exam: '能划清"RRC 管到哪、NAS/NGAP 从哪接手"，说明真的理解分层——这是区分背书党和懂行党的问题。'
      },
      m0f1: {
        title: '等待 · T300 计时中', dir: 'warn', from: 0, to: 0,
        label: '等待 RRCSetup …', chan: 'T300 计时中 · RRC 没有否定应答',
        narr: 'RRCSetupRequest 丢了（SRB0 是 TM 模式，不重传），或小区拥塞没被调度。UE 并不知道发生了什么——RRC 没有否定应答（NACK），它只能守着 T300 干等（取值由 SIB1 配置，规范枚举 100/200/300/400/600/1000/1500/2000 ms 八档）。\n\n**等待不等于静止**（§5.3.3.3）：UE 仍持续做小区重选测量与评估——若重选条件满足，直接切换目标小区，**本次建立就地终止**：按 §5.3.3.6 以 cause \'RRC connection failure\' 走"回 IDLE"动作，到新小区一切从头再来。真实网络里，这段等待是"RRC 建立时延"的直接组成部分。',
        plain: '申请表石沉大海——协议没有拒收回执这回事，手机只能掐着计时器干等；等待中若发现更合适的小区，索性终止这次尝试，换一家从头再来。',
        refs: ['5.3.3.2', '5.3.3.3', '5.3.3.6'],
        ies: [],
        exam: '"UE 怎么发现请求失败了？"——只靠定时器超时；没有 NACK、没有重传指示，这是异步系统设计的通识考点。追问"等待期间 UE 在干嘛"——仍在做重选测量，满足条件就"跳船"。'
      },
      m0f2: {
        title: 'T300 超时 · 回到 IDLE', dir: 'warn', from: 0, to: 0,
        label: 'T300 超时 → 回 RRC_IDLE', chan: '建立失败 KPI +1 · 可重选/重试',
        narr: 'T300 到期，本次建立宣告失败（§5.3.3.7）。UE 的收尾动作一板一眼：**复位 MAC、释放 MAC 配置、为已建立的所有 RB 重建 RLC**（广播 MRB 除外）——把这次尝试的痕迹清干净；然后**告知上层失败**，自己留在 RRC_IDLE，之后可能重选小区或再次发起。\n\n**连续失败的惩罚机制**：若同一小区连续失败达到 SIB1 里 connEstFailureControl 配置的门限 connEstFailCount，UE 会在一段有效期（connEstFailOffsetValidity）内把该小区的临时偏移 connEstFailOffset 当作 Qoffsettemp 用——小区选择/重选时给它降权重，"这家店总拒客，先降降分"。同时 UE 会把失败小区的测量结果存进 VarConnEstFailReport 变量，下次连接成功时通过 connEstFailInfoAvailable 告诉网络——供 MRO（移动性鲁棒优化）分析。\n\n基站的"RRC 建立成功率"KPI 统计的就是这类失败——网优每天盯的指标。演示结束：关闭失败开关或点重播，回到成功路径。',
        plain: '计时到点，这次入住宣告失败：手机把尝试的痕迹清理干净，回待机等下次再试；要是同一家总拒客，以后选小区时还会给它降降分。',
        refs: ['5.3.3.7'],
        ies: [],
        exam: 'T300 超时→回 IDLE；连续失败触发 connEstFailOffset 临时偏移（小区降权）。注意把它和"随机接入失败"（Msg1/Msg2 阶段，根本走不到 RRC 消息）区分开——两段失败的 KPI 与排障思路完全不同。'
      }
    },
    panel: {
      cards: [
        { id: 'IDLE', name: 'RRC_IDLE', desc: '驻留小区、监听寻呼与系统消息；没有专用信令通道。' },
        { id: 'CONN', name: 'RRC_CONNECTED', desc: 'SRB1 已建立，可传专用信令；数据承载见 M6。' },
        { id: 'INACT', name: 'RRC_INACTIVE', desc: 'LTE 没有、5G 新增的"挂起"状态。完整讲解在 M7。', locked: true }
      ],
      edges: [
        { label: 'RRCSetup' },
        { label: '5G 新状态 · 挂起/恢复 → M7', dim: true }
      ]
    },
    panelMap: {
      success: {
        0: { on: ['IDLE'], failed: null, edge: null },
        4: { on: ['CONN'], failed: null, edge: 0 },
        6: { on: ['CONN'], failed: null, edge: 0 }
      },
      fail: {
        0: { on: ['IDLE'], failed: null, edge: null },
        4: { on: ['IDLE'], failed: null, edge: null },
        5: { on: ['IDLE'], failed: 'IDLE', edge: null }
      }
    },
    failures: [
      { id: 't300-timeout', cond: 'T300 到期仍未收到 RRCSetup/RRCReject（Request 丢失或未被调度）', timer: 'T300',
        trans: '复位 MAC、释放 MAC 配置、为已建立 RB 重建 RLC → 留在 RRC_IDLE，可重选后再发起',
        kpi: 'RRC 建立失败（成功率 KPI 分母 +1）；同小区连续失败达 connEstFailCount 次后，一段有效期内该小区被加临时偏移 connEstFailOffset（降权重）',
        ref: '5.3.3.7',
        deep: '**为什么要复位 MAC、重建 RLC？**——T300 期间为发 Msg3 已配置了底层实体（默认 MAC 配置、CCCH 的 RLC）。回 IDLE 意味着这些"半成品"配置全部作废：MAC 复位清掉临时状态（含 TC-RNTI），RLC 重建清掉缓存队列，下次建立从默认配置重新来——不留上次尝试的任何残余，这是"无状态重来"的设计哲学。**T300 取值谁定的？**——SIB1 的 ue-TimersAndConstants，规范枚举 100/200/300/400/600/1000/1500/2000 ms 八档（§6.3.2），网络按拥塞水平调：太短会误杀慢调度 UE（KPI 假劣化），太长会让用户干等。**失败也要留遗产**：UE 把失败小区的测量（RSRP/RSRQ、邻区列表）记进 VarConnEstFailReport，最多记 8 次失败计数，下次建立成功时用 connEstFailInfoAvailable 告知网络——MRO 分析"该小区是不是该调参了"就靠这份数据。' },
      { id: 'rrc-reject', cond: '收到 RRCReject（网络拒绝；可携带 waitTime）。建立场景入口在 §5.3.3.5，行为定义在 §5.3.15', timer: 'T302',
        trans: '停止 T300/T319 等、复位 MAC → 回 RRC_IDLE；配置了 waitTime 则启动 T302=waitTime',
        kpi: '建立被拒；T302 运行期间接入被禁止（access category 0/2 除外），上层被告知失败',
        ref: '5.3.15.2',
        deep: '**拒绝谁说的算？**——gNB 觉得"现在没床位"（拥塞、资源不足），回一条 RRCReject（SRB0/CCCH/TM 下行），消息里只有一个有效字段：waitTime（RejectWaitTime，INTEGER 1..16，单位秒，§6.3.2）。**T302 与 waitTime 的关系**：收到带 waitTime 的 Reject，UE 启动 T302 = waitTime；T302 运行期间，任何新的接入尝试在 UAC 检查处直接判 barred（§5.3.14.2：T302 running → 除 category 2/0 外一律禁止）——注意是"除紧急呼叫等特殊类别外全禁"，不是只禁这一种业务。**与 T300 超时的本质区别**：超时是"没人应答"（UE 自己发现），Reject 是"明确被拒"（网络主动告知，且给了冷却时间）——排障时的方向完全不同：前者查覆盖/调度，后者查拥塞控制。' },
      { id: 'access-barred', cond: '发起建立前的统一接入控制（UAC，§5.3.14）判定 barred：接入类别/身份被禁', timer: 'T302',
        trans: '过程直接结束（procedure ends），UE 留在 RRC_IDLE——根本不会发出 Msg3',
        kpi: '禁止期间的尝试在源头被拦下；T302 到期后按 5.3.14.4 解除（紧急呼叫等特殊类别不受限）',
        ref: '5.3.3.2',
        deep: '**5G 的"错峰限电"**：网络在 SIB1 里广播禁止参数（uac-BarringForCommon 或按 PLMN/按类别的 uac-BarringPerCatList），UE 每次发起业务前按自己的 Access Category（0=紧急、2=寻呼响应等标准类别，其他为标准化/运营商标签类别）和 Access Identity（如高优先级用户）做检查。除了 SIB1 静态配置的禁止，还有动态的：T390 运行中（MMTel 语音的 ACB）或 T302 运行中，相关类别一律判 barred。**barred 的后果比 Reject 更早**——§5.3.3.2 明写：barred 则 the procedure ends，随机接入都不会开始，所以这种失败在"RRC 建立成功率"里根本不出现（分母都不进），KPI 上看不见它，只能靠 NAS 侧的接入尝试统计捕捉。**category 0/2 豁免**是保命设计：紧急呼叫和寻呼响应永远放行。' },
      { id: 'upper-abort', cond: 'NAS 过程被中止，上层在 UE 进入 CONNECTED 之前主动中止建立', timer: 'T300',
        trans: '停止 T300、复位 MAC、释放 MAC 配置、为已建立 RB 重建 RLC → 回 RRC_IDLE',
        kpi: 'NAS 侧视为建立中止；与超时失败的区分点在于"谁先放弃"',
        ref: '5.3.3.8',
        deep: '**用户按了停止键会怎样**：等待 T300 期间用户取消（或 NAS 超时先到），上层触发 abort。UE 的收尾动作与 T300 超时几乎一样（停 T300、复位 MAC、重建 RLC）——因为无论谁喊停，物理现场都得清场还原。区别在语义：超时是"等不到"，abort 是"不等了"——KPI 归因不同（前者算网络/覆盖问题，后者算用户行为）。**规范原文的前提条件**值得抠字眼：仅当"UE 尚未进入 RRC_CONNECTED"时才走本条款；若已转 CONNECTED，那就是另一个过程（RRC 释放，§5.3.4）的领地了。这条分支最容易被忽略，但它解释了真实日志里"NAS 取消导致的建立失败"——排障时先看时间线：是 T300 先到期还是 NAS 先取消。' }
    ],
    decisionPoints: [
      { at: 0, q: 'UE 发起 RRC 建立前，统一接入控制判定为 barred，接下来会发生什么？',
        options: ['照常发 RRCSetupRequest，等 T300 超时', '本次建立过程直接结束，一段时间内被禁止再试', '改走 SRB1 重发', '转入 RRC_INACTIVE 等待恢复'],
        correct: 1, why: '§5.3.3.2：barred 则 the procedure ends——连 Msg3 都不会发；禁止时长由 T302/waitTime 类机制控制，紧急呼叫等特殊类别不受限。',
        ref: '5.3.3.2' },
      { at: 1, q: 'UE 发出 PRACH 前导码之前，RRC 层已经完成了哪些准备？',
        options: ['应用默认 L1/MAC/CCCH 配置并启动 T300', '已建立 SRB1 并激活 AS 安全', '已完成 NAS 注册拿到了 5G-S-TMSI', '已向 AMF 上报 UE 能力'],
        correct: 0, why: '§5.3.3.2：发起时依次做 UAC 检查（barred 即结束）→ 应用默认配置 → 启动 T300。SRB1 要等 Msg4 的 RRCSetup 才建立，安全激活和注册都在 CONNECTED 之后。',
        ref: '5.3.3.2' },
      { at: 2, q: '已注册的 UE（上层提供 5G-S-TMSI）发 RRCSetupRequest，ue-Identity 应填什么？',
        options: ['39 bit 随机值 randomValue', 'ng-5G-S-TMSI-Part1', 'TC-RNTI', '完整 IMSI'],
        correct: 1, why: '§5.3.3.3+6.2.2：有 5G-S-TMSI 用 Part1（前 39 bit），否则抽随机值。两种都占 39 bit，但语义不同——随机值仅用于竞争解决，S-TMSI 还能帮网络找回身份。',
        ref: '5.3.3.3' },
      { at: 3, q: 'UE 在哪个时刻进入 RRC_CONNECTED？',
        options: ['发出 RRCSetupRequest 之后', '收到 RRCSetup 并执行完配置之后', '发出 RRCSetupComplete 之后', 'NAS 注册完成之后'],
        correct: 1, why: '§5.3.3.4：UE 执行小区组/无线承载配置后 enter RRC_CONNECTED，同时停 T300、停小区重选；Complete 只是确认消息，不改变状态。',
        ref: '5.3.3.4' },
      { at: 4, q: '注册过的 UE 想让网络把这条连接路由到旧 AMF，RRCSetupComplete 里靠哪个 IE 补全身份？',
        options: ['ng-5G-S-TMSI-Value 填 Part2（9 bit），与 Msg3 的 Part1 拼成完整 48 bit S-TMSI', '重新填 39 bit randomValue', '在 selectedPLMN-Identity 里编码 AMF 地址', 'establishmentCause 填 mt-Access'],
        correct: 0, why: '§5.3.3.4+6.2.2：Complete 的 ng-5G-S-TMSI-Value 填 Part2，与 Msg3 的 Part1（39 bit）拼图式拼成 48 bit 完整 5G-S-TMSI（AMF Set ID 10 + Pointer 6 + TMSI 32），gNB 由此路由到旧 AMF。',
        ref: '6.2.2' }
    ],
    quiz: [
      {
        q: 'UE 收到 RRCSetup 之后、发出 RRCSetupComplete 之前，处于什么状态？',
        o: ['RRC_IDLE', 'RRC_CONNECTED', 'RRC_INACTIVE', '取决于 establishCause'], a: 1,
        why: '收到 RRCSetup 即转入 RRC_CONNECTED，T300 同时停止；Complete 只是新 SRB1 上的第一条消息，不影响状态迁移。',
        ref: '5.3.3.4'
      },
      {
        q: 'RRCSetupRequest 使用哪个逻辑信道？',
        o: ['DCCH', 'PCCH', 'CCCH', 'BCCH'], a: 2,
        why: '此时 SRB1 还没建立，只能用 SRB0 上的公共控制信道 CCCH。从 RRCSetupComplete 起才改走 DCCH。',
        ref: '6.2.2'
      },
      {
        q: '关于定时器 T300，下列哪组行为是正确的？',
        o: ['发 SetupRequest 启动 / 收 RRCSetup 停止 / 超时回 IDLE', '收 RAR 启动 / 发 Complete 停止 / 超时重发 Msg3', '收 RRCSetup 启动 / 安全激活停止 / 超时转 INACTIVE', '不适用：T300 属 MAC 层定时器'], a: 0,
        why: 'T300 是 RRC 建立的"录取等待期"：启动=发出 Request，停止=收到 Setup，超时=回 IDLE 并计入建立失败 KPI。具体默认值随版本/配置不同，面试答语义即可。',
        ref: '5.3.3.2'
      },
      {
        q: 'T300 超时后，UE 会做什么？',
        o: ['回 RRC_IDLE：复位 MAC、释放 MAC 配置、为已建立 RB 重建 RLC，并告知上层失败', '原地重发 RRCSetupRequest 直至成功', '转入 RRC_INACTIVE 等待恢复', '重启小区搜索并丢弃全部系统信息'], a: 0,
        why: '§5.3.3.7：超时后复位 MAC、释放 MAC 配置、重建 RLC，inform upper layers；同小区连续失败达门限还会加 connEstFailOffset 临时偏移。',
        ref: '5.3.3.7'
      },
      {
        q: 'UE 收到携带 waitTime=10s 的 RRCReject，接下来 10 秒内它再想发起普通数据业务建立，会怎样？',
        o: ['照常发起，被拒只是上次的事', '接入尝试在 UAC 检查处被判 barred（T302 运行中，紧急呼叫等特殊类别除外）', '10 秒内不能驻留任何小区', 'RRC 层自动每秒重试直到 T302 到期'], a: 1,
        why: '§5.3.15.2：waitTime 启动 T302；§5.3.14.2：T302 运行期间除 access category 2/0 外一律 barred。注意"禁止的是接入尝试"而不是"禁止驻留"——UE 仍正常驻留、听寻呼。',
        ref: '5.3.15.2'
      }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
