/* ============================================================
   assets/content/ma.js — M0 接入全流程（注册/Attach）· v2（2026-09-27 按用户反馈重排）
   教学主线（用户拍板）：工程师第一课是完整 Attach——每条标准消息独立一步，
   每步回答"为什么一定要有这条消息"（而不是死记流程）；安全命令、能力问询、
   重配置都必须画出各自的响应消息；上下文建立 REQUEST/RESPONSE 成对出现。
   分层：RRC(38.331) + NGAP(38.413) + NAS(24.501 地界只指路)。
   深度特写：RRC 腿=M1、系统消息=M2、寻呼=M3、测量=M4、切换=M5、
   承载=M6、INACTIVE=M7、AS 安全=M8、EN-DC=M9。
   信元词典：关键信元挂 dict 键，字段树里点"词典详解"跳 dict.html。
   ============================================================ */
(function (g) {
  'use strict';
  var R = g.RRC;

  R.register({
    id: 'ma', num: 0, title: '接入全流程（注册）', tagline: '每条标准信令一帧：从 PRACH 到注册完成，步步都有"为什么"',
    schema: 2,
    free: true, tech: '5G NR · SA', minutes: 22, prereq: [],
    intro: {
      title: '场景：手机开机后的第一次"落户"，19 帧信令',
      narr: '网优工程师拿到信令跟踪，第一条看的就是**初始注册（Attach）流程**。学它的正确姿势不是背顺序，而是问**每一条消息：为什么一定要有它？没有它会怎样？**——本模块 19 帧，每一帧的讲解都从这个问题开始。\n\n三层接力看清分工：**RRC 层**（UE↔gNB，无线通道）、**NGAP 层**（gNB↔AMF，登记与交接）、**NAS 层**（UE↔核心网，注册/鉴权——自己不发电报，全程搭前两层的车）。\n\n注意成对出现的"请求-响应"：安全命令必有 Complete 证明校验通过；能力问询必有 Information 交答卷；重配置必有 Complete 回执；核心网的上下文建立 REQUEST 必有 RESPONSE 收尾——**协议世界里没有"发出去就当收到"这回事**。'
    },
    actors: [
      { x: 160, label: 'UE', sub: '你的手机' },
      { x: 460, label: 'gNB', sub: '基站（RRC+NGAP）' },
      { x: 760, label: 'AMF', sub: '核心网（5GC）' }
    ],
    failLabel: '失败分支（鉴权/安全/注册被拒）',
    panelTitle: '三幕结构',
    failTagText: '注册失败',
    panelNote: '信令图每走一步，这里点亮当前所处的大幕——空口接入、核心网验身、业务开通。',
    paths: {
      success: ['maa1', 'maa2', 'maa3', 'maa4', 'maa5', 'maa6', 'maa7', 'maa8', 'maa9', 'maa10', 'maa11', 'maa12', 'maa13', 'maa14', 'maa15', 'maa16', 'maa17', 'maa18', 'maa19'],
      fail: ['maa1', 'maa2', 'maa3', 'maa4', 'maa5', 'maa8', 'maaf1', 'maaf2']
    },
    steps: {
      maa1: {
        title: 'PRACH 前导（Msg1）', dir: 'ul', from: 0, to: 1,
        label: 'PRACH 前导（Msg1）', chan: '物理层 · 竞争接入的敲门',
        narr: '**为什么有它**：UE 还没有任何专属资源，连"能发数据的通道"都没有——唯一的机会是公共的物理随机接入信道：挑一个前导码喊一嗓子，赌基站听见。没有这一步，后面的一切都无从谈起。\n\n细节：前导码从竞争池里随机挑（所以叫"竞争接入"，可能撞车）；这一段在 MAC/PHY 地界（TS 38.321/38.213），RRC 从下一条 Msg3 才接手。**拆开这段引擎盖：M12《MAC 随机接入课》（38.321）专讲前导怎么选、功率怎么爬、RA-RNTI 怎么算**。',
        refs: ['5.3.3.3'],
        ies: [],
        exam: '"注册流程从哪条信令算起？"——工程师视角从 PRACH 前导算起；协议 RRC 视角从 Msg3。两个口径都答才周全。'
      },
      maa2: {
        title: '随机接入响应 RAR（Msg2）', dir: 'dl', from: 1, to: 0,
        label: 'RAR（Msg2）', chan: '物理层 · TA+上行授权',
        narr: '**为什么有它**：基站听见了敲门声，接下来要还 UE 两样东西。\n\n**第一样：校表（TA，定时提前量）**。UE 离基站有远有近，电波跑一个来回花的时间就不同——如果人人"同一时刻开口"，基站在同一时刻收到的是一片前后错开的杂音，谁的话都听不完整。解法是**让远的早开口**：基站在 RAR 里带回一个**定时提前量 TA（Timing Advance）**——按"你离我多远"算出来的提前量，远的多提前、近的少提前；每人按自己的提前量发送，所有信号就恰好**同时到达基站**，好比老师喊"后排同学提前起跑"，全班才能同时冲线。从此 UE 每次上行都带着这个提前量发（距离变了基站会随发随调）。\n\n**第二样：发言席位（上行授权 UL Grant）**。RAR 指定一块时频资源——你在哪个时刻、哪些频率上发下一条消息（Msg3）。有了席位才轮得到你说话：**没有 RAR，Msg3 就是无人指挥的乱喊**。MAC RAR 的逐字段拆解（E/T/RAPID 子头 + TA 12bit / UL Grant 27bit / TC-RNTI 16bit + 退避指示）在 **M12《MAC 随机接入课》第四幕**。',
        refs: ['5.3.3.3'],
        ies: [],
        exam: '"RAR 里最关键的两个东西？"——① **TA（定时提前量）**：按 UE 与基站的距离算出的"提前开口量"，让远近不同的 UE 信号同时到达基站；② **上行授权**：给 Msg3 专用的时频资源（何时发、在哪段频率发）。都是 MAC 层机制，与 RRC 时间线咬合。'
      },
      maa3: {
        title: 'RRCSetupRequest（Msg3）', dir: 'ul', from: 0, to: 1,
        label: 'RRCSetupRequest（Msg3）', chan: 'CCCH · SRB0/TM · 启动 T300',
        narr: '**为什么有它**：物理层通了，但 UE 和网络之间还没有任何"RRC 意义上的关系"——这条消息是 UE 的自我介绍：我是谁（39bit 身份）、来干什么（建立原因）。同时 T300 开始计时：网络不回话就有限次重试，超限回 IDLE。**字段树点开看**：establishmentCause 是个枚举，每个来由都有白话。\n\n**读树心法**：RRC 消息没有 NGAP 那层"信元容器"外壳——信纸本身就是 ASN.1 结构体：第一层是 criticalExtensions 版格外壳，信纸本体在选中的分支里（rrcSetupRequest），再往里才是三个字段。**树形比 NGAP 深，是两种协议的真实形状差异**，不是谁少画了层。',
        refs: ['5.3.3.3'],
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
        exam: '追问"随机 ID 为什么恰好 39bit"——与 S-TMSI-Part1 等宽，Msg4 竞争解决按 39bit 统一比对。'
      },
      maa4: {
        title: 'RRCSetup（Msg4）', dir: 'dl', from: 1, to: 0,
        label: 'RRCSetup（Msg4）', chan: 'CCCH · 建 SRB1 · 竞争解决 · 停 T300',
        narr: '**为什么有它**：网络的"录取通知"——SRB1 的配置随信下发（从此有专用信令通道），MAC 竞争解决同帧完成（TC-RNTI 转正），T300 停表，UE 进 RRC_CONNECTED。**注意：只是"能通话"，还没"落户"**——核心网还不知道你是谁。masterCellGroup 是字节串封装的 MAC/PHY 布置图（整箱转交，两域各改各的）。',
        refs: ['5.3.3.4'],
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
        exam: '"UE 什么时候算连上？"——收到 RRCSetup 即转 CONNECTED，不等 Complete。答"发完 Complete 才算"会被扣分。'
      },
      maa5: {
        title: 'RRCSetupComplete ★捎带注册请求', dir: 'ul', from: 0, to: 1,
        label: 'RRCSetupComplete', chan: 'DCCH · SRB1/AM · 车上带着 Registration Request',
        narr: '**为什么有它**：双职责。其一，向网络确认"SRB1 装好了、配置生效了"（RRC 建立的收尾）；其二，**捎带 NAS 的注册请求**——5GC 注册流程从这一刻搭上 RRC 的顺风车，不必等任何专用承载。身份拼图也在这里完成：Msg3 带了 S-TMSI 前 39 位，这里补后 9 位。RLC 已切 AM 模式：从此信令有重传确认。',
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
        exam: '"注册请求怎么到核心网？"——先搭这条（SRB1）到 gNB，再由 gNB 装 NGAP 首帧（下一步）上呈：两段接力。'
      },
      maa6: {
        title: 'INITIAL UE MESSAGE（NGAP 首帧）', dir: 'nas', from: 1, to: 2,
        label: 'INITIAL UE MESSAGE', chan: 'NG-C（38.413 §8.6.1）· gNB→AMF · 登记开档',
        narr: '**为什么有它**：AMF 面前有成千上万个 UE，谁来"开档案"？这条 NGAP 首帧做三件事：分配 **RAN UE NGAP ID**（此后 NG 侧信令的号牌）；把 **NAS-PDU 原样上交**（§8.6.1.2 原话 "transferred without interpretation"——gNB 是邮差不拆信）；报上 **TAI 与用户位置**（AMF 据此选路管辖）。**没有它，注册请求永远停在基站**。\n\n**信封进了 AMF 之后呢**：AMF 可不会自己拆——它叫 SMF 管会话、找 AUSF 验身、请 UDM 查档案。柜台后面的这套服务化调用流水线，**M14《5GC 流程课》（23.502/23.501）带你走进核心网办公区**。',
        refs: ['38.413#8.6.1'],
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
        exam: '"gNB 会看 NAS 内容吗？"——不会：without interpretation；gNB 只打包 RRC 侧信息（位置/原因/身份）。**信封里写了什么：M13《NAS 注册课》（24.501）拆给你看**。'
      },
      maa7: {
        title: 'AMF 验身：取鉴权向量（5G-AKA）', dir: 'int', from: 2, to: 2,
        label: 'AMF · SBA 取鉴权向量', chan: '核心网内部 · AUSF/UDM（33.501 地界）',
        narr: '**为什么有它**：能发 Msg3 的不一定是真卡——克隆卡/伪终端都能喊一嗓子。AMF 收到注册请求后第一件事是验身：经服务化接口（SBA）找 **AUSF/UDM** 取鉴权向量（5G-AKA 或 EAP-AKA\'），产出根密钥材料 **K_AMF**——它不出核心网，后续 AS 安全的 KgNB 由 gNB 从它派生。鉴权本体的算法与流程在 TS 33.501/29.50x 地界，本图画到"AMF 拿到结果"为止。',
        refs: ['38.413#8.6.1'],
        ies: [],
        exam: '层次题："鉴权在哪层做？"——NAS 层（UE↔AMF↔AUSF/UDM），RRC/NGAP 只当邮差。'
      },
      maa8: {
        title: 'DOWNLINK NAS TRANSPORT（带鉴权挑战）', dir: 'nas', from: 2, to: 1,
        label: 'DOWNLINK NAS TRANSPORT', chan: 'NG-C（38.413 §8.6.2/§9.2.5.2）· AMF→gNB',
        narr: '**为什么有它**：AMF 要把鉴权挑战发给 UE，但 AMF 没有无线通道——NGAP 的**下行 NAS 直传**就是那条"转发单"：挂上双号牌（AMF/RAN UE NGAP ID 配对完成），NAS-PDU 装着 Authentication Request。**注意安全悖论**：此刻 SRB1 上无任何保护（AS 安全未激活、NAS 加密未生效），鉴权消息明文跑——安全性靠 5G-AKA 挑战-应答自身的防重放（RAND/AUTN）保证，这是流程时序的必然而非漏洞。',
        refs: ['38.413#8.6.2'],
ies: [
          {"name": "Message Type", "type": "Message Type", "pres": "M", "meta": "信种戳", "sem": "消息类型", "ref": "38.413#9.2.5.2", "focus": "extra"},
          {"name": "AMF UE NGAP ID", "type": "AMF UE NGAP ID", "pres": "M", "meta": "档案号（核心网半边）——配对完成", "sem": "AMF 侧关联标识", "ref": "38.413#9.2.5.2", "focus": "core", "dict": "amfUENGAPId"},
          {"name": "RAN UE NGAP ID", "type": "RAN UE NGAP ID", "pres": "M", "meta": "档案号（无线半边）", "sem": "gNB 侧关联标识", "ref": "38.413#9.2.5.2", "focus": "core", "dict": "ranUENGAPId"},
          {"name": "NAS-PDU", "type": "NAS-PDU（Authentication Request）", "pres": "M", "meta": "转发单上的货物——鉴权挑战原样下发", "sem": "透传 NAS 消息", "ref": "38.413#9.2.5.2", "focus": "core", "dict": "nas-pdu"},
          {"name": "Old AMF", "type": "AMF Name（9.3.3.21）", "pres": "O", "meta": "前任管家的名帖", "sem": "旧 AMF 标识（有 Extended 版则忽略）", "ref": "38.413#9.2.5.2", "focus": "extra"},
          {"name": "Extended Old AMF", "type": "Extended AMF Name（9.3.3.51）", "pres": "O", "meta": "前任管家名帖（加长版）", "sem": "扩展旧 AMF 标识", "ref": "38.413#9.2.5.2", "focus": "extra"},
          {"name": "RAN Paging Priority", "type": "RAN Paging Priority（9.3.3.15）", "pres": "O", "meta": "加急戳——这条 NAS 信很重要，寻呼时要优先", "sem": "RAN 侧寻呼优先级", "ref": "38.413#9.2.5.2", "focus": "extra"},
          {"name": "Mobility Restriction List", "type": "9.3.1.85", "pres": "O", "meta": "禁入区域清单——这 UE 哪些地方不能去", "sem": "移动性限制（漫游/区域/频率禁止）", "ref": "38.413#9.2.5.2", "focus": "extra"},
          {"name": "Index to RAT/Frequency Selection Priority", "type": "9.3.1.61", "pres": "O", "meta": "选网偏好系数——省电与制式策略参考", "sem": "RFSP 索引", "ref": "38.413#9.2.5.2", "focus": "extra"},
          {"name": "UE Aggregate Maximum Bit Rate", "type": "UE-AMBR（9.3.1.58）", "pres": "O", "meta": "总闸门——非保证流量总带宽上限", "sem": "UE 级聚合速率", "ref": "38.413#9.2.5.2", "focus": "extra", "dict": "ue-ambr"},
          {"name": "Allowed NSSAI", "type": "9.3.1.31", "pres": "O", "meta": "贵宾厅通行证", "sem": "允许的 S-NSSAI", "ref": "38.413#9.2.5.2", "focus": "extra", "dict": "snssai"},
          {"name": "Partially Allowed NSSAI", "type": "9.3.1.261", "pres": "O", "meta": "部分许可的贵宾厅", "sem": "部分允许的 S-NSSAI", "ref": "38.413#9.2.5.2", "focus": "extra"},
          {"name": "Target NSSAI Information", "type": "9.3.1.229", "pres": "O", "meta": "目标切片信息——切片变更场景", "sem": "目标 NSSAI", "ref": "38.413#9.2.5.2", "focus": "extra"},
          {"name": "SRVCC Operation Possible", "type": "9.3.1.128", "pres": "O", "meta": "可以转语音回落的记号——SRVCC 可能性", "sem": "SRVCC 指示", "ref": "38.413#9.2.5.2", "focus": "extra"},
          {"name": "Enhanced Coverage Restriction", "type": "9.3.1.140", "pres": "O", "meta": "覆盖增强受限", "sem": "覆盖增强限制", "ref": "38.413#9.2.5.2", "focus": "extra"},
          {"name": "CE-mode-B Restricted", "type": "9.3.1.155", "pres": "O", "meta": "窄带 B 模式受限标记", "sem": "CE-mode-B 限制", "ref": "38.413#9.2.5.2", "focus": "extra"},
          {"name": "Extended Connected Time", "type": "9.3.3.31", "pres": "O", "meta": "延长在线时长提示", "sem": "连接保持时长", "ref": "38.413#9.2.5.2", "focus": "extra"},
          {"name": "UE Differentiation Information", "type": "9.3.1.144", "pres": "O", "meta": "用户分级——运维区分对待依据", "sem": "用户差异化信息", "ref": "38.413#9.2.5.2", "focus": "extra"},
          {"name": "UE Radio Capability", "type": "9.3.1.74", "pres": "O", "meta": "能力档案存档——带了可免问 UE", "sem": "无线能力容器", "ref": "38.413#9.2.5.2", "focus": "extra", "dict": "ue-radio-capability"},
          {"name": "UE Radio Capability ID", "type": "9.3.1.142", "pres": "O", "meta": "能力档案编号——按 ID 取档省信令", "sem": "无线能力 ID", "ref": "38.413#9.2.5.2", "focus": "extra"},
          {"name": "UE Capability Info Request", "type": "ENUMERATED", "pres": "O", "meta": "顺路取件——gNB 顺手把 UE 能力也捎回去", "sem": "请求 gNB 上报 UE 能力信息", "ref": "38.413#9.2.5.2", "focus": "core"},
          {"name": "End Indication", "type": "ENUMERATED", "pres": "O", "meta": "最后一封信——NAS 消息序列的收尾标记", "sem": "NAS 传输结束指示", "ref": "38.413#9.2.5.2", "focus": "extra"},
          {"name": "Masked IMEISV", "type": "9.3.1.54", "pres": "O", "meta": "打码串号——排查特定机型时用", "sem": "掩码 IMEISV", "ref": "38.413#9.2.5.2", "focus": "extra"},
          {"name": "Mobile IAB Authorized", "type": "9.3.1.259", "pres": "O", "meta": "移动回传节点的许可章", "sem": "移动 IAB 授权", "ref": "38.413#9.2.5.2", "focus": "extra"}
        ],
        exam: '"鉴权消息加密吗？"——不加密（此阶段无任何保护激活），靠 AKA 自身机制防重放/防伪造。'
      },
      maa9: {
        title: 'DLInformationTransfer（RRC 当邮差）', dir: 'dl', from: 1, to: 0,
        label: 'DLInformationTransfer', chan: 'DCCH · SRB1 · §5.7.1',
        narr: '**为什么有它**：NG-C 只把信送到 gNB，"最后一公里"到 UE 得 RRC 来跑——DLInformationTransfer 的消息体几乎只有 dedicatedNAS-Message 一个字段（§5.7.1：NAS 直传）。**它和上一步是一枚硬币的两面**：NGAP 下行 NAS 直传 + RRC 下行信息直传，合起来才是"AMF→UE"的完整邮路。',
        refs: ['5.7.1'],
        ies: [
        { name: 'rrc-TransactionIdentifier', type: 'RRC-TransactionIdentifier (0..3)', pres: 'M', dict: 'rrc-TransactionIdentifier', meta: '柜台小票号', sem: '事务标识（详见词典）', ref: '6.2.2' },
        { name: 'criticalExtensions', type: 'CHOICE { dlInformationTransfer, criticalExtensionsFuture }', pres: 'M', dict: 'criticalExtensions', meta: '版本信封——这是一条"皮薄馅厚"的消息：整条几乎只有一个字段', sem: '公共外壳（详见词典）', ref: '6.2.2', children: [
{ name: 'dlInformationTransfer', type: 'DLInformationTransfer-IEs', pres: 'M', meta: '选中的分支：下行转递信纸', sem: 'NAS 专车皮', ref: '6.2.2', children: [
{ name: 'dedicatedNAS-Message', type: 'DedicatedNAS-Message (OCTET STRING)', pres: 'O', dict: 'dedicatedNAS-Message', meta: '给 UE 的核心网来信（鉴权请求/安全命令都坐这班车）——注意它是 Need N 可选：缺省时表示"下行 NAS 递送结束"', sem: '捎带 NAS 消息（详见词典）', ref: '6.2.2' },
{ name: 'lateNonCriticalExtension', type: 'OCTET STRING', pres: 'O', focus: 'extra', dict: 'lateNonCriticalExtension', meta: '晚到的非紧急附件', sem: '非关键晚到扩展', ref: '6.2.2' },
{ name: 'nonCriticalExtension', type: 'DLInformationTransfer-v1610-IEs', pres: 'O', focus: 'extra', dict: 'nonCriticalExtension', meta: '版本扩展抽屉', sem: '非关键扩展链（详见词典）', ref: '6.2.2', children: [
{ name: 'referenceTimeInfo-r16', type: 'ReferenceTimeInfo-r16', pres: 'C', focus: 'extra', meta: '网络授时——对时服务', sem: 'Need N 条件出现', ref: '6.2.2' },
{ name: 'nonCriticalExtension', type: 'DLInformationTransfer-v1700-IEs', pres: 'O', focus: 'extra', meta: '下一格抽屉', sem: '扩展链', ref: '6.2.2', children: [
{ name: 'dedicatedInfoF1c-r17', type: 'DedicatedInfoF1c-r17', pres: 'C', focus: 'extra', meta: 'F1-C 口令捎带（CU-DU 之间）', sem: 'Need N 条件出现', ref: '6.2.2' },
{ name: 'rxTxTimeDiff-gNB-r17', type: 'RxTxTimeDiff-r17', pres: 'C', focus: 'extra', meta: '收发时差报告（定位用）', sem: 'Need N 条件出现', ref: '6.2.2' },
{ name: 'ta-PDC-r17', type: 'ENUMERATED {activate, deactivate}', pres: 'C', focus: 'extra', meta: '预定位上行定时提前的开关', sem: 'Need N 条件出现', ref: '6.2.2' },
{ name: 'sib9Fallback-r17', type: 'ENUMERATED {true}', pres: 'C', focus: 'extra', meta: 'SIB9（授时系统消息）兜底通道', sem: 'Need N 条件出现', ref: '6.2.2' }
                      ] }
                  ] }
              ] },
{ name: 'criticalExtensionsFuture', type: 'SEQUENCE {}', pres: 'M', focus: 'extra', meta: '留给未来版本的空信封——本版永远空着，占位防死锁', sem: 'CHOICE 的第二分支：新版本扩展位', ref: '6.2.2' }
          ] },
      ],
        exam: '"NAS 消息在空口走什么消息？"——上行 ULInformationTransfer、下行 DLInformationTransfer：RRC 的邮差专列。'
      },
      maa10: {
        title: 'ULInformationTransfer（鉴权应答）', dir: 'ul', from: 0, to: 1,
        label: 'ULInformationTransfer', chan: 'DCCH · SRB1 · §5.7.2',
        narr: '**为什么有它**：UE 算出应答（RES*）要送回 AMF——空口段的上行邮差专列。信封里装着 Authentication Response，到 gNB 后转乘下一步的 NGAP 上行直传。**还是那个设计**：NAS 永远不自己发电报。',
        refs: ['5.7.2'],
        ies: [
        { name: 'criticalExtensions', type: 'CHOICE { ulInformationTransfer, criticalExtensionsFuture }', pres: 'M', dict: 'criticalExtensions', meta: '版本信封——注意这条没有事务号：它不是"命令-回执"型，无需配对', sem: '公共外壳（详见词典）', ref: '6.2.2', children: [
{ name: 'ulInformationTransfer', type: 'ULInformationTransfer-IEs', pres: 'M', meta: '选中的分支：上行转递信纸', sem: 'NAS 专车皮', ref: '6.2.2', children: [
{ name: 'dedicatedNAS-Message', type: 'DedicatedNAS-Message (OCTET STRING)', pres: 'O', dict: 'dedicatedNAS-Message', meta: 'UE 给核心网的回信（鉴权响应坐这班车）', sem: '捎带 NAS 消息（详见词典）', ref: '6.2.2' },
{ name: 'lateNonCriticalExtension', type: 'OCTET STRING', pres: 'O', focus: 'extra', dict: 'lateNonCriticalExtension', meta: '晚到的非紧急附件', sem: '非关键晚到扩展', ref: '6.2.2' },
{ name: 'nonCriticalExtension', type: 'ULInformationTransfer-v1700-IEs', pres: 'O', focus: 'extra', dict: 'nonCriticalExtension', meta: '版本扩展抽屉', sem: '非关键扩展链', ref: '6.2.2', children: [
{ name: 'dedicatedInfoF1c-r17', type: 'DedicatedInfoF1c-r17', pres: 'O', focus: 'extra', meta: 'F1-C 口令捎带', sem: 'CU-DU 信息', ref: '6.2.2' },
{ name: 'nonCriticalExtension', type: 'SEQUENCE {}', pres: 'O', focus: 'extra', meta: '抽屉链终点', sem: '空容器', ref: '6.2.2' }
                  ] }
              ] },
{ name: 'criticalExtensionsFuture', type: 'SEQUENCE {}', pres: 'M', focus: 'extra', meta: '留给未来版本的空信封——本版永远空着，占位防死锁', sem: 'CHOICE 的第二分支：新版本扩展位', ref: '6.2.2' }
          ] },
      ],
        exam: '"上行 NAS 到 AMF 的两段是什么？"——ULInformationTransfer（RRC）→ UPLINK NAS TRANSPORT（NGAP）。'
      },
      maa11: {
        title: 'UPLINK NAS TRANSPORT（应答上呈）', dir: 'nas', from: 1, to: 2,
        label: 'UPLINK NAS TRANSPORT', chan: 'NG-C（38.413 §8.6.3/§9.2.5.3）· gNB→AMF',
        narr: '**为什么有它**：把 UE 的鉴权应答交还 AMF 验算，同时报上**用户位置信息**（M 级字段——AMF 的档案里位置是必填项）。AMF 核对 RES* 通过 → 鉴权完成、K_AMF 就位。接下来核心网要把"开张材料"整包交给 gNB——第二幕的高潮（下一步）。',
        refs: ['38.413#8.6.3'],
ies: [
          {"name": "Message Type", "type": "Message Type", "pres": "M", "meta": "信种戳", "sem": "消息类型", "ref": "38.413#9.2.5.3", "focus": "extra"},
          {"name": "AMF UE NGAP ID", "type": "AMF UE NGAP ID", "pres": "M", "meta": "档案号（核心网半边）", "sem": "AMF 侧关联标识", "ref": "38.413#9.2.5.3", "focus": "extra", "dict": "amfUENGAPId"},
          {"name": "RAN UE NGAP ID", "type": "RAN UE NGAP ID", "pres": "M", "meta": "档案号（无线半边）", "sem": "gNB 侧关联标识", "ref": "38.413#9.2.5.3", "focus": "extra", "dict": "ranUENGAPId"},
          {"name": "NAS-PDU", "type": "NAS-PDU（Authentication Response）", "pres": "M", "meta": "应答货物上呈——AMF 验算 RES*", "sem": "透传 NAS 应答", "ref": "38.413#9.2.5.3", "focus": "core", "dict": "nas-pdu"},
          {"name": "User Location Information", "type": "9.3.1.16", "pres": "M", "meta": "位置是档案必填项——上行也每次都要盖地址章", "sem": "用户位置（M 级）", "ref": "38.413#9.2.5.3", "focus": "core"},
          {"name": "W-AGF Identity Information", "type": "网关标识", "pres": "O", "meta": "无线固网网关的回信地址", "sem": "非 3GPP 网关标识（W-AGF）", "ref": "38.413#9.2.5.3", "focus": "extra"},
          {"name": "TNGF Identity Information", "type": "网关标识", "pres": "O", "meta": "可信 WLAN 网关的回信地址", "sem": "非 3GPP 网关标识（TNGF）", "ref": "38.413#9.2.5.3", "focus": "extra"},
          {"name": "TWIF Identity Information", "type": "网关标识", "pres": "O", "meta": "可信 WLAN 互通网关的回信地址", "sem": "非 3GPP 网关标识（TWIF）", "ref": "38.413#9.2.5.3", "focus": "extra"}
        ],
        exam: '"鉴权在哪条信令里完成？"——挑战在 DL NAS TRANSPORT+DLInformationTransfer，应答在 ULInformationTransfer+UPLINK NAS TRANSPORT：两对四条，缺一不可。'
      },
      maa12: {
        title: 'INITIAL CONTEXT SETUP REQUEST ★交钥匙', dir: 'nas', from: 2, to: 1,
        label: 'INITIAL CONTEXT SETUP REQ', chan: 'NG-C（38.413 §8.3.1/§9.2.2.1）· AMF→gNB · 档案整包交接',
        narr: '**为什么有它**：到目前为止 gNB 只是"邮差"——不认识这个 UE。这条消息让 gNB 从邮差变成管家：安全钥匙（派生 KgNB 的材料）、安全能力、速率闸门（UE-AMBR）、（有会话时）待建资源清单、还捎着 **NAS 的安全命令**（§8.3.1.2："pass it transparently towards the UE"——核心网连保安都搭这条车）。**本流程最厚的一条消息（原表 50+ 信元一字未并，全部在此）**：字段树默认亮重点，点"展开全部字段"看全量；PDU 会话清单里还有对 AMF 透明的传输容器（UPF 隧道/QoS 流配置，逐层展开四层）。\n\n**读树心法（为什么第一层是"平"的）**：NGAP 每条消息在 ASN.1 里就是一个信元容器（ProtocolIE-Container），56 个信元**平级排队**，每项自带三张标签——信元号 / 关键度（reject·ignore）/ **在场性 Presence（mandatory·optional·conditional）**。你在解码工具里看到的"另一层包裹"，是每个信元外面统一套的 ProtocolIE-Field{id, criticality, value} 外壳，不是信元本身的层级；真正的层级只存在于复合信元内部（如本条的 PDU 会话清单→传输容器→QoS 流清单，已逐层展开）。所以这张表第一层长、子孙少——**长得平是协议的真实形状**。对比：RRC 消息（如本流程第 ③④⑤ 帧）没有这层容器，信纸直接是 ASN.1 结构体，criticalExtensions 版格外壳下层层嵌套，树形自然更深。',
        refs: ['38.413#8.3.1', '38.413#9.2.2.1', '38.413#9.3.4.1'],
        ies: [
          {"name": "Message Type", "type": "Message Type（9.3.1.1）", "pres": "M", "meta": "信种戳", "sem": "消息类型", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "AMF UE NGAP ID", "type": "9.3.3.1", "pres": "M", "meta": "档案号（核心网半边）", "sem": "AMF 侧关联标识", "ref": "38.413#9.2.2.1", "focus": "extra", "dict": "amfUENGAPId"},
          {"name": "RAN UE NGAP ID", "type": "9.3.3.2", "pres": "M", "meta": "档案号（无线半边）", "sem": "gNB 侧关联标识", "ref": "38.413#9.2.2.1", "focus": "extra", "dict": "ranUENGAPId"},
          {"name": "Old AMF", "type": "AMF Name（9.3.3.21）", "pres": "O", "meta": "前任管家的名帖——有 Extended 版则本字段作废", "sem": "旧 AMF 标识", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "UE Aggregate Maximum Bit Rate", "type": "UE-AMBR（9.3.1.58）", "pres": "C", "meta": "总闸门——非保证流量总带宽上限（带会话清单时必现）", "sem": "C-ifPDUsessionResourceSetup：有会话资源建立时必带", "ref": "38.413#9.2.2.1", "focus": "core", "dict": "ue-ambr"},
          {"name": "Core Network Assistance Information for RRC INACTIVE", "type": "9.3.1.15", "pres": "O", "meta": "睡眠辅助参数包——供 gNB 决定何时挂起（M7 课的伏笔）", "sem": "INACTIVE 辅助信息", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "GUAMI", "type": "GUAMI（9.3.3.3）", "pres": "M", "meta": "户籍地址——这个 UE 归哪个 AMF 管（含备份集）", "sem": "UE 归属 AMF 标识", "ref": "38.413#9.2.2.1", "focus": "core", "dict": "guami"},
          {"name": "PDU Session Resource Setup Request List", "type": "逐会话清单（0..1 组，每组 1..256 项）", "pres": "O", "meta": "待开工的宽带装机工单——逐会话五件套（点箭头展开四层）", "sem": "会话资源建立请求列表", "ref": "38.413#9.2.2.1", "focus": "core", "dict": "pdu-session-setup-list", "children": [{"name": "PDU Session ID", "type": "9.3.1.50", "pres": "M", "meta": "工单编号——这条会话的会话号", "sem": "PDU 会话标识", "ref": "38.413#9.2.2.1", "focus": "core"}, {"name": "PDU Session NAS-PDU", "type": "NAS-PDU（9.3.3.4）", "pres": "O", "meta": "给 UE 的会话层捎带信——会话建立接受等", "sem": "会话级 NAS 消息捎带", "ref": "38.413#9.2.2.1", "focus": "extra", "dict": "nas-pdu"}, {"name": "S-NSSAI", "type": "9.3.1.24", "pres": "M", "meta": "贵宾厅编号——这条会话属哪个切片", "sem": "切片归属", "ref": "38.413#9.2.2.1", "focus": "core", "dict": "snssai"}, {"name": "PDU Session Resource Setup Request Transfer", "type": "OCTET STRING（对 AMF 透明）", "pres": "M", "meta": "工单技术附件——UPF 隧道与 QoS 流配置，AMF 只转交不拆看（点箭头逐层展开）", "sem": "透明容器（内容为 §9.3.4.1，见下）", "ref": "38.413#9.3.4.1", "focus": "core", "children": [{"name": "PDU Session Aggregate Maximum Bit Rate", "type": "9.3.1.102", "pres": "O", "meta": "这条会话自己的限速阀（Non-GBR 用）", "sem": "会话级 AMBR（有 Non-GBR 流才带）", "ref": "38.413#9.3.4.1", "focus": "extra"}, {"name": "UL NG-U UP TNL Information", "type": "UP Transport Layer Information（9.3.2.2）", "pres": "M", "meta": "上行数据的收货码头——UPF 侧隧道端点", "sem": "NG-U 用户面传输层信息（UPF 端点）", "ref": "38.413#9.3.4.1", "focus": "core"}, {"name": "Additional UL NG-U UP TNL Information", "type": "UP Transport Layer Information List（9.3.2.12）", "pres": "O", "meta": "备用收货码头——split 会话的多隧道", "sem": "附加上行隧道列表", "ref": "38.413#9.3.4.1", "focus": "extra"}, {"name": "Data Forwarding Not Possible", "type": "9.3.1.63", "pres": "O", "meta": "恕不转运声明——切换场景才可能出现", "sem": "数据前转不可行指示", "ref": "38.413#9.3.4.1", "focus": "extra"}, {"name": "PDU Session Type", "type": "9.3.1.52", "pres": "M", "meta": "装的是什么货——IP/以太网/非结构化", "sem": "PDU 会话类型", "ref": "38.413#9.3.4.1", "focus": "core"}, {"name": "Security Indication", "type": "9.3.1.27", "pres": "O", "meta": "货物运输保险要求——用户面要不要加密/完整性", "sem": "用户面安全指示", "ref": "38.413#9.3.4.1", "focus": "core"}, {"name": "Network Instance", "type": "9.3.1.113", "pres": "O", "meta": "走哪个内部物流网——网络实例路由", "sem": "网络实例（有 Common 版则忽略）", "ref": "38.413#9.3.4.1", "focus": "extra"}, {"name": "Common Network Instance", "type": "9.3.1.120", "pres": "O", "meta": "通用物流网——会话内 QoS 流共用实例", "sem": "公共网络实例", "ref": "38.413#9.3.4.1", "focus": "extra"}, {"name": "QoS Flow Setup Request List", "type": "QoS 流清单（1..64 项）", "pres": "M", "meta": "工单明细行——逐条 QoS 流的等级参数（点箭头展开）", "sem": "待建 QoS 流列表", "ref": "38.413#9.3.4.1", "focus": "core", "children": [{"name": "QoS Flow Identifier（QFI）", "type": "QFI（9.3.1.51）", "pres": "M", "meta": "每条流的舱位号——QoS 流的身份", "sem": "QoS 流标识", "ref": "38.413#9.3.4.1", "focus": "core"}, {"name": "QoS Flow Level QoS Parameters", "type": "9.3.1.12（容器）", "pres": "M", "meta": "舱位等级详情——5QI/优先级/保证速率（GFBR/MDBR）/ARP", "sem": "流级 QoS 参数组", "ref": "38.413#9.3.4.1", "focus": "core"}, {"name": "E-RAB ID", "type": "9.3.2.3", "pres": "O", "meta": "旧世界的座位号——LTE 互操作映射用", "sem": "E-UTRAN 承载标识", "ref": "38.413#9.3.4.1", "focus": "extra"}, {"name": "TSC Traffic Characteristics", "type": "9.3.1.130", "pres": "O", "meta": "时间敏感型货物的作息表——周期/突发特征", "sem": "TSC 流量特征", "ref": "38.413#9.3.4.1", "focus": "extra"}, {"name": "Redundant QoS Flow Indicator", "type": "9.3.1.134", "pres": "O", "meta": "双份投保——高可靠业务要求冗余传输", "sem": "冗余 QoS 流指示", "ref": "38.413#9.3.4.1", "focus": "extra"}, {"name": "ECN Marking or Congestion Information Reporting Request", "type": "9.3.1.266", "pres": "O", "meta": "顺路报拥堵——要求沿线反馈拥塞信息", "sem": "ECN/拥塞信息上报请求", "ref": "38.413#9.3.4.1", "focus": "extra"}]}, {"name": "Direct Forwarding Path Availability", "type": "9.3.1.64", "pres": "O", "meta": "两站之间有直达通道的声明——切换前转用", "sem": "直接前转路径可用性", "ref": "38.413#9.3.4.1", "focus": "extra"}, {"name": "Redundant UL NG-U UP TNL Information", "type": "UP Transport Layer Information（9.3.2.2）", "pres": "O", "meta": "双保险的备用收货码头——冗余隧道", "sem": "冗余上行隧道（UPF 端点）", "ref": "38.413#9.3.4.1", "focus": "extra"}, {"name": "Additional Redundant UL NG-U UP TNL Information", "type": "UP Transport Layer Information List（9.3.2.12）", "pres": "O", "meta": "冗余隧道的附加列表——多冗余端点", "sem": "附加冗余上行隧道列表", "ref": "38.413#9.3.4.1", "focus": "extra"}, {"name": "Redundant Common Network Instance", "type": "Common Network Instance（9.3.1.120）", "pres": "O", "meta": "冗余货走的内部物流网", "sem": "冗余网络实例", "ref": "38.413#9.3.4.1", "focus": "extra"}, {"name": "Redundant PDU Session Information", "type": "9.3.1.136", "pres": "O", "meta": "双份货物的完整托运单副本", "sem": "冗余 PDU 会话信息", "ref": "38.413#9.3.4.1", "focus": "extra"}, {"name": "MBS Session Setup Request List", "type": "9.3.1.211", "pres": "O", "meta": "组播频道开通单（Rel-17 MBS）", "sem": "组播会话建立请求列表", "ref": "38.413#9.3.4.1", "focus": "extra"}]}, {"name": "PDU Session Expected UE Activity Behaviour", "type": "9.3.1.94", "pres": "O", "meta": "作息预告——这个会话预计多活跃（供无线资源策略）", "sem": "会话级活跃度预估", "ref": "38.413#9.2.2.1", "focus": "extra"}]},
          {"name": "Allowed NSSAI", "type": "9.3.1.31", "pres": "M", "meta": "贵宾厅通行证——允许进的切片集合", "sem": "允许的 S-NSSAI 列表", "ref": "38.413#9.2.2.1", "focus": "core", "dict": "snssai"},
          {"name": "Partially Allowed NSSAI", "type": "9.3.1.261", "pres": "O", "meta": "部分许可的贵宾厅——只放行部分切片成员", "sem": "部分允许的 S-NSSAI", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "UE Security Capabilities", "type": "9.3.1.86", "pres": "M", "meta": "手机会哪些锁——完整性/加密算法清单，gNB 从中挑一副", "sem": "UE 安全能力（NR/E-UTRA 各一组算法）", "ref": "38.413#9.2.2.1", "focus": "core", "dict": "ue-security-capabilities"},
          {"name": "Security Key", "type": "9.3.1.87", "pres": "M", "meta": "钥匙坯——gNB 自己开模派生 KgNB，AMF 反而不知道 KgNB", "sem": "安全密钥（K_AMF 派生物）", "ref": "38.413#9.2.2.1", "focus": "core", "dict": "security-key"},
          {"name": "Trace Activation", "type": "9.3.1.14", "pres": "O", "meta": "跟踪工单——按会话/小区采样上报", "sem": "跟踪激活", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "Mobility Restriction List", "type": "9.3.1.85", "pres": "O", "meta": "禁入区域清单——哪不能去、哪些频点禁用", "sem": "移动性限制", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "UE Radio Capability", "type": "9.3.1.74", "pres": "O", "meta": "能力档案存档——带了它 gNB 可跳过能力问询", "sem": "无线能力容器（核心网存档版）", "ref": "38.413#9.2.2.1", "focus": "core", "dict": "ue-radio-capability"},
          {"name": "Index to RAT/Frequency Selection Priority", "type": "9.3.1.61", "pres": "O", "meta": "选网偏好系数（RFSP）——省电与制式策略参考", "sem": "RAT/频点选择优先级", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "Masked IMEISV", "type": "9.3.1.54", "pres": "O", "meta": "打码串号——机型识别（已脱敏）", "sem": "掩码 IMEISV", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "NAS-PDU", "type": "NAS-PDU（9.3.3.4，典型即 NAS SMC）", "pres": "O", "meta": "车上又一位乘客——NAS 安全命令也搭这条车（原文：pass transparently）", "sem": "透传 NAS 消息", "ref": "38.413#9.2.2.1", "focus": "core", "dict": "nas-pdu"},
          {"name": "Emergency Fallback Indicator", "type": "9.3.1.26", "pres": "O", "meta": "紧急回退指示——主叫触发紧急呼叫时的处理约束", "sem": "紧急回退指示", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "RRC Inactive Transition Report Request", "type": "9.3.1.91", "pres": "O", "meta": "睡醒播报订阅——INACTIVE↔CONNECTED 迁移时要通知核心网", "sem": "状态迁移上报请求", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "UE Radio Capability for Paging", "type": "9.3.1.68", "pres": "O", "meta": "寻呼用裁剪版能力——按寻呼时机压缩的能力档案", "sem": "寻呼用无线能力", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "Redirection for Voice EPS Fallback", "type": "9.3.1.116", "pres": "O", "meta": "语音回落时的改道指引——EPS Fallback 重定向信息", "sem": "语音回退重定向", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "Location Reporting Request Type", "type": "9.3.1.65", "pres": "O", "meta": "位置播报订阅——要求 gNB 上报 UE 位置变化", "sem": "位置上报请求", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "CN Assisted RAN Parameters Tuning", "type": "9.3.1.119", "pres": "O", "meta": "核心网给的调参建议——辅助 RAN 侧参数微调", "sem": "CN 辅助参数", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "SRVCC Operation Possible", "type": "9.3.1.128", "pres": "O", "meta": "可以转语音回落的记号", "sem": "SRVCC 可能性指示", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "IAB Authorized", "type": "9.3.1.129", "pres": "O", "meta": "集成回传节点的许可章", "sem": "IAB 授权", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "Enhanced Coverage Restriction", "type": "9.3.1.140", "pres": "O", "meta": "覆盖增强受限——窄带场景限制", "sem": "覆盖增强限制", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "Extended Connected Time", "type": "9.3.3.31", "pres": "O", "meta": "延长在线时长——不着急挂起的提示", "sem": "连接保持时长", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "UE Differentiation Information", "type": "9.3.1.144", "pres": "O", "meta": "用户分级——区分对待的运维依据", "sem": "用户差异化信息", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "NR V2X Services Authorized", "type": "9.3.1.146", "pres": "O", "meta": "车联网服务许可章（NR 版）", "sem": "NR V2X 授权", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "LTE V2X Services Authorized", "type": "9.3.1.147", "pres": "O", "meta": "车联网服务许可章（LTE 版）", "sem": "LTE V2X 授权", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "NR UE Sidelink Aggregate Maximum Bit Rate", "type": "9.3.1.148", "pres": "O", "meta": "NR 侧行链路总闸门——V2X 直连速率上限", "sem": "NR 侧行聚合速率", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "LTE UE Sidelink Aggregate Maximum Bit Rate", "type": "9.3.1.149", "pres": "O", "meta": "LTE 侧行链路总闸门", "sem": "LTE 侧行聚合速率", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "PC5 QoS Parameters", "type": "9.3.1.150", "pres": "O", "meta": "PC5 直连的 QoS 规则——侧行链路服务质量参数", "sem": "PC5 QoS 参数", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "CE-mode-B Restricted", "type": "9.3.1.155", "pres": "O", "meta": "窄带增强覆盖受限标记", "sem": "CE-mode-B 限制", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "UE User Plane CIoT Support Indicator", "type": "9.3.1.160", "pres": "O", "meta": "物联网用户面支持标记", "sem": "CIoT 用户面指示", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "RG Level Wireline Access Characteristics", "type": "OCTET STRING（TS 23.316）", "pres": "O", "meta": "家庭网关的固网档案——有线接入特性与 QoS", "sem": "固网接入特性", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "Management Based MDT PLMN List", "type": "MDT PLMN List（9.3.1.168）", "pres": "O", "meta": "管理侧跟踪的运营商范围", "sem": "MDT PLMN 列表", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "UE Radio Capability ID", "type": "9.3.1.142", "pres": "O", "meta": "能力档案的编号——按 ID 取能力存档，省信令", "sem": "无线能力 ID", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "Time Synchronisation Assistance Information", "type": "9.3.1.220", "pres": "O", "meta": "对时辅助信息——UE 时钟同步服务", "sem": "时间同步辅助", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "QMC Configuration Information", "type": "9.3.1.223", "pres": "O", "meta": "连接态测量采集配置（QMC）", "sem": "QMC 配置", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "Target NSSAI Information", "type": "9.3.1.229", "pres": "O", "meta": "目标切片信息——切片变更场景", "sem": "目标 NSSAI", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "UE Slice Maximum Bit Rate List", "type": "9.3.1.231", "pres": "O", "meta": "切片级闸门——每切片的速率上限", "sem": "切片级 AMBR 列表", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "5G ProSe Authorized", "type": "9.3.1.233", "pres": "O", "meta": "邻近服务许可章（ProSe 直连）", "sem": "5G ProSe 授权", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "5G ProSe UE PC5 Aggregate Maximum Bit Rate", "type": "复用 9.3.1.148", "pres": "O", "meta": "ProSe 直连总闸门", "sem": "ProSe PC5 聚合速率", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "5G ProSe PC5 QoS Parameters", "type": "9.3.1.234", "pres": "O", "meta": "ProSe 直连 QoS 规则", "sem": "ProSe PC5 QoS", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "Network Controlled Repeater Authorized", "type": "9.3.1.245", "pres": "O", "meta": "网络控制中继器的许可章", "sem": "NCR 授权", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "Aerial UE Subscription Information", "type": "9.3.1.246", "pres": "O", "meta": "无人机订阅信息——飞行类终端的约束", "sem": "空域 UE 订阅", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "NR A2X Services Authorized", "type": "9.3.1.247", "pres": "O", "meta": "空空通信服务许可章（NR 版）", "sem": "NR A2X 授权", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "LTE A2X Services Authorized", "type": "9.3.1.248", "pres": "O", "meta": "空空通信服务许可章（LTE 版）", "sem": "LTE A2X 授权", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "NR A2X UE PC5 Aggregate Maximum Bit Rate", "type": "复用 9.3.1.148", "pres": "O", "meta": "NR 空空直连总闸门", "sem": "NR A2X PC5 聚合速率", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "LTE A2X UE PC5 Aggregate Maximum Bit Rate", "type": "复用 9.3.1.149", "pres": "O", "meta": "LTE 空空直连总闸门", "sem": "LTE A2X PC5 聚合速率", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "A2X PC5 QoS Parameters", "type": "9.3.1.249", "pres": "O", "meta": "空空直连 QoS 规则", "sem": "A2X PC5 QoS", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "Mobile IAB Authorized", "type": "9.3.1.259", "pres": "O", "meta": "移动回传节点的许可章", "sem": "移动 IAB 授权", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "Ranging and Sidelink Positioning Service Information", "type": "9.3.1.269", "pres": "O", "meta": "测距与侧行定位服务信息", "sem": "Ranging/定位信息", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "Extended Old AMF", "type": "Extended AMF Name（9.3.3.51）", "pres": "O", "meta": "前任管家名帖（加长版）——有它则 Old AMF 作废", "sem": "扩展旧 AMF 标识", "ref": "38.413#9.2.2.1", "focus": "extra"},
          {"name": "AMF UE NGAP ID 2", "type": "AMF UE NGAP ID", "pres": "O", "meta": "第二档案号——跨 AMF Set 场景的备用关联", "sem": "AMF 侧第二关联标识", "ref": "38.413#9.2.2.1", "focus": "extra"}
        ],
        exam: '三连问：① KgNB 谁算——gNB（UE 同算），AMF 只交 K_AMF 材料；② NAS SMC 走哪条——本消息的 NAS-PDU 透传；③ 这条之后 gNB 有了什么——安全根/闸门/待建清单。全量信元逐个点开：每个都有比喻与白话。'
      },
      maa13: {
        title: 'SecurityModeCommand（AS 安全激活）', dir: 'dl', from: 1, to: 0,
        label: 'SecurityModeCommand', chan: 'DCCH · SRB1 · 仅完整性保护',
        narr: '**为什么有它**：钥匙到手了要立刻用——从这条消息起，信令通道要上锁（防篡改）。gNB 从 UE 能力里挑定算法对下发。**为什么只做完整性不加密**：加密此刻还没生效，但算法配置绝不能被篡改——"用已通电的完整性，锁住还没通电的加密配置"，鸡蛋问题被时序拆解。',
        refs: ['5.3.4.3'],
ies: [
        { name: 'rrc-TransactionIdentifier', type: 'RRC-TransactionIdentifier (0..3)', pres: 'M', dict: 'rrc-TransactionIdentifier', meta: '柜台小票号', sem: '事务标识（详见词典）', ref: '6.2.2' },
        { name: 'criticalExtensions', type: 'CHOICE { securityModeCommand, criticalExtensionsFuture }', pres: 'M', dict: 'criticalExtensions', meta: '版本信封', sem: '公共外壳（详见词典）', ref: '6.2.2', children: [
{ name: 'securityModeCommand', type: 'SecurityModeCommand-IEs', pres: 'M', meta: '选中的分支：上锁通知信纸——整条消息就为送一个算法选择', sem: '安全配置在此', ref: '6.2.2', children: [
{ name: 'securityConfigSMC', type: 'SecurityConfigSMC', pres: 'M', dict: 'securityConfigSMC', meta: '上锁算法通知单（详见词典）', sem: 'SMC 专用安全配置', ref: '6.2.2', children: [
{ name: 'securityAlgorithmConfig', type: 'SecurityAlgorithmConfig', pres: 'M', dict: 'securityAlgorithmConfig', meta: '算法选定单（详见词典）——网络从 UE 上报清单里挑定的那一对', sem: '加密+完整性算法', ref: '6.3.2', children: [
{ name: 'cipheringAlgorithm', type: 'CipheringAlgorithm（NEA0-3）', pres: 'M', meta: '加密算法选定——此刻先记下，下一条重配才通电', sem: 'NEA0 空/NEA1-3 雪流/祖冲之变体', ref: '6.3.2' },
{ name: 'integrityProtAlgorithm', type: 'IntegrityProtAlgorithm（NIA0-3）', pres: 'O', meta: '完整性算法选定——本条消息自己就靠它上锁（Need R）', sem: 'NIA0 空/NIA1-3', ref: '6.3.2' }
                      ] }
                  ] },
{ name: 'lateNonCriticalExtension', type: 'OCTET STRING', pres: 'O', focus: 'extra', dict: 'lateNonCriticalExtension', meta: '晚到的非紧急附件', sem: '非关键晚到扩展', ref: '6.2.2' },
{ name: 'nonCriticalExtension', type: 'SEQUENCE {}', pres: 'O', focus: 'extra', dict: 'nonCriticalExtension', meta: '版本扩展抽屉——本条没有内容', sem: '空容器', ref: '6.2.2' }
              ] },
{ name: 'criticalExtensionsFuture', type: 'SEQUENCE {}', pres: 'M', focus: 'extra', meta: '留给未来版本的空信封——本版永远空着，占位防死锁', sem: 'CHOICE 的第二分支：新版本扩展位', ref: '6.2.2' }
          ] },
      ],
        exam: '"为什么 SMC 只完整性不加密？"——时序必然：加密要等配置生效；完整性先行防篡改。'
      },
      maa14: {
        title: 'SecurityModeComplete（校验回执）', dir: 'ul', from: 0, to: 1,
        label: 'SecurityModeComplete', chan: 'DCCH · SRB1 · 明文但带完整性保护',
        narr: '**为什么必须有它**：协议世界没有"发出去就当收到"——gNB 必须拿到 UE 的证明："你选的算法+钥匙，我验算通过了"。这条回执**明文（unciphered）发送但带完整性保护**：完整性立即生效（含本消息自己），加密要"过程结束后"才生效——两个生效时刻的时序差是本流程最精妙的细节。从下一条起 SRB1 进入双保护时代。（NAS 侧的 Security Mode Complete 随后经 UPLINK NAS TRANSPORT 上行，同理必须回执。）',
        refs: ['5.3.4.3'],
ies: [
        { name: 'rrc-TransactionIdentifier', type: 'RRC-TransactionIdentifier (0..3)', pres: 'M', dict: 'rrc-TransactionIdentifier', meta: '柜台小票号——与 SMC 同号', sem: '事务标识（详见词典）', ref: '6.2.2' },
        { name: 'criticalExtensions', type: 'CHOICE { securityModeComplete, criticalExtensionsFuture }', pres: 'M', dict: 'criticalExtensions', meta: '版本信封', sem: '公共外壳（详见词典）', ref: '6.2.2', children: [
{ name: 'securityModeComplete', type: 'SecurityModeComplete-IEs', pres: 'M', meta: '选中的分支：回执信纸——不挑内容，"能完整读到它"本身就是答复（它已被完整性保护）', sem: '空载回执', ref: '6.2.2', children: [
{ name: 'lateNonCriticalExtension', type: 'OCTET STRING', pres: 'O', focus: 'extra', dict: 'lateNonCriticalExtension', meta: '晚到的非紧急附件', sem: '非关键晚到扩展', ref: '6.2.2' },
{ name: 'nonCriticalExtension', type: 'SEQUENCE {}', pres: 'O', focus: 'extra', dict: 'nonCriticalExtension', meta: '版本扩展抽屉——空', sem: '空容器', ref: '6.2.2' }
              ] },
{ name: 'criticalExtensionsFuture', type: 'SEQUENCE {}', pres: 'M', focus: 'extra', meta: '留给未来版本的空信封——本版永远空着，占位防死锁', sem: 'CHOICE 的第二分支：新版本扩展位', ref: '6.2.2' }
          ] },
      ],
        exam: '顶级细节题："SecurityModeComplete 加密吗？"——不加密但完整性保护（原文 sent unciphered）。'
      },
      maa15: {
        title: 'UECapabilityEnquiry（能力问询）', dir: 'dl', from: 1, to: 0,
        label: 'UECapabilityEnquiry', chan: 'DCCH · SRB1（已双保护）· §5.6.1',
        narr: '**为什么有它**：网络要为你定制配置（CA 组合、特性开关），得先知道你会什么——但只在**没有存档**时才问（核心网若在 ICS 里带过 UE Radio Capability，这步直接跳过："网络记性好，UE 就少说话"）。问的时候还带**频段过滤**（frequencyBandListFilter）：按口径问、按口径缓存，避免 band 组合爆炸的巨型消息。',
        refs: ['5.6.1', '5.6.1.4'],
ies: [
        { name: 'rrc-TransactionIdentifier', type: 'RRC-TransactionIdentifier (0..3)', pres: 'M', dict: 'rrc-TransactionIdentifier', meta: '柜台小票号', sem: '事务标识（详见词典）', ref: '6.2.2' },
        { name: 'criticalExtensions', type: 'CHOICE { ueCapabilityEnquiry, criticalExtensionsFuture }', pres: 'M', dict: 'criticalExtensions', meta: '版本信封', sem: '公共外壳（详见词典）', ref: '6.2.2', children: [
{ name: 'ueCapabilityEnquiry', type: 'UECapabilityEnquiry-IEs', pres: 'M', meta: '选中的分支：简历索取信纸', sem: '按制式点名', ref: '6.2.2', children: [
{ name: 'ue-CapabilityRAT-RequestList', type: 'UE-CapabilityRAT-RequestList', pres: 'M', dict: 'ue-CapabilityRAT-RequestList', meta: '点名清单——要哪几种制式的简历、各要哪些段落（详见词典）', sem: '按制式的索取列表', ref: '6.2.2', children: [
{ name: 'rat-Type（每项）', type: 'RAT-Type（枚举）', pres: 'M', dict: 'rat-Type', meta: '制式点名——按这张单子交简历（详见词典）', sem: '请求的制式', ref: '6.3.3', vals: [
{ v: 'nr', note: '要 NR 的简历' },
{ v: 'eutra-nr', note: '要 EN-DC 组合简历（NR+LTE 一起）' },
{ v: 'eutra', note: '要 LTE 的简历' },
{ v: 'utra-fdd-v1610', note: '要 3G 老制式简历（较少见）' }
                      ] },
{ name: 'capabilityRequestFilter（每项）', type: 'OCTET STRING (CONTAINING UE-CapabilityRequestFilter)', pres: 'O', focus: 'extra', dict: 'capabilityRequestFilter', meta: '简历筛选器——只交需要的章节，别把整本都寄来（Need N）', sem: 'band 过滤等（详见词典）', ref: '6.3.3' }
                  ] },
{ name: 'lateNonCriticalExtension', type: 'OCTET STRING', pres: 'O', focus: 'extra', dict: 'lateNonCriticalExtension', meta: '晚到的非紧急附件', sem: '非关键晚到扩展', ref: '6.2.2' },
{ name: 'ue-CapabilityEnquiryExt', type: 'OCTET STRING (CONTAINING UECapabilityEnquiry-v1560-IEs)', pres: 'C', focus: 'extra', meta: '扩展问询抽屉——公共筛选/分段许可放这里（Need N）', sem: 'v1560 起的扩展打包', ref: '6.2.2', children: [
{ name: 'capabilityRequestFilterCommon', type: 'UE-CapabilityRequestFilterCommon', pres: 'C', focus: 'extra', meta: '跨制式公共筛选——对所有制式生效的一次性交代（Need N）', sem: '公共过滤条件', ref: '6.3.3' },
{ name: 'nonCriticalExtension', type: 'UECapabilityEnquiry-v1610-IEs', pres: 'O', focus: 'extra', meta: '下一格抽屉', sem: '扩展链', ref: '6.2.2', children: [
{ name: 'rrc-SegAllowed-r16', type: 'ENUMERATED {enabled}', pres: 'O', focus: 'extra', meta: '允许简历分段递交——太厚就拆信封分批寄（Need N）', sem: 'RRC 分段许可', ref: '6.2.2' },
{ name: 'nonCriticalExtension', type: 'UECapabilityEnquiry-v17b0-IEs', pres: 'O', focus: 'extra', meta: '再下一格', sem: '扩展链', ref: '6.2.2', children: [
{ name: 'rrc-MaxCapaSegAllowed-r17', type: 'INTEGER (2..16)', pres: 'O', focus: 'extra', meta: '最多拆几段（Need N）', sem: '分段上限', ref: '6.2.2' },
{ name: 'nonCriticalExtension', type: 'SEQUENCE {}', pres: 'O', focus: 'extra', meta: '抽屉链终点', sem: '空容器', ref: '6.2.2' }
                          ] }
                      ] }
                  ] }
              ] },
{ name: 'criticalExtensionsFuture', type: 'SEQUENCE {}', pres: 'M', focus: 'extra', meta: '留给未来版本的空信封——本版永远空着，占位防死锁', sem: 'CHOICE 的第二分支：新版本扩展位', ref: '6.2.2' }
          ] },
      ],
        exam: '"为什么不一次问全部能力？"——band 组合指数级爆炸；过滤+按口径缓存是工程答案。'
      },
      maa16: {
        title: 'UECapabilityInformation（能力答卷）', dir: 'ul', from: 0, to: 1,
        label: 'UECapabilityInformation', chan: 'DCCH · SRB1 · 逐制式容器 + 过滤口径声明',
        narr: '**为什么必须有它**：问了一定要有答，网络等的就是这份答卷——逐制式的能力容器，还要**声明实际采用的过滤口径**（appliedFreqBandListFilter）：网络要拿它对账（与缓存口径一致才命中）。答卷太大时走 UL RRC 分段（多条拼装，M1 讲过那个指示位）。此后网络的定制配置全以这份档案为底。',
        refs: ['5.6.1', '5.6.1.4'],
ies: [
        { name: 'rrc-TransactionIdentifier', type: 'RRC-TransactionIdentifier (0..3)', pres: 'M', dict: 'rrc-TransactionIdentifier', meta: '柜台小票号——与问询同号', sem: '事务标识（详见词典）', ref: '6.2.2' },
        { name: 'criticalExtensions', type: 'CHOICE { ueCapabilityInformation, criticalExtensionsFuture }', pres: 'M', dict: 'criticalExtensions', meta: '版本信封', sem: '公共外壳（详见词典）', ref: '6.2.2', children: [
{ name: 'ueCapabilityInformation', type: 'UECapabilityInformation-IEs', pres: 'M', meta: '选中的分支：递交简历的信纸', sem: '按制式封装', ref: '6.2.2', children: [
{ name: 'ue-CapabilityRAT-ContainerList', type: 'UE-CapabilityRAT-ContainerList', pres: 'O', dict: 'ue-CapabilityRAT-ContainerList', meta: '简历册——每种制式一个不透明袋子（详见词典）', sem: '按制式的容器列表', ref: '6.2.2', children: [
{ name: 'rat-Type（每项）', type: 'RAT-Type（枚举）', pres: 'M', dict: 'rat-Type', meta: '袋子上的制式标签', sem: '简历属于哪个制式', ref: '6.3.3', vals: [
{ v: 'nr', note: '要 NR 的简历' },
{ v: 'eutra-nr', note: '要 EN-DC 组合简历（NR+LTE 一起）' },
{ v: 'eutra', note: '要 LTE 的简历' },
{ v: 'utra-fdd-v1610', note: '要 3G 老制式简历（较少见）' }
                      ] },
{ name: 'ue-CapabilityRAT-Container（每项）', type: 'OCTET STRING', pres: 'M', dict: 'ue-CapabilityRAT-Container', meta: '不透明简历袋——里面是各制式自己的 ASN.1 描述，gNB 打开才看得懂', sem: '承载该制式能力', ref: '6.3.3' }
                  ] },
{ name: 'lateNonCriticalExtension', type: 'OCTET STRING', pres: 'O', focus: 'extra', dict: 'lateNonCriticalExtension', meta: '晚到的非紧急附件', sem: '非关键晚到扩展', ref: '6.2.2' },
{ name: 'nonCriticalExtension', type: 'SEQUENCE {}', pres: 'O', focus: 'extra', dict: 'nonCriticalExtension', meta: '版本扩展抽屉——空', sem: '空容器', ref: '6.2.2' }
              ] },
{ name: 'criticalExtensionsFuture', type: 'SEQUENCE {}', pres: 'M', focus: 'extra', meta: '留给未来版本的空信封——本版永远空着，占位防死锁', sem: 'CHOICE 的第二分支：新版本扩展位', ref: '6.2.2' }
          ] },
      ],
        exam: '"答卷里为什么要声明过滤口径？"——网络对账缓存：口径一致才复用，避免每次重问。'
      },
      maa17: {
        title: 'RRCReconfiguration（装 SRB2/DRB + 捎带 Accept）', dir: 'dl', from: 1, to: 0,
        label: 'RRCReconfiguration', chan: 'DCCH · SRB1 · 建承载 · 带 Registration Accept',
        narr: '**为什么有它**：验完身、登完记，该发"装备"了——SRB2（NAS 专用信令通道）和 DRB（数据承载）一次装齐。**为什么此刻才装**：它们承载的内容必须加密（KUPenc 依赖安全激活）——顺序是结构不是建议。**NAS 的 Registration Accept 也搭这条车下行**。这条消息是 RRC 的"瑞士军刀"（M6 深讲：建/改/释承载、测量、切换都是它）。',
        refs: ['5.3.5.6', '5.3.5.1'],
ies: [
        { name: 'rrc-TransactionIdentifier', type: 'RRC-TransactionIdentifier (0..3)', pres: 'M', dict: 'rrc-TransactionIdentifier', meta: '柜台小票号——重配也要回执（下一条 Complete 凭它配对）', sem: '事务标识（详见词典）', ref: '6.2.2' },
        { name: 'criticalExtensions', type: 'CHOICE { rrcReconfiguration, criticalExtensionsFuture }', pres: 'M', dict: 'criticalExtensions', meta: '版本信封——信纸本体是全协议最长的消息之一：改任何东西都走它', sem: '公共外壳（详见词典）', ref: '6.2.2', children: [
{ name: 'rrcReconfiguration', type: 'RRCReconfiguration-IEs', pres: 'M', meta: '选中的分支：万能重配信纸——车道扩建/测量任务/搬家钥匙/专送系统消息全在这发', sem: 'attach 本步实际只用到 radioBearerConfig（SRB2+DRB1）', ref: '6.2.2', children: [
{ name: 'radioBearerConfig', type: 'RadioBearerConfig', pres: 'O', dict: 'radioBearerConfig', meta: '车道施工图——本步扩建 SRB2 和第一条 DRB（Need M：收到即存）', sem: '承载配置（详见词典）', ref: '6.2.2', children: [
{ name: 'srb-ToAddModList', type: 'SRB-ToAddModList', pres: 'C', dict: 'srb-ToAddModList', meta: '要新建/改建的信令车道清单——本步只配 SRB1', sem: 'Cond HO-Conn：切换到 NR 连接时带', ref: '6.3.2' },
{ name: 'srb3-ToRelease', type: 'ENUMERATED {true}', pres: 'O', focus: 'extra', meta: '要拆掉的 SRB3 车道（C2 口令线）', sem: 'Need N', ref: '6.3.2' },
{ name: 'drb-ToAddModList', type: 'DRB-ToAddModList', pres: 'C', focus: 'extra', dict: 'drb-ToAddModList', meta: '要新建的数据车道清单——本步还没有', sem: 'Cond HO-toNR：从 LTE 切到 NR 时带', ref: '6.3.2' },
{ name: 'drb-ToReleaseList', type: 'DRB-ToReleaseList', pres: 'O', focus: 'extra', meta: '要拆掉的数据车道清单', sem: 'Need N', ref: '6.3.2' },
{ name: 'securityConfig', type: 'SecurityConfig', pres: 'O', focus: 'extra', meta: '车道级的锁具设置', sem: 'Need M；含算法与用哪把钥匙', ref: '6.3.2', children: [
{ name: 'securityAlgorithmConfig', type: 'SecurityAlgorithmConfig', pres: 'O', focus: 'extra', meta: '车道算法——不用随车队全局走时单独设', sem: 'Need R', ref: '6.3.2' },
{ name: 'keyToUse', type: 'ENUMERATED {master, secondary}', pres: 'O', focus: 'extra', meta: '用主钥匙还是副钥匙开这条车道', sem: '双连接时 SN 车道用 secondary', ref: '6.3.2' }
                      ] }
                  ] },
{ name: 'secondaryCellGroup', type: 'OCTET STRING (CONTAINING CellGroupConfig)', pres: 'O', focus: 'extra', dict: 'secondaryCellGroup', meta: '副载波组图纸——EN-DC 加副腿时用（详见词典）', sem: 'SCG 配置', ref: '6.2.2' },
{ name: 'measConfig', type: 'MeasConfig', pres: 'O', dict: 'measConfig', meta: '测量任务书——下发邻区测量/上报规则（Need M）', sem: '测量配置（详见词典）', ref: '6.2.2' },
{ name: 'lateNonCriticalExtension', type: 'OCTET STRING', pres: 'O', focus: 'extra', dict: 'lateNonCriticalExtension', meta: '晚到的非紧急附件', sem: '非关键晚到扩展', ref: '6.2.2' },
{ name: 'nonCriticalExtension', type: 'RRCReconfiguration-v1530-IEs', pres: 'O', focus: 'extra', dict: 'nonCriticalExtension', meta: '版本扩展抽屉链——Rel-15 起的重磅扩展全在这条链上，一直挂到 Rel-19（详见词典）', sem: '非关键扩展链（详见词典）', ref: '6.2.2', children: [
{ name: 'masterCellGroup', type: 'OCTET STRING (CONTAINING CellGroupConfig)', pres: 'O', dict: 'masterCellGroup', meta: '主小区组总图更新——Setup 之后要改 MAC/RLC 参数走这里（Need M）', sem: '小区组配置（详见词典）', ref: '6.2.2' },
{ name: 'fullConfig', type: 'ENUMERATED {true}', pres: 'O', focus: 'extra', dict: 'fullConfig', meta: '全量重置开关——切换到新网络时丢掉旧参数从零配（详见词典）', sem: '全量配置指示', ref: '6.2.2' },
{ name: 'dedicatedNAS-MessageList', type: 'SEQUENCE (SIZE(1..maxDRB)) OF DedicatedNAS-Message', pres: 'O', focus: 'extra', meta: '一叠私信——重配时顺路捎给核心网（每 DRB 一封）', sem: 'NAS 消息列表', ref: '6.2.2' },
{ name: 'masterKeyUpdate', type: 'MasterKeyUpdate', pres: 'O', dict: 'masterKeyUpdate', meta: '换锁通知——新钥匙链计数与幅度（详见词典）', sem: '主密钥更新', ref: '6.2.2', children: [
{ name: 'keySetChangeIndicator', type: 'BOOLEAN', pres: 'M', dict: 'keySetChangeIndicator', meta: '换锁幅度——false 只换 AS 层钥匙，true 连 K_AMF 全套换（详见词典）', sem: '密钥组更换指示', ref: '6.2.2' },
{ name: 'nextHopChainingCount', type: 'NextHopChainingCount (0..7)', pres: 'M', dict: 'nextHopChainingCount', meta: '钥匙链计数器——横向派生走了几步，防旧钥匙重放（详见词典）', sem: '下一跳计数', ref: '6.2.2' },
{ name: 'nas-Container', type: 'OCTET STRING', pres: 'O', focus: 'extra', meta: '换锁时捎给核心网的搬家箱（Cond securityNASC）', sem: 'NAS 容器', ref: '6.2.2' }
                      ] },
{ name: 'dedicatedSIB1-Delivery', type: 'OCTET STRING (CONTAINING SIB1)', pres: 'O', focus: 'extra', dict: 'dedicatedSIB1-Delivery', meta: '专车送来的 SIB1——UE 在覆盖外收不到广播时点名补送（Need N，详见词典）', sem: 'SIB1 专送', ref: '6.2.2' },
{ name: 'dedicatedSystemInformationDelivery', type: 'OCTET STRING (CONTAINING SystemInformation)', pres: 'O', focus: 'extra', dict: 'dedicatedSystemInformationDelivery', meta: '专车送来的其它系统消息（Need N，详见词典）', sem: 'SI 专送', ref: '6.2.2' },
{ name: 'otherConfig', type: 'OtherConfig', pres: 'O', focus: 'extra', meta: '杂项配置——记录/报告类任务（Need M）', sem: '其它配置', ref: '6.2.2' },
{ name: 'nonCriticalExtension', type: 'RRCReconfiguration-v1540-IEs', pres: 'O', focus: 'extra', meta: '下一格抽屉', sem: '扩展链', ref: '6.2.2', children: [
{ name: 'otherConfig-v1540', type: 'OtherConfig-v1540', pres: 'O', focus: 'extra', meta: '杂项配置补充页（Need M）', sem: 'Rel-15 增补', ref: '6.2.2' },
{ name: 'nonCriticalExtension', type: 'RRCReconfiguration-v1560-IEs', pres: 'O', focus: 'extra', meta: '再下一格', sem: '扩展链', ref: '6.2.2', children: [
{ name: 'mrdc-SecondaryCellGroupConfig', type: 'SetupRelease { MRDC-SecondaryCellGroupConfig }', pres: 'O', focus: 'extra', meta: '双连接副臂总开关——MRDC 图纸（Need M）', sem: 'MRDC-SCG 配置', ref: '6.2.2' },
{ name: 'radioBearerConfig2', type: 'OCTET STRING (CONTAINING RadioBearerConfig)', pres: 'O', focus: 'extra', meta: '第二份车道图——给副站（SN）用的（Need M）', sem: 'SN 侧承载', ref: '6.2.2' },
{ name: 'sk-Counter', type: 'SK-Counter', pres: 'O', focus: 'extra', meta: '副站钥匙计数器——SCG 密钥新鲜度参数（Need N）', sem: 'S-K 派生计数', ref: '6.2.2' },
{ name: 'nonCriticalExtension', type: 'RRCReconfiguration-v1610-IEs', pres: 'O', focus: 'extra', meta: 'Rel-16 大抽屉——CHO/LTM 等时序重配扩展', sem: '扩展链', ref: '6.2.2', children: [
{ name: 'otherConfig-v1610', type: 'OtherConfig-v1610', pres: 'O', focus: 'extra', meta: '杂项配置补充（Need M）', sem: 'Rel-16 增补', ref: '6.2.2' },
{ name: 'bap-Config-r16', type: 'SetupRelease { BAP-Config-r16 }', pres: 'O', focus: 'extra', meta: 'IAB 回传路由表——中继节点的包怎么传（Need M）', sem: 'BAP 配置', ref: '6.2.2' },
{ name: 'iab-IP-AddressConfigurationList-r16', type: 'IAB-IP-AddressConfigurationList-r16', pres: 'O', focus: 'extra', meta: '中继节点的 IP 地址配置（Need M）', sem: 'IAB IP 配置', ref: '6.2.2' },
{ name: 'conditionalReconfiguration-r16', type: 'ConditionalReconfiguration-r16', pres: 'O', focus: 'extra', meta: '条件重配（CHO）——提前发的下一站门票，条件满足才生效（Need M）', sem: 'CHO 配置，M5 特写', ref: '6.2.2' },
{ name: 'daps-SourceRelease-r16', type: 'ENUMERATED {true}', pres: 'O', focus: 'extra', meta: 'DAPS 源侧释放——双活切换收尾（Need N）', sem: 'DAPS 释放', ref: '6.2.2' },
{ name: 't316-r16', type: 'SetupRelease { T316-r16 }', pres: 'O', focus: 'extra', meta: 'MCG 快速恢复沙漏——MR-DC 主链路故障时的救援限时，与 CHO 无关（Need M）', sem: 'T316 定时器（MCG 链路恢复）', ref: '6.2.2' },
{ name: 'needForGapsConfigNR-r16', type: 'SetupRelease { NeedForGapsConfigNR-r16 }', pres: 'O', focus: 'extra', meta: '测量要不要留收发间隙的交代（Need M）', sem: '测量间隙需求', ref: '6.2.2' },
{ name: 'onDemandSIB-Request-r16', type: 'SetupRelease { OnDemandSIB-Request-r16 }', pres: 'O', focus: 'extra', meta: '按需索取系统消息的节制阀（Need M）', sem: '按需 SI 请求', ref: '6.2.2' },
{ name: 'dedicatedPosSysInfoDelivery-r16', type: 'OCTET STRING (CONTAINING PosSystemInformation-r16-IEs)', pres: 'O', focus: 'extra', meta: '定位系统消息专送（Need N）', sem: '定位 SI 专送', ref: '6.2.2' },
{ name: 'sl-ConfigDedicatedNR-r16', type: 'SetupRelease { SL-ConfigDedicatedNR-r16 }', pres: 'O', focus: 'extra', meta: '侧行直连专用配置（Need M）', sem: 'sidelink 配置', ref: '6.2.2' },
{ name: 'sl-ConfigDedicatedEUTRA-Info-r16', type: 'SetupRelease { SL-ConfigDedicatedEUTRA-Info-r16 }', pres: 'O', focus: 'extra', meta: 'LTE 侧侧行配置信息（Need M）', sem: 'EUTRA sidelink', ref: '6.2.2' },
{ name: 'targetCellSMTC-SCG-r16', type: 'SSB-MTC', pres: 'O', focus: 'extra', meta: '目标副站的测量时序配置（Need S）', sem: 'SMTC 配置', ref: '6.2.2' },
{ name: 'nonCriticalExtension', type: 'RRCReconfiguration-v1700-IEs', pres: 'O', focus: 'extra', meta: 'Rel-17 抽屉', sem: '扩展链', ref: '6.2.2', children: [
{ name: 'otherConfig-v1700', type: 'OtherConfig-v1700', pres: 'O', focus: 'extra', meta: '杂项配置补充（Need M）', sem: 'Rel-17 增补', ref: '6.2.2' },
{ name: 'sl-L2RelayUE-Config-r17', type: 'SetupRelease { SL-L2RelayUE-Config-r17 }', pres: 'O', focus: 'extra', meta: '中继 UE 配置——帮别人转发（Need M）', sem: 'L2 中继', ref: '6.2.2' },
{ name: 'sl-L2RemoteUE-Config-r17', type: 'SetupRelease { SL-L2RemoteUE-Config-r17 }', pres: 'O', focus: 'extra', meta: '远端 UE 配置——经中继上网（Need M）', sem: 'L2 远端', ref: '6.2.2' },
{ name: 'dedicatedPagingDelivery-r17', type: 'OCTET STRING (CONTAINING Paging)', pres: 'O', focus: 'extra', meta: '专送寻呼——覆盖差的角落点名喊人', sem: '寻呼专送', ref: '6.2.2' },
{ name: 'needForGapNCSG-ConfigNR-r17', type: 'SetupRelease { NeedForGapNCSG-ConfigNR-r17 }', pres: 'O', focus: 'extra', meta: 'NCSG 小区群测量的间隙需求（Need M）', sem: 'NCSG 间隙', ref: '6.2.2' },
{ name: 'needForGapNCSG-ConfigEUTRA-r17', type: 'SetupRelease { NeedForGapNCSG-ConfigEUTRA-r17 }', pres: 'O', focus: 'extra', meta: 'LTE 侧 NCSG 间隙需求（Need M）', sem: 'NCSG 间隙', ref: '6.2.2' },
{ name: 'musim-GapConfig-r17', type: 'SetupRelease { MUSIM-GapConfig-r17 }', pres: 'O', focus: 'extra', meta: '多卡手机的测量间隙——两张卡轮流测（Need M）', sem: 'MUSIM 间隙', ref: '6.2.2' },
{ name: 'ul-GapFR2-Config-r17', type: 'SetupRelease { UL-GapFR2-Config-r17 }', pres: 'O', focus: 'extra', meta: '毫米波上行测量间隙（Need M）', sem: 'FR2 上行间隙', ref: '6.2.2' },
{ name: 'scg-State-r17', type: 'ENUMERATED { deactivated }', pres: 'O', focus: 'extra', meta: '副腿休眠开关——省电但保持连接（Need S）', sem: 'SCG 状态', ref: '6.2.2' },
{ name: 'appLayerMeasConfig-r17', type: 'AppLayerMeasConfig-r17', pres: 'O', focus: 'extra', meta: '应用层测量配置——运营商标记体验（Need M）', sem: '应用层测量', ref: '6.2.2' },
{ name: 'ue-TxTEG-RequestUL-TDOA-Config-r17', type: 'SetupRelease { UE-TxTEG-RequestUL-TDOA-Config-r17 }', pres: 'O', focus: 'extra', meta: '上行到达时差定位的发射配置（Need M）', sem: 'UL-TDOA 定位', ref: '6.2.2' },
{ name: 'nonCriticalExtension（v1800→v1900 链）', type: 'RRCReconfiguration-v1800-IEs → v1830 → v1900 → SEQUENCE {}', pres: 'O', focus: 'extra', meta: 'Rel-18/19 抽屉链（止于本层，特写课再逐层展开）：无人机配置、低时延移动性 LTM、网络控制中继 N3C、定位 SRS 带宽组合、按需定位系统消息、双连接 LTM、各版 otherConfig 增补', sem: 'needForInterruptionConfigNR-r18 / aerial-Config-r18 / sl-IndirectPathAddChange-r18 / n3c-IndirectPathAddChange-r18 / n3c-IndirectPathConfigRelay-r18 / otherConfig-v1800 / srs-PosResourceSetAggBW-CombinationList-r18 / ltm-Config-r18 /（v1830）otherConfig-v1830 /（v1900）n3c-ExtIndirectPathAddChange-r19 / otherConfig-v1900 / onDemandPosSIB-RequestCtrlParam-r19 / retainLoggedMeasurements-r19 / ltm-ConfigNRDC-r19', ref: '6.2.2' }
                                  ] }
                              ] }
                          ] }
                      ] }
                  ] }
              ] },
{ name: 'criticalExtensionsFuture', type: 'SEQUENCE {}', pres: 'M', focus: 'extra', meta: '留给未来版本的空信封——本版永远空着，占位防死锁', sem: 'CHOICE 的第二分支：新版本扩展位', ref: '6.2.2' }
          ] },
      ],
        exam: '"DRB 为什么这时候才建？"——用户面加密依赖安全激活；顺序即结构。'
      },
      maa18: {
        title: 'RRCReconfigurationComplete（+注册完成捎带）', dir: 'ul', from: 0, to: 1,
        label: 'RRCReconfigurationComplete', chan: 'DCCH · SRB1 · 配置生效回执 + Registration Complete',
        narr: '**为什么必须有它**：装机单签收——网络必须知道配置真的生效了（否则资源状态两边对不上账）。回执里再捎一封 **Registration Complete**（NAS）：注册流程的收尾确认。注意回执仍走 SRB1——"装新网卡的回执不必等新网卡"。',
        refs: ['5.3.5.3'],
ies: [
        { name: 'rrc-TransactionIdentifier', type: 'RRC-TransactionIdentifier (0..3)', pres: 'M', dict: 'rrc-TransactionIdentifier', meta: '柜台小票号——与重配同号', sem: '事务标识（详见词典）', ref: '6.2.2' },
        { name: 'criticalExtensions', type: 'CHOICE { rrcReconfigurationComplete, criticalExtensionsFuture }', pres: 'M', dict: 'criticalExtensions', meta: '版本信封', sem: '公共外壳（详见词典）', ref: '6.2.2', children: [
{ name: 'rrcReconfigurationComplete', type: 'RRCReconfigurationComplete-IEs', pres: 'M', meta: '选中的分支：回执信纸——"新配置已生效"。gNB 收到才敢放用户面数据', sem: '生效确认', ref: '6.2.2', children: [
{ name: 'lateNonCriticalExtension', type: 'OCTET STRING', pres: 'O', focus: 'extra', dict: 'lateNonCriticalExtension', meta: '晚到的非紧急附件', sem: '非关键晚到扩展', ref: '6.2.2' },
{ name: 'nonCriticalExtension', type: 'RRCReconfigurationComplete-v1530-IEs', pres: 'O', focus: 'extra', dict: 'nonCriticalExtension', meta: '版本扩展抽屉——回执也能捎报告', sem: '扩展链（详见词典）', ref: '6.2.2', children: [
{ name: 'uplinkTxDirectCurrentList', type: 'UplinkTxDirectCurrentList', pres: 'O', focus: 'extra', meta: '上行发射直流位置报告——帮网络避开本机干扰频点', sem: 'UL DC 位置', ref: '6.2.2' },
{ name: 'nonCriticalExtension', type: 'RRCReconfigurationComplete-v1560-IEs', pres: 'O', focus: 'extra', meta: '下一格抽屉', sem: '扩展链', ref: '6.2.2', children: [
{ name: 'scg-Response', type: 'CHOICE { nr-SCG-Response, eutra-SCG-Response }', pres: 'O', focus: 'extra', meta: '副腿回执——双连接时副站配置的生效确认装在这里捎回', sem: 'SCG 响应', ref: '6.2.2', children: [
{ name: 'nr-SCG-Response', type: 'OCTET STRING (CONTAINING RRCReconfigurationComplete)', pres: 'M', focus: 'extra', meta: 'NR 副腿的回执（套娃——Complete 里装 Complete）', sem: 'NR SCG 响应', ref: '6.2.2' },
{ name: 'eutra-SCG-Response', type: 'OCTET STRING', pres: 'M', focus: 'extra', meta: 'LTE 副腿的回执', sem: 'EUTRA SCG 响应', ref: '6.2.2' }
                          ] },
{ name: 'nonCriticalExtension', type: 'SEQUENCE {}', pres: 'O', focus: 'extra', meta: '抽屉链终点', sem: '空容器', ref: '6.2.2' }
                      ] }
                  ] }
              ] },
{ name: 'criticalExtensionsFuture', type: 'SEQUENCE {}', pres: 'M', focus: 'extra', meta: '留给未来版本的空信封——本版永远空着，占位防死锁', sem: 'CHOICE 的第二分支：新版本扩展位', ref: '6.2.2' }
          ] },
      ],
        exam: '"配置什么时候算生效？"——UE 发出 Complete（网络收到即对账完成）；此后 SRB2/DRB 投入使用。'
      },
      maa19: {
        title: 'INITIAL CONTEXT SETUP RESPONSE（交接收尾）', dir: 'nas', from: 1, to: 2,
        label: 'INITIAL CONTEXT SETUP RESP', chan: 'NG-C（38.413 §8.3.1/§9.2.2.2）· gNB→AMF',
        narr: '**为什么必须有它**：与第 12 步的 REQUEST 配对收尾——gNB 向 AMF 报"档案建好了、资源就位了"：建成的 DRB 与 NG-U 隧道信息逐会话回填（AMF 转交 UPF 开通下行路径）。至此**19 帧、三层接力闭环**：无线通道（RRC）、核心网档案（NGAP）、注册与鉴权（NAS）全部就位——此后的一切（测量/切换/挂起）都跑在这张已铺好的网上。',
        refs: ['38.413#8.3.1', '38.413#9.2.2.2'],
ies: [
          {"name": "Message Type", "type": "Message Type", "pres": "M", "meta": "信种戳", "sem": "消息类型", "ref": "38.413#9.2.2.2", "focus": "extra"},
          {"name": "AMF UE NGAP ID", "type": "AMF UE NGAP ID", "pres": "M", "meta": "档案号（最后一次亮相——档案正式建好）", "sem": "AMF 侧关联标识", "ref": "38.413#9.2.2.2", "focus": "extra", "dict": "amfUENGAPId"},
          {"name": "RAN UE NGAP ID", "type": "RAN UE NGAP ID", "pres": "M", "meta": "档案号", "sem": "gNB 侧关联标识", "ref": "38.413#9.2.2.2", "focus": "extra", "dict": "ranUENGAPId"},
          {"name": "PDU Session Resource Setup Response List", "type": "逐会话回执（1..256 项）", "pres": "O", "meta": "完工回执——逐会话：建成了、gNB 侧码头地址在这", "sem": "会话资源建立响应列表（AMF 转交 UPF 开下行）", "ref": "38.413#9.2.2.2", "focus": "core", "dict": "pdu-session-setup-list", "children": [{"name": "PDU Session ID", "type": "9.3.1.50", "pres": "M", "meta": "工单编号", "sem": "会话标识", "ref": "38.413#9.2.2.2", "focus": "core"}, {"name": "PDU Session Resource Setup Response Transfer", "type": "OCTET STRING（对 AMF 透明）", "pres": "M", "meta": "完工技术附件——gNB 侧隧道端点等传输配置", "sem": "响应传输容器（§9.3.4.2）", "ref": "38.413#9.2.2.2", "focus": "core"}]},
          {"name": "PDU Session Resource Failed to Setup List", "type": "逐会话失败单", "pres": "O", "meta": "没建成的工单——逐会话：没成、原因何在", "sem": "建立失败列表", "ref": "38.413#9.2.2.2", "focus": "extra", "children": [{"name": "PDU Session ID", "type": "9.3.1.50", "pres": "M", "meta": "工单编号", "sem": "会话标识", "ref": "38.413#9.2.2.2", "focus": "extra"}, {"name": "PDU Session Resource Setup Unsuccessful Transfer", "type": "OCTET STRING", "pres": "M", "meta": "失败原因附件——带 Cause 的交接说明", "sem": "失败传输容器", "ref": "38.413#9.2.2.2", "focus": "extra"}]},
          {"name": "Criticality Diagnostics", "type": "Criticality Diagnostics", "pres": "O", "meta": "质检报告——消息处理出问题时的诊断信息", "sem": "关键性诊断", "ref": "38.413#9.2.2.2", "focus": "extra"}
        ],
        exam: '压轴题："一次成功注册几帧信令？分几层？"——19 帧、三层；能按三幕复述并指出每对请求-响应，本模块毕业。'
      },
      maaf1: {
        title: '鉴权/安全失败 → 注册被拒', dir: 'warn', from: 0, to: 0,
        label: '鉴权失败 …', chan: 'MAC 失败 / 完整性校验失败 · Registration Reject',
        narr: '验身不通过的两种典型：**鉴权 MAC 比对失败**（网络回 Registration Reject 带原因值——卡机不匹配/向量异常）；或 **AS 安全完整性校验失败**（UE 回 SecurityModeFailure，网络重配算法或释放连接——协议给 UE 的说"不"通道）。用户视角"无服务/仅限紧急呼叫"，现场最常见根因是 SIM 与网络密钥体系不匹配。',
        refs: ['5.3.4.3'],
        ies: [],
        exam: '"UE 收到 SMC 校验不过会硬吞吗？"——不会：回 SecurityModeFailure 带失败原因，网络可换算法重试。'
      },
      maaf2: {
        title: '注册受限与重试', dir: 'warn', from: 0, to: 1,
        label: '拒绝 → 退避重试', chan: 'Reject(带 backoff) / UAC 限行 · 定时退避',
        narr: '另一族失败：**Registration Reject 带退避时间**（拥塞/漫游限制——退避期内不再尝试）；或接入层就被 **UAC 门禁拦下**（M3 门禁字段课）。失败不是终点：退避到点重试、换 PLMN、换小区——接入成功率的分子分母就从这些分支里来。演示结束：关闭失败开关回看成功路径。',
        refs: ['5.3.15.2'],
        ies: [],
        exam: '把"鉴权失败 vs 拒绝退避"分两类讲（验身不过 vs 名额不够），排障立刻清晰：前者查卡与密钥，后者查拥塞与权限。'
      }
    },
    panel: {
      cards: [
        { id: 'AIR', name: '第一幕 · 空口接入', desc: 'PRACH→Msg5：RRC 通道从无到有，注册申请上路。' },
        { id: 'AUTH', name: '第二幕 · 核心网验身', desc: 'NGAP 开档、鉴权四帧、交钥匙（ICS）。' },
        { id: 'OPEN', name: '第三幕 · 业务开通', desc: '上锁→能力登记→装网卡→交接收尾。' }
      ],
      edges: [
        { label: '注册请求捎带上路' },
        { label: '钥匙到手，开工' }
      ]
    },
    panelMap: {
      success: {
        0: { on: ['AIR'], failed: null, edge: null },
        5: { on: ['AIR'], failed: null, edge: 0 },
        6: { on: ['AUTH'], failed: null, edge: null },
        12: { on: ['AUTH'], failed: null, edge: 1 },
        13: { on: ['OPEN'], failed: null, edge: null },
        19: { on: ['OPEN'], failed: null, edge: null }
      },
      fail: {
        0: { on: ['AIR'], failed: null, edge: null },
        5: { on: ['AIR'], failed: null, edge: 0 },
        6: { on: ['AUTH'], failed: null, edge: null },
        7: { on: ['AUTH'], failed: 'AUTH', edge: null },
        8: { on: ['AUTH'], failed: 'AUTH', edge: null }
      }
    },
    failures: [
      { id: 'auth-mac-fail', cond: '5G-AKA 鉴权 MAC 比对失败（密钥不匹配/向量异常）', timer: null,
        trans: '网络回 Registration Reject（带原因值）→ UE 按原因处理（换网/停试/仅紧急呼叫）', kpi: '注册成功率受损；现场多查卡与 UDM 密钥体系',
        ref: '38.413#8.6.2',
        deep: '**为什么鉴权失败经常是卡的问题**：AUTN 验证不过（网络假身份/序列号失步）或 RES* 比对不过（卡内密钥与网络不一致）都落在这类。换卡对比是现场第一手段；批量出现查 UDM 数据同步。**失败发生在 NAS 层**，RRC 连接还在——UE 保持 CONNECTED 等拒绝消息，再按原因值收场。' },
      { id: 'smc-integrity-fail', cond: 'SecurityModeCommand 完整性校验失败（算法/密钥派生不一致）', timer: null,
        trans: 'UE 回 SecurityModeFailure → 网络换算法重试或释放连接', kpi: '安全激活成功率；反复失败指向密钥体系或实现缺陷',
        ref: '5.3.4.3',
        deep: '**校验失败≠崩溃**：SecurityModeFailure 带失败原因，网络可换算法再来。真失败的是派生不一致（K_AMF 链哪环错了）或算法能力协商 bug（老网新终端高发区）。**排障顺口溜**：先看算法双方认不认，再查密钥链（鉴权→K_AMF→KgNB）哪段断了。' },
      { id: 'registration-reject', cond: 'Registration Reject 带退避时间（拥塞/漫游/区域限制）', timer: null,
        trans: 'UE 退避期内停止注册尝试（NAS 定时器族管理，24.501 地界）；到点重试', kpi: '注册 KPI 分母；退避风暴防护',
        ref: '38.413#8.6.2',
        deep: '**退避是网络的自我保护**：拥塞时拒绝+backoff 让终端错峰再来，防"拒绝→立刻重试→更拥塞"的正反馈。注册成功率低时先把 Reject 原因值分布拉出来——拥塞类（调资源/门禁）、权限类（查签约）、时序类（查流程）三分天下。' },
      { id: 't300-in-attach', cond: 'RRC 腿没建成：T300 到期未收到 RRCSetup/RRCReject（覆盖/拥塞）', timer: 'T300',
        trans: '回 RRC_IDLE 按上限重试 → 超限才上报 NAS 失败', kpi: 'RRC 建立成功率（接入类 KPI 母指标）',
        ref: '5.3.3.7',
        deep: '**Attach 的地基失败**：第一幕没演完，后两幕无从谈起。T300 八档（ms100-ms2000）与连续超时上限（SIB1 广播）决定"地基失败的耐心"；超限才向 NAS 报接入失败触发上层策略。**完整失败树在 M1**——本模块挂主干。' }
    ],
    decisionPoints: [
      { at: 4, q: 'Registration Request 通过什么途径到达 AMF？',
        options: ['UE 直接发给 AMF', '搭 RRCSetupComplete 到 gNB，再由 INITIAL UE MESSAGE 装帧上呈', '走专用 DRB', '经 Xn 接口转发'],
        correct: 1, why: 'NAS 不直接发电报：先捎带（SRB1）到 gNB，再装 NGAP 首帧的 NAS-PDU 原样上交（without interpretation）。',
        ref: '38.413#8.6.1' },
      { at: 6, q: '鉴权（5G-AKA）在哪一层完成？',
        options: ['RRC 层（UE 与 gNB）', 'NGAP 层（gNB 与 AMF）', 'NAS 层（UE 与 AMF↔AUSF/UDM），RRC/NGAP 只当邮差', 'PHY 层'],
        correct: 2, why: '鉴权是 UE 与核心网之间的事：消息经 NGAP 直传 + RRC 直传两段接力透传，无线侧不参与验算。',
        ref: '38.413#8.6.2' },
      { at: 12, q: 'KgNB（AS 安全的根密钥）由谁派生？',
        options: ['AMF 算好发给 gNB', 'gNB 用 AMF 交来的 K_AMF 派生材料自己派生（UE 侧同样算）', 'UE 算好上报', 'gNB 与 AMF 各算一半拼起来'],
        correct: 1, why: 'ICS REQUEST 交的是 Security Key（K_AMF 派生材料）；KgNB 由 gNB（和 UE）各自派生——密钥分段持有，AMF 不掌握 AS 密钥。',
        ref: '38.413#8.3.1' },
      { at: 13, q: 'NAS 的安全模式命令（NAS SMC）通过哪条消息到达 UE？',
        options: ['单独的 RRC 消息', '藏在 INITIAL CONTEXT SETUP REQUEST 的 NAS-PDU 里，经 gNB 透传', '经 SIB1 广播', '经 XnAP 转发'],
        correct: 1, why: '§8.3.1.2 原文：NAS-PDU 包含在 ICS REQUEST 中时，NG-RAN 应 pass it transparently towards the UE——核心网连保安都搭这条车。',
        ref: '38.413#8.3.1' },
      { at: 15, q: '网络为什么常按频段过滤（freqBandListFilter）来问 UE 能力？',
        options: ['规范强制每次全量上报', '避免 band 组合爆炸的巨型消息，按口径问+按口径缓存', '加密需要', 'UE 拒绝全量上报'],
        correct: 1, why: '§5.6.1.4：UE 按收到的口径填报并在 appliedFreqBandListFilter 声明——消息小、可缓存、按需索取。',
        ref: '5.6.1.4' },
      { at: 17, q: '为什么 SRB2/DRB 必须等安全激活之后才建立？',
        options: ['顺序随机', '它们承载的 NAS 信令与用户数据必须加密，密钥体系随安全激活就位', '核心网规定', '为了省电'],
        correct: 1, why: 'SRB2 跑 NAS 专用信令、DRB 跑用户数据（KUPenc/KUPint）——没有密钥就没有"受保护的承载"，顺序是结构。',
        ref: '5.3.5.6' }
    ],
    quiz: [
      {
        q: 'Registration Request 首次"上车"是在哪条消息里？',
        o: ['RRCSetupRequest', 'RRCSetupComplete 的 dedicatedNAS-Message', 'INITIAL UE MESSAGE 由 UE 直接发', 'SecurityModeComplete'], a: 1,
        why: '注册请求捎带在 RRC 建立回执（SRB1 首班车）里；到 gNB 后再由 INITIAL UE MESSAGE 装帧上呈。',
        ref: '38.413#8.6.1'
      },
      {
        q: '按 §8.6.1.2，gNB 对 INITIAL UE MESSAGE 里的 NAS-PDU 做什么？',
        o: ['解析并校验', '原样透传不解读（without interpretation）', '加密后转发', '丢弃'], a: 1,
        why: 'gNB 是邮差不是收件人——NAS 注册请求原样上交 AMF。',
        ref: '38.413#8.6.1'
      },
      {
        q: 'NAS 安全模式命令（NAS SMC）怎么到达 UE？',
        o: ['独立 RRC 消息直发', '藏在 INITIAL CONTEXT SETUP REQUEST 的 NAS-PDU 里经 gNB 透传', 'SIB1 广播', 'UE 本地生成'], a: 1,
        why: 'ICS REQUEST 携带 NAS-PDU 时 NG-RAN 原样下发——与 Registration Accept 搭重配置的车同一套路。',
        ref: '38.413#8.3.1'
      },
      {
        q: 'AS 安全激活中，KgNB 的派生发生在哪里？',
        o: ['AMF', 'gNB 与 UE 各自用 K_AMF 派生材料计算', '只在 UE', 'AUSF'], a: 1,
        why: 'AMF 交出 Security Key 后，gNB 与 UE 各自派生 KgNB——密钥分段持有。',
        ref: '38.413#8.3.1'
      },
      {
        q: '以下哪组"请求-响应"配对不属于本流程？',
        o: ['SecurityModeCommand ↔ SecurityModeComplete', 'UECapabilityEnquiry ↔ UECapabilityInformation', 'INITIAL CONTEXT SETUP REQUEST ↔ RESPONSE', 'RRCSetupRequest ↔ RRCSetup'], a: 3,
        why: 'RRCSetupRequest 的应答是 RRCSetup（录取），不是"RRCSetupRequestResponse"——前三对才是严格的命令-回执/交接配对；本流程另有重配置与注册的捎带回执。',
        ref: '5.3.3.4'
      }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
