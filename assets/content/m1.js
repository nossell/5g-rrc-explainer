/* ============================================================
   assets/content/m1.js — M2 系统消息（免费开箱课，v22 起免费）
   （文案规范见 core.js 头注；不确定常量见使用手册核验清单）
   ============================================================ */
(function (g) {
  'use strict';
  var R = g.RRC;

  /* ---------------- M2 系统消息 ---------------- */
  R.register({
    id: 'm1', num: 2, title: '系统消息', tagline: 'UE 的"入住须知"从哪来：MIB、SIB1 与按需 SI',
    schema: 2,
    free: true, tech: '5G NR · SA', minutes: 9, prereq: ['m0'],
    intro: {
      title: '场景：刚到一家新"酒店"，先读公告栏',
      narr: 'UE 开机选好小区后，第一件事不是打电话，而是读这家小区的公告栏——系统信息。NR 把公告分成了三层：**永远在播的最小信息**（MIB+SIB1）和**要了才给的按需信息**（其他 SIB），这个分层正是本模块的主线。读完你还能回答网优常问的："系统消息多久作废一次？"（3 小时，§5.2.2.2.1）"变更了 UE 怎么知道？"（修改周期+短消息）。',
      plain: '手机待机时大部分时间在深度睡眠省电，可来电、短信还得找得到它——这门课讲网络怎么只在约定的时刻广播喊人、点到你的名字，以及没听到点名会发生什么，这正是手机能待机好几天还接得到电话的秘密。',
    },
    actors: [
      { x: 260, label: 'UE', sub: '你的手机' },
      { x: 640, label: 'gNB', sub: '基站' }
    ],
    failLabel: '失败分支（按需 SI 无响应）',
    panelTitle: '信息层级',
    failTagText: '按需获取失败',
    panelNote: '信令图每走一步，这里点亮当前正在处理的"信息层"——最小信息永远在播，其余按需供应。',
    paths: {
      success: ['m1s1', 'm1s2', 'm1s3', 'm1s4', 'm1s5', 'm1s6', 'm1s7'],
      fail: ['m1s1', 'm1s2', 'm1s3', 'm1f1', 'm1f2']
    },
    steps: {
      m1s1: {
        title: '读 MIB（主信息块）', dir: 'int', from: 0, to: 0,
        label: '读 MIB · 主信息块', chan: 'BCH/PBCH · 80ms 周期 · 随小区搜索完成',
        narr: '第一份"门口公示牌"：MIB 在 BCH 上以 **80ms 周期**广播（80ms 内有重复），UE 在小区搜索阶段就顺手读了。内容极少但缺一不可——**它的核心使命是携带"怎么获取 SIB1"的参数**（§5.2.1：参数 needed to acquire SIB1），比如 SSB 与 CORESET 的复用模式。MIB 不含小区选择参数——那是 SIB1 的活。',
        plain: '门口公示牌 MIB（主信息块）内容极少，核心就一句：去哪、怎么收下一份详细公告；它每 80 毫秒循环重播，手机在搜小区时顺手就读了。',
        refs: ['5.2.1'],
        ies: [
        { name: 'BCCH-BCH-Message / mib', type: 'ASN.1 消息顶层', pres: 'M', meta: '物理层捎带的迷你名片——PBCH 上每 80ms 一换，4 字节装下解 SIB1 的全部钥匙', sem: 'BCH 上的 MIB（无信令承载）', ref: '6.2.1', children: [
{ name: 'systemFrameNumber', type: 'BIT STRING (SIZE (6))', pres: 'M', meta: '系统帧号的低 6 位（高 4 位藏在 PBCH 的扰码/其它比特里）', sem: 'SFN 低段', ref: '6.2.2' },
{ name: 'subCarrierSpacingCommon', type: 'ENUMERATED {scs15or60, scs30or120}', pres: 'M', meta: 'SIB1 及后续公共信道的"语速"档位', sem: '公共子载波间隔', ref: '6.2.2' },
{ name: 'ssb-SubcarrierOffset', type: 'INTEGER (0..15)', pres: 'M', meta: 'SSB 与公共资源块的频域错位——对齐坐标系的偏移量', sem: 'SSB 子载波偏移', ref: '6.2.2' },
{ name: 'dmrs-TypeA-Position', type: 'ENUMERATED {pos2, pos3}', pres: 'M', meta: '解调参考点的位置', sem: 'DMRS TypeA 位置', ref: '6.2.2' },
{ name: 'pdcch-ConfigSIB1', type: 'PDCCH-ConfigSIB1', pres: 'M', meta: '找 SIB1 的寻宝图——在哪个控制资源集里听调度（CORESET#0/搜索空间）', sem: 'SIB1 的 PDCCH 配置', ref: '6.2.2' },
{ name: 'cellBarred', type: 'ENUMERATED {barred, notBarred}', pres: 'M', meta: '本小区门禁——barred 则一切免谈', sem: '小区禁止标志', ref: '6.2.2' },
{ name: 'intraFreqReselection', type: 'ENUMERATED {allowed, notAllowed}', pres: 'M', meta: '被禁后同频邻区还能不能选', sem: '同频重选许可', ref: '6.2.2' },
{ name: 'spare', type: 'BIT STRING (SIZE (1))', pres: 'M', focus: 'extra', dict: 'spare', meta: '占位填充', sem: '填充位', ref: '6.2.2' }
          ] },
      ],
        exam: '"MIB 在 BCH、SIB1 在 DL-SCH"——信道归属是基本盘；再补一句"MIB 的内容就是教你找 SIB1"就到位了。80ms 这个数也常被问。'
      },
      m1s2: {
        title: '读 SIB1（最小系统信息）', dir: 'dl', from: 1, to: 0,
        label: 'SIB1 · 周期广播', chan: 'BCCH → DL-SCH · SI-RNTI 调度 · 160ms 周期',
        narr: '"总服务台公告"：SIB1 在 DL-SCH 上以 **160ms 周期**广播（默认每 20ms 重复一次，实际重复周期由网络定，§5.2.1）。它带着：小区接入与重选参数、**其他 SIB 的调度表**（si-SchedulingInfo：哪些 SIB 映射到哪条 SI 消息、周期多长、SI-window 多大、每条是"正在广播"还是"按需供应"）、以及**每个 SIB 各自的版本号 valueTag**（注意：NR 是按 SIB 逐个打版本，LTE 才是 SIB1 一个总号）。SIB1 永远周期广播、不可关闭——它是 UE 能在这家"酒店"住下去的前提。物理层给 SIB1/SI 消息的大小上限是 **2976 bit**（§5.2.1 NOTE2）。下面的字段树点行看详情、点箭头开子字段。',
        plain: '总服务台公告 SIB1 循环播放、永不关门：这家小区怎么接入怎么换、其他每份资料几点播带什么版本号，全登在上面——想在这里住下，这份公告是必修课。',
        refs: ['5.2.1', '6.3.1'],
        ies: [
          { name: 'cellSelectionInfo', type: 'SEQUENCE{ q-RxLevMin, q-QualMin … }', pres: 'C', focus: 'core',
            meta: '入住门槛牌——最低接收电平（q-RxLevMin）与最低质量（q-QualMin）：不够格不让驻留（Cond Standalone：SA 独立组网才带）',
            sem: '小区选择参数：S 判据的门槛值（Srxlev/Squal，重选课展开），带 SUL 与偏移变体', ref: '6.3.1',
            children: [
              { name: 'q-RxLevMin / q-QualMin（含 Offset/SUL 变体）', type: 'Q-RxLevMin / Q-QualMin / INTEGER(1..8)', pres: 'M', focus: 'core',
                meta: '门槛的两个刻度：够响（电平）+ 够干净（质量）；偏移是特定场景的手调余量',
                sem: '最低接收电平/质量门限与偏移', ref: '6.3.1' }
            ] },
          { name: 'cellAccessRelatedInfo', type: 'CellAccessRelatedInfo', pres: 'M', focus: 'core',
            meta: '前台公示牌——这家店归哪些运营商（PLMN）、属哪个片区（TAC）、有没有"装修中谢客"',
            sem: '小区接入信息：PLMN 列表、跟踪区码、保留指示', ref: '6.3.1',
            children: [
              { name: 'plmn-IdentityList / trackingAreaCode', type: 'PLMN-IdentityInfoList / TAC', pres: 'M', focus: 'core',
                meta: '双重地址：哪几家运营商共享这栋楼 + 楼属哪个片区（TA 是寻呼的单位）',
                sem: 'PLMN 身份列表（每项含 PLMN+接入禁止标识）与 24bit 跟踪区码', ref: '6.3.1' },
              { name: 'cellReservedForOperatorUse / ForOtherUse', type: 'ENUMERATED{reserved,…}', pres: 'O', focus: 'extra',
                meta: '"会员制/装修中"告示——保留给运维或特定用途，普通 UE 绕行',
                sem: '运营商保留/其它用途保留指示', ref: '6.3.1' }
            ] },
          { name: 'si-SchedulingInfo', type: 'SI-SchedulingInfo', pres: 'O', focus: 'core',
            meta: '广播节目单——哪些 SIB 装在哪趟车、多久一班、窗口多长、按需车怎么叫',
            sem: '其它 SIB 的调度总表（Need R）', ref: '6.3.1',
            children: [
              { name: 'schedulingInfoList', type: 'SEQUENCE OF SchedulingInfo', pres: 'M', focus: 'core',
                meta: '车次表逐条：这趟车（SI 消息）装哪些货（SIB）、多久一班、在不在运营',
                sem: '每条 SI 消息：si-BroadcastStatus（broadcasting/notBroadcasting）+ si-Periodicity + sib-MappingInfo', ref: '6.3.1',
                children: [
                  { name: 'sib-MappingInfo → SIB-TypeInfo{ type, valueTag, areaScope }', type: 'SEQUENCE OF SIB-TypeInfo', pres: 'M', focus: 'core',
                    meta: '车上货单：每件货自带版本号（valueTag）与作用范围章（areaScope）——**NR 按货逐件打版本**，没变就不用重收，一次比对省一套广播',
                    sem: '逐 SIB 映射：类型 + valueTag（0..31，有才可比对）+ areaScope（区域有效标记）', ref: '6.3.1' }
                ] },
              { name: 'si-WindowLength', type: 'ENUMERATED {s5…s2560}', pres: 'M', focus: 'core',
                meta: '每趟车的最长等待窗——不同车窗口互不重叠，守窗收货',
                sem: 'SI 窗口长度（5..2560 档）', ref: '6.3.1' },
              { name: 'si-RequestConfig（+SUL/RedCap/MSG1 重复变体）', type: 'SI-RequestConfig（Cond MSG-1 等）', pres: 'C', focus: 'core',
                meta: '按需叫车按钮——专用 PRACH 前导表：发哪个前导=叫哪趟车，连 RRC 消息都省了',
                sem: '按需 SI 的 Msg1 请求配置；Rel-17 起还有 RedCap 专用与 MSG1 重复增强变体', ref: '6.3.1' },
              { name: 'systemInformationAreaID', type: 'BIT STRING (SIZE(24))', pres: 'O', focus: 'extra',
                meta: '节目单的"分店编号"——同区域多家店共用一套 SI 时区分归属',
                sem: '系统信息区域标识（区域范围 SI 有效性判据之一，Need R）', ref: '6.3.1' }
            ] },
          { name: 'servingCellConfigCommon', type: 'ServingCellConfigCommonSIB', pres: 'O', focus: 'core',
            meta: '店面布置图——整套公共 PHY/MAC 参数树，UE 按它对齐物理层（这是全小区公共的精简版，与专用配置相对）',
            sem: '服务小区公共配置（Need R）：上下行公共参数、TDD 图样、SSB/PCI 基本信息等', ref: '6.3.1',
            children: [
              { name: 'downlinkConfigCommon / uplinkConfigCommon（组）', type: '参数树组', pres: 'M', focus: 'core',
                meta: '上下行的"通用语言"：频点、子载波间隔、初始 BWP、公共随机接入参数都在这两棵子树里',
                sem: '上下行公共配置（含 initialDownlink/UplinkBWP、rach-ConfigCommon 等，子树按需展开）', ref: '6.3.1' },
              { name: 'ssb-PositionsPerBurst / TDD-UL-DL-ConfigCommon（组）', type: '参数树组', pres: 'O', focus: 'extra',
                meta: '灯塔位置图（SSB 时位）与上下行时隙比例表',
                sem: 'SSB 位置与 TDD 上下行公共图样', ref: '6.3.1' }
            ] },
          { name: 'ims-EmergencySupport / eCallOverIMS-Support', type: 'ENUMERATED {true}', pres: 'O', focus: 'core',
            meta: '急诊室标志——本小区支不支持紧急呼叫/车联网呼救（没插 SIM 的 UE 也指望它）',
            sem: 'IMS 紧急呼叫与 eCall 支持（Need R：出现即支持）', ref: '6.3.1' },
          { name: 'ue-TimersAndConstants', type: 'UE-TimersAndConstants', pres: 'O', focus: 'core',
            meta: '全楼统一钟表设置——定时器默认档（t300/t310…）与常量（N310 等）：M1 的 T300 默认值就从这来',
            sem: '广播的定时器与常量默认值（专用信令可覆盖）', ref: '6.3.1' },
          { name: 'uac-BarringInfo', type: 'SEQUENCE{ … }', pres: 'O', focus: 'core',
            meta: '门禁规则——统一接入控制（UAC）：哪些身份/业务此刻限行（M1 讲过排队优先级，这里是门禁本尊）',
            sem: '统一接入控制配置（Need R）', ref: '6.3.1',
            children: [
              { name: 'uac-BarringForCommon / uac-BarringPerPLMN-List', type: 'UAC-BarringPerCat', pres: 'O', focus: 'core',
                meta: '通用与分运营商的限行表——按接入类别（信令/数据/各类业务）分别放行或拦下',
                sem: '按类别/按 PLMN 的禁止控制', ref: '6.3.1' },
              { name: 'uac-BarringInfoSetList + AC1 辅助', type: 'UAC-BarringInfoSetList', pres: 'M', focus: 'extra',
                meta: '限行细则表——按因子组合（SSB 电平/类别/判定时间）逐套定义',
                sem: '禁止信息集合列表（含 AccessCategory1 选择辅助）', ref: '6.3.1' }
            ] },
          { name: 'connEstFailureControl / useFullResumeID', type: 'ConnEstFailureControl / ENUMERATED{true}', pres: 'O', focus: 'extra',
            meta: '门禁故障兜底与"长房卡"开关——连续接入失败的惩罚参数；恢复 ID 用满配格式',
            sem: '连接建立失败控制（Need R）；INACTIVE 恢复用完整 I-RNTI 格式指示（Need R，M7 详讲）', ref: '6.3.1' },
          { name: 'lateNonCriticalExtension / nonCriticalExtension（v1610→）', type: 'OCTET STRING / SIB1-v1610-IEs', pres: 'O', focus: 'extra',
            meta: '箱底增页——空闲态测量开关（EUTRA/NR）、定位 SI 节目单等后补内容',
            sem: '扩展容器与链（v1610：idleModeMeasurements / posSI-SchedulingInfo 等）', ref: '6.3.1' }
        ],
        exam: 'NR 相对 LTE 的标志性变化：LTE 全部 SIB 周期广播，NR 的其他 SIB 可以"按需"——这句对比几乎必考。追问"SIB1 多久播一次"——160ms 周期、默认 20ms 重复。加分：valueTag 在 NR 是**每个 SIB 各自带**（LTE 才是 SIB1 总号）。'
      },
      m1s3: {
        title: '查调度表：广播还是按需？', dir: 'int', from: 0, to: 0,
        label: '查表 · 这条 SIB 在播吗？', chan: '内部决策 · si-BroadcastStatus',
        narr: 'UE 翻 SIB1 的调度表看 **si-BroadcastStatus**：想要的 SI 消息若标记 broadcasting，直接等它的发送窗口收；若标记 notBroadcasting（按需供应），得先发请求让基站临时播（§5.2.2.3.3/5.2.2.3.4）。像食堂：常备菜一直供应，小灶菜点了才炒。**为什么这么设计**——没听众的 SIB 不占空口资源：一个偏远小区没人用定位服务，就没必要天天广播定位 SIB。',
        plain: '手机翻公告里的节目单查一眼：想要的资料若正在常播名单，守着时间收就行；若标着点了才做，就得先开口要——像食堂常备菜一直有，小灶菜点了才炒。',
        refs: ['5.2.2.3.3', '5.2.2.3.4'],
        ies: [],
        exam: '"为什么 NR 要搞按需 SI？"——从资源效率角度答（没听众的 SIB 不占空口）就得分；能说出 si-BroadcastStatus 这个字段名更专业。'
      },
      m1s4: {
        title: '按需请求 · RRCSystemInfoRequest', dir: 'ul', from: 0, to: 1,
        label: 'RRCSystemInfoRequest', chan: 'UL-CCCH · SRB0/TM · 或用 Msg1 专用前导码',
        narr: '请求有两条路（§5.2.2.3.3 的决策树）：**省字的路**——若 SIB1 配了 si-RequestConfig，UE 用与目标 SI 消息绑定的**专用 PRACH 前导码**发起随机接入（发前导=提出请求，连 RRC 消息都省了；还有 SUL/RedCap/MSG1 重复等变体）；**通用的路**——发 RRCSystemInfoRequest（SRB0/CCCH/TM，和 M1 的建立请求同类），消息体就是一个 **32 bit 位图** requested-SI-List：每位对应一条 SI 消息，要哪组把哪位置 1，一次最多点 32 条（§6.2.2 ASN.1）。',
        plain: '点菜有两条路：省事的走法是喊一嗓子专用暗号，喊了就算下单；正式的走法是递点菜单——32 个格子，要哪几份资料就把哪几格勾上。',
        refs: ['5.2.2.3.3', '5.2.2.3.4', '6.2.2'],
        ies: [
        { name: 'criticalExtensions', type: 'CHOICE { rrcSystemInfoRequest, criticalExtensionsFuture-r16 }', pres: 'M', dict: 'criticalExtensions', meta: '版本信封——注意这里的第二分支本身就是 r16 扩展（定位消息点单）', sem: '公共外壳', ref: '6.2.2', children: [
{ name: 'rrcSystemInfoRequest', type: 'RRCSystemInfoRequest-IEs', pres: 'M', meta: '点单信本体——一张 32bit 的勾选表', sem: 'SI 请求分支', ref: '6.2.2', children: [
{ name: 'requested-SI-List', type: 'BIT STRING (SIZE (32))', pres: 'M', meta: '节目勾选表——第 n 位为 1 就是要第 n 条 SI 消息', sem: '请求的 SI 列表', ref: '6.2.2' },
{ name: 'spare', type: 'BIT STRING (SIZE (12))', pres: 'M', focus: 'extra', dict: 'spare', meta: '占位填充', sem: '填充位', ref: '6.2.2' }
              ] },
{ name: 'criticalExtensionsFuture-r16 → rrcPosSystemInfoRequest-r16', type: 'RRC-PosSystemInfoRequest-r16-IEs', pres: 'M', focus: 'extra', meta: '定位消息点单分支——requestedPosSI-List 同样是勾选表（32bit+11spare）', sem: '定位 SI 请求', ref: '6.2.2' }
          ] },
      ],
        exam: '两种请求方式的比较（Msg1 专用前导省信令但前导资源有限 / Msg3 位图更明确、可一次点多条）是加分题；至少要说出有两种。位图 32 bit 这个数字值得记。'
      },
      m1s5: {
        title: 'gNB 调度广播 SI 消息', dir: 'dl', from: 1, to: 0,
        label: 'SI 消息广播', chan: 'BCCH → DL-SCH · SI-window 内 · SI-RNTI',
        narr: '基站把对应 SI 消息排进广播。规则很讲究（§5.2.1）：每条 SI 消息关联一个 **SI-window**，**不同 SI 消息的窗口互不重叠**——一个窗口内只发对应的那条；同一条 SI 消息可在窗口内重复多次以提可靠性。**打包规则**：只有周期相同的 SIB 才能映射进同一条 SI 消息（schedulingInfoList 配置），一条 SI 消息可以打包多个 SIB 一起发。UE 按调度表算好"几点开窗"，守着窗口收齐整组。',
        plain: '基站按节目单开播：每份资料有专属时间窗，不同资料的窗互不重叠，窗内还会重播几遍保你收全；只有更新节奏相同的资料才捆成一份发。',
        refs: ['5.2.1'],
        ies: [],
        exam: '"UE 怎么知道何时收哪个 SI？"——SIB1 调度表 + SI-window；答出"窗口不重叠、一条消息可在窗口内重复、同周期才能打包"这三点就是满分答案。'
      },
      m1s6: {
        title: '存储 SIB · 启动有效期', dir: 'int', from: 0, to: 0,
        label: '存储 + 有效期计时', chan: '3 小时有效期 · valueTag 比对',
        narr: '收齐后存起来。规范给出明确数字：**存储的 SIB 在确认有效后 3 小时作废**（§5.2.2.2.1：delete any stored version of a SIB after 3 hours），到期必须重新获取。例外名单也记一下：**MIB、SIB1、SIB6/7/8（告警类）不许沿用存储版**——永远要最新的。判断"存储版还能不能用"的比对三要素：PLMN 标识 + 小区标识（或 systemInformationAreaID 区域标识）+ valueTag——三者都对上才算有效（§5.2.2.2.1）。valueTag 没变 = 内容没改，全省一次全量重读。',
        plain: '收齐的资料存进手机，保质期只有 3 小时，到期必须重收；存的还算不算数，看小区对不对、版本号变没变——版本没变就是内容没改，省得整份重读。',
        refs: ['5.2.2.2.1'],
        ies: [],
        exam: '"UE 怎么知道系统消息变了？"两个机制都要说：寻呼短消息里的变更指示 + valueTag 比对，只答一个扣一半分。追问"存储多久作废"——3 小时，这是个被反复问的硬数字。'
      },
      m1s7: {
        title: '修改周期：变了就统一切换', dir: 'int', from: 0, to: 0,
        label: '变更通知 → 修改周期边界切换', chan: '短消息（P-RNTI DCI）· 修改周期边界',
        narr: '系统消息变更走"修改周期"节奏（§5.2.2.2.2）：**边界由 SFN mod m = 0 定义**（m=修改周期包含的无线帧数，由系统信息配置）。基站先在寻呼时机用 **Short Message**（P-RNTI 加扰的 DCI）广播变更指示，其中 systemInfoModification 位置 1；UE 收到后**从下一个修改周期的起点开始**重新获取 SI——新内容在指示之后的那个修改周期才生效，所有 UE 在同一边界统一切换，避免新旧配置混用。**例外：告警不等周期**——etwsAndCmasIndication 位置 1 时（地震/海啸/商用告警），UE 要**立即**重取 SIB1 和 SIB6/7/8，救命的事一毫秒不等。',
        plain: '公告改版不搞突然袭击：基站先广播一条变更提示，所有手机等到同一个周期起点统一切换新版，免得新旧混用；唯独地震海啸这类救命告警不等周期，立刻重收。',
        refs: ['5.2.2.2.2'],
        ies: [],
        exam: '考点是"为什么不立即生效"——让所有 UE 同步切换、避免边界混乱；这是广播类配置管理的通用设计思想。反问"告警也不等吗"——不等，ETWS/CMAS 立即重取，这个对比是好题眼。'
      },
      m1f1: {
        title: '请求无响应 · 窗口空等', dir: 'warn', from: 0, to: 0,
        label: 'SI 没出现 …', chan: '拥塞或丢失 · 无否定应答',
        narr: '请求发出去了，但 SI 窗口里什么都没等到（请求丢失或基站拥塞）。与 M1 的 T300 一样，这里没有否定应答——UE 只能按约定的节奏处理失败后择机再试，就像点了菜迟迟不上，不会在窗口前站一整天。注意与 M1 的关键差别：**SI 获取失败不掉网**——SIB1 永远在播，基本驻留不受影响。',
        plain: '点的菜迟迟没上——可能下单丢了，也可能后厨太忙；协议没有上不了菜的回执，手机等完这个窗口便择机再点，好在这不影响驻留，不会掉网。',
        refs: ['5.2.2.3.2'],
        ies: [],
        exam: '"SI 请求失败会掉网吗？"——不会。能分清"基本盘"（MIB/SIB1）和"增强项"（其他 SIB）的失败后果，才算真懂分层。'
      },
      m1f2: {
        title: '放弃本次获取 · 保持驻留', dir: 'warn', from: 0, to: 0,
        label: '放弃 → 保持驻留', chan: '稍后再试 · 依赖功能暂缺',
        narr: '记一次获取失败，稍后可再试（§5.2.2.2.1 重新获取的触发条件包括"无有效存储版本时"）。真实影响只是依赖这份 SIB 的功能暂时不可用（比如某些接入控制信息、定位辅助数据）。演示结束：关闭失败开关或点重播回到成功路径。',
        plain: '这一轮先放弃、改天再点：实际损失只是依赖这份资料的功能暂时歇着，比如定位辅助这类服务——人还照常住在店里，只是少了一项便利。',
        refs: ['5.2.2.2.1'],
        ies: [],
        exam: '把"SI 获取失败"与"M1 的 RRC 建立失败（回 IDLE）"对比着记——一个无伤大雅，一个伤筋动骨。'
      }
    },
    panel: {
      cards: [
        { id: 'MIB', name: 'MIB · 门口公示牌', desc: 'PBCH 永远在播，随同步读取。' },
        { id: 'SIB1', name: 'SIB1 · 总台公告', desc: '周期广播不可关；携带调度表与版本号。' },
        { id: 'SIO', name: '其他 SIB · 小灶菜', desc: '按需请求后才在 SI 窗口广播。' }
      ],
      edges: [
        { label: 'SIB1 调度信息在此' },
        { label: '按需请求 → SI 窗口' }
      ]
    },
    panelMap: {
      success: {
        0: { on: ['MIB'], failed: null, edge: null },
        2: { on: ['SIB1'], failed: null, edge: null },
        3: { on: ['SIB1', 'SIO'], failed: null, edge: null },
        4: { on: ['SIO'], failed: null, edge: 1 },
        7: { on: ['SIB1', 'SIO'], failed: null, edge: null }
      },
      fail: {
        0: { on: ['MIB'], failed: null, edge: null },
        3: { on: ['SIB1', 'SIO'], failed: null, edge: null },
        5: { on: [], failed: 'SIO', edge: null }
      }
    },
    failures: [
      { id: 'si-no-response', cond: '按需 SI 请求后，SI 窗口内未等到对应广播（请求丢失或未被调度）', timer: null,
        trans: '放弃本次获取、保持驻留，稍后可再试', kpi: '依赖该 SIB 的功能暂缺（接入控制/定位等）；不影响驻留与基本业务',
        ref: '5.2.2.3.2',
        deep: '**为什么 SI 失败的设计如此"佛系"**——因为系统信息不是会话：没有连接可以挂掉，没有状态需要回滚。UE 驻留的底线是 MIB+SIB1（永远在播），其他 SIB 都是增强。所以失败处理就是"择机重试"：下次触发条件到了（重新选小区、收到变更指示、上层需要、存储过期）自然再取。这与 M1 建立失败要"复位 MAC/重建 RLC"的兴师动众形成鲜明对比——**失败的代价取决于过程携带多少状态**。' },
      { id: 'value-tag-mismatch', cond: '重读 SIB1 时发现 valueTag 与存储版不一致', timer: null,
        trans: '判定系统信息已变更 → 重新获取相关 SI 消息', kpi: '多消耗一次广播接收；避免用到过期配置',
        ref: '5.2.2.2.1',
        deep: '**valueTag 是"一票否决的版本号"**：UE 存 SIB 时连带记下 (PLMN, cellIdentity 或 systemInformationAreaID, valueTag) 三元组。回来一比——前两项决定"是不是同一个地方"（区域级 SIB 跨小区可用），valueTag 决定"内容变没变"。任一对不上就作废重读。注意它是**触发重读**而不是失败：这是性能优化机制（省电省空口），不是错误场景。' },
      { id: 'validity-expiry', cond: '存储的 SIB 自确认有效起已满 3 小时', timer: null,
        trans: '删除存储版 → 需要时重新获取', kpi: '周期性重读开销（网络无法逐 UE 通知 IDLE 态 UE）',
        ref: '5.2.2.2.1',
        deep: '**为什么是 3 小时**——IDLE 态 UE 与网络没有双向连接，网络没法"推送"作废通知（变更指示只覆盖计划内变更，还要 UE 恰好在听寻呼）。兜底方案就是保质期：3 小时后自动作废。MIB/SIB1/告警类 SIB6-8 根本不给存（MIB/SIB1 每次驻留都要读，告警必须最新），**能享受存储优惠的只有普通 SIB**。这个设计权衡了"省电"与"新鲜度"。' },
      { id: 'si-change-indication', cond: '短消息中 systemInfoModification 位置 1（系统信息将变更）', timer: null,
        trans: '从下一个修改周期起点重新获取 SI', kpi: '所有 UE 在同一边界统一切换；避免新旧配置混用',
        ref: '5.2.2.2.2',
        deep: '**两级缓冲的设计**：变更指示先播一个修改周期，新内容再在下一周期生效——听漏指示的 UE 最多晚一个周期。边界用 SFN mod m = 0 对齐，全网同步。**eDRX 加长版**：睡眠周期比修改周期还长的 UE 用 systemInfoModification-eDRX 位 + eDRX 获取周期边界（H-SFN mod 1024 = 0）。**告警走绿色通道**：etwsAndCmasIndication 位触发立即重取 SIB1/6/7/8，不等任何周期——一致性让位于紧迫性。' }
    ],
    decisionPoints: [
      { at: 0, q: 'MIB 的核心作用是什么？',
        options: ['携带小区重选参数', '告诉 UE 如何获取 SIB1', '分配 UE 的临时身份', '广播寻呼时机'],
        correct: 1, why: '§5.2.1：MIB 包含 "parameters that are needed to acquire SIB1"——它是找 SIB1 的钥匙。小区重选参数在 SIB1 里。',
        ref: '5.2.1' },
      { at: 3, q: 'UE 需要的 SI 消息在调度表里标记为 notBroadcasting，接下来怎么办？',
        options: ['永远收不到了，换小区', '先请求（专用前导或 RRCSystemInfoRequest），等基站临时广播', '进入连接态用 DRB 接收', '重读 MIB'],
        correct: 1, why: '§5.2.2.3.3/3.4：按需 SI 先请求后接收；请求可用 Msg1 专用前导（省消息）或 SRB0 上的 RRCSystemInfoRequest（32 bit 位图点名）。',
        ref: '5.2.2.3.3' },
      { at: 5, q: 'UE 存储的普通 SIB（非 MIB/SIB1/告警类）多久自动作废？',
        options: ['30 分钟', '3 小时', '24 小时', '永不过期，靠 valueTag 判断'],
        correct: 1, why: '§5.2.2.2.1："delete any stored version of a SIB after 3 hours from the moment it was successfully confirmed as valid"。valueTag 管内容变没变，3 小时是兜底保质期。',
        ref: '5.2.2.2.1' },
      { at: 6, q: 'UE 收到 systemInfoModification 位置 1 的短消息，何时重新获取系统信息？',
        options: ['立即全量重读', '从下一个修改周期起点开始', '等下一次开机', '进入连接态后由网络专递'],
        correct: 1, why: '§5.2.2.2.2：新内容在指示所在周期之后的修改周期生效，UE 从下一修改周期起点重新获取——全网同边界切换。立即重读只适用于告警（etwsAndCmasIndication）。',
        ref: '5.2.2.2.2' }
    ],
    quiz: [
      {
        q: 'NR 中 SIB1 的广播方式是？',
        o: ['周期广播且不可关闭', '完全按需请求', '仅开机后单播一次', '由核心网逐 UE 下发'], a: 0,
        why: 'SIB1 属"最小系统信息"，永远周期广播（160ms 周期，DL-SCH）；可以按需获取的是其他 SIB。这是 NR 与 LTE 的关键差异。',
        ref: '5.2.1'
      },
      {
        q: 'UE 判断系统消息内容是否变更、避免全量重读的机制是？',
        o: ['每次全量重读', '比对 SIB1 中的 valueTag', '等掉网重搜', '每秒发一次查询'], a: 1,
        why: 'valueTag 是系统信息版本号：没变即没改；配合寻呼短消息里的变更指示共同构成变更感知机制。',
        ref: '5.2.2.2.1'
      },
      {
        q: 'NR 请求按需 SI 可用的方式是？',
        o: ['只能经 NAS 信令', 'UL-CCCH 上的 RRCSystemInfoRequest，或 Msg1 专用前导码', '只能在连接态用 DRB', '无法请求，只能等'], a: 1,
        why: '两种方式：Msg1 专用前导（省一条消息但前导资源有限）或 Msg3 的 RRCSystemInfoRequest（32 bit 位图，更明确）。',
        ref: '5.2.2.3.3'
      },
      {
        q: '下列哪类 SIB 不允许使用存储版本、必须保持最新？',
        o: ['SIB2（小区重选）', 'SIB4（邻频）', 'SIB6/7/8（ETWS/CMAS 告警）', 'SIB9（时间信息）'], a: 2,
        why: '§5.2.2.2.1：MIB、SIB1、SIB6、SIB7、SIB8 之外的 SI 才可沿用存储版；告警类信息关乎安全，必须立即最新。',
        ref: '5.2.2.2.1'
      },
      {
        q: 'RRCSystemInfoRequest 一次最多能点名多少条 SI 消息？',
        o: ['1 条（一次一条）', '8 条', '32 条（位图每位对应一条）', '不限量'], a: 2,
        why: '§6.2.2 ASN.1：requested-SI-List 是 BIT STRING (SIZE(32))——32 bit 位图，每位置 1 代表一条要请求的 SI 消息。',
        ref: '6.2.2'
      }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
