/* ============================================================
   assets/content/m2.js — M3 寻呼与 DRX（免费开箱课，v24 起免费）
   （文案规范见 core.js 头注；不确定常量见使用手册核验清单；
   M2 系统消息课在 m1.js——免费课各占独立文件，发行构建按文件剥离）
   ============================================================ */
(function (g) {
  'use strict';
  var R = g.RRC;

  /* ---------------- M3 寻呼与 DRX ---------------- */
  R.register({
    id: 'm2', num: 3, title: '寻呼与 DRX', tagline: '网络怎么"敲门"找到睡着的 UE',
    schema: 2,
    free: true, tech: '5G NR · SA', minutes: 10, prereq: ['m0'],
    intro: {
      title: '场景：宿舍楼里喊人，而不是挨个敲门',
      narr: 'IDLE 态的 UE 深度睡眠省电，网络要找它（来电、短信、推送），只能约定时刻"广播喊人"。本模块走一遍：谁来发起、UE 何时醒来、听到点名怎么办、没听到又会怎样。还会讲一个容易被忽略的细节：**空口那条 Paging 消息有时根本不带点名名单**——它可能只是一条系统信息变更/告警的"短消息载体"（§5.2.2.2.2、§6.2.2）。',
      plain: '手机待机时大部分时间在深度睡眠省电，可来电、短信还得找得到它——这门课讲网络怎么只在约定的时刻广播喊人、点到你的名字，以及没听到点名会发生什么，这正是手机能待机好几天还接得到电话的秘密。',
    },
    actors: [
      { x: 150, label: 'UE', sub: '沉睡中的手机' },
      { x: 460, label: 'gNB', sub: '基站' },
      { x: 790, label: 'AMF', sub: '核心网 5GC' }
    ],
    failLabel: '失败分支（UE 错过寻呼）',
    panelTitle: 'UE 的睡眠周期',
    failTagText: '寻呼丢失 · 等重发',
    panelNote: '信令图每走一步，这里点亮 UE 当前的"睡眠状态"——寻呼机制的本质是约定时刻的定点唤醒。',
    paths: {
      success: ['m2s1', 'm2s2', 'm2s3', 'm2s4', 'm2s5', 'm2s6', 'm2s7'],
      fail: ['m2s1', 'm2s2', 'm2s3', 'm2f1', 'm2f2']
    },
    steps: {
      m2s1: {
        title: 'AMF 触发寻呼（核心网域）', dir: 'nas', from: 2, to: 1,
        label: 'NGAP Paging', chan: '核心网 → 基站 · 含 UE 标识与 TA',
        narr: '有人找 UE 了（被叫、短信、推送）：AMF 在 UE 最后注册的追踪区里，向区内所有 gNB 发 NGAP Paging，附上 UE 的临时用户标识。注意：这是"核心网→基站"的内部传话（NGAP 属 TS 38.413），还没上空口。',
        plain: '有人找你了（来电、短信）：核心网的管理员 AMF 在你上次登记的那片区域，向区内所有基站挨个递话 NGAP Paging（核心网到基站的内部传呼单）——“这个编号的用户有人找”，此刻还没上无线电波。',
        refs: ['38.413#9.2.4.1', '6.2.2'],
        ies: [
        { name: 'Message Type', type: 'Message Type（9.3.1.1）', pres: 'M', meta: '信种戳', sem: '消息类型标识', ref: '38.413#9.2.4.1' },
        { name: 'UE Paging Identity', type: 'UE Paging Identity（9.3.3.18）', pres: 'M', meta: '被点名的证件号——5G-S-TMSI 或 I-RNTI（INACTIVE 态）', sem: 'UE 寻呼身份', ref: '38.413#9.2.4.1' },
        { name: 'Paging DRX', type: 'Paging DRX（9.3.1.90）', pres: 'O', meta: '点名周期——gNB 按它算在哪几帧喊人', sem: '寻呼非连续接收周期', ref: '38.413#9.2.4.1' },
        { name: 'TAI List for Paging', type: '容器（组）', pres: 'M', meta: '要在哪些跟踪区喊——一嗓子覆盖整个 TA 列表', sem: '寻呼跟踪区列表', ref: '38.413#9.2.4.1', children: [
{ name: 'TAI List for Paging Item（每项）', type: '容器（组）', pres: 'M', meta: '逐区条目', sem: 'TAI 条目', ref: '38.413#9.2.4.1', children: [
{ name: 'TAI', type: 'TAI（9.3.3.11）', pres: 'M', meta: '跟踪区标识（PLMN+TAC）', sem: '跟踪区标识', ref: '38.413#9.2.4.1' }
              ] }
          ] },
        { name: 'Paging Priority', type: 'Paging Priority（9.3.1.78）', pres: 'O', focus: 'extra', meta: '插队特权——优先级高的先喊', sem: '寻呼优先级', ref: '38.413#9.2.4.1' },
        { name: 'UE Radio Capability for Paging', type: '9.3.1.68', pres: 'O', focus: 'extra', meta: '广播域简历裁剪版——按轻量配置解 Paging 消息', sem: '寻呼用无线能力', ref: '38.413#9.2.4.1' },
        { name: 'Paging Origin', type: 'Paging Origin（9.3.3.22）', pres: 'O', focus: 'extra', meta: '谁发起的点名（语音/短信/信令）', sem: '寻呼来源', ref: '38.413#9.2.4.1' },
        { name: 'Assistance Data for Paging', type: '9.3.1.69', pres: 'O', focus: 'extra', meta: '省电辅助参数（帮助 gNB 更准地喊）', sem: '寻呼辅助数据', ref: '38.413#9.2.4.1' },
        { name: 'NB-IoT Paging eDRX Information', type: '9.3.1.138', pres: 'O', focus: 'extra', meta: '窄带物联网的超长睡眠周期', sem: 'NB-IoT eDRX 信息', ref: '38.413#9.2.4.1' },
        { name: 'NB-IoT Paging DRX', type: '9.3.1.139', pres: 'O', focus: 'extra', meta: 'NB-IoT 专属点名周期（在场则忽略 Paging DRX）', sem: 'NB-IoT 寻呼 DRX', ref: '38.413#9.2.4.1' },
        { name: 'Enhanced Coverage Restriction', type: '9.3.1.140', pres: 'O', focus: 'extra', meta: '覆盖增强限制', sem: '增强覆盖限制', ref: '38.413#9.2.4.1' },
        { name: 'WUS Assistance Information', type: '9.3.1.143', pres: 'O', focus: 'extra', meta: '唤醒信号辅助——耳机先听呼噜再决定醒不醒', sem: 'WUS 辅助信息', ref: '38.413#9.2.4.1' },
        { name: 'E-UTRA Paging eDRX Information', type: '9.3.1.154', pres: 'O', focus: 'extra', meta: 'LTE 侧超长睡眠周期', sem: 'E-UTRA eDRX 信息', ref: '38.413#9.2.4.1' },
        { name: 'CE-mode-B Restricted', type: '9.3.1.155', pres: 'O', focus: 'extra', meta: 'CE-B 模式限制', sem: 'CE-mode-B 限制', ref: '38.413#9.2.4.1' },
        { name: 'NR Paging eDRX Information', type: '9.3.1.227', pres: 'O', focus: 'extra', meta: 'NR 侧超长睡眠周期', sem: 'NR eDRX 信息', ref: '38.413#9.2.4.1' },
        { name: 'Paging Cause', type: 'ENUMERATED (voice, …)', pres: 'O', focus: 'extra', meta: '喊你干嘛——语音呼入', sem: '寻呼原因', ref: '38.413#9.2.4.1' },
        { name: 'PEIPS Assistance Information', type: '9.3.1.232', pres: 'O', focus: 'extra', meta: '省电早期指示辅助', sem: 'PEIPS 辅助信息', ref: '38.413#9.2.4.1' },
        { name: 'LP-WUSPS Assistance Information', type: '9.3.1.279', pres: 'O', focus: 'extra', meta: '低功耗唤醒协议辅助', sem: 'LP-WUSPS 辅助信息', ref: '38.413#9.2.4.1' },
        { name: 'LP-WUS Disable Indication', type: 'ENUMERATED (true, …)', pres: 'O', focus: 'extra', meta: '关闭低功耗唤醒的指示', sem: 'LP-WUS 禁用指示', ref: '38.413#9.2.4.1' },
      ],
        exam: '把"发起"（核心网 CN 寻呼 / 基站 RAN 寻呼）与"发送"（空口 PCCH 广播）分两层讲清，是这题的分水岭。'
      },
      m2s2: {
        title: '把 UE 映射到寻呼时机', dir: 'int', from: 1, to: 1,
        label: '计算 PF / PO', chan: 'UE_ID 哈希 × DRX 周期',
        narr: 'gNB（和 UE 用同一套规则）把 UE 标识哈希成"寻呼帧 PF + 寻呼时机 PO"：每个 UE 只在属于自己的 PO 醒来听（§5.2.2.2.2：UE 在 its own paging occasion 监听），其余时间沉睡。全体 UE 被错开铺在不同 PO 上，负载也摊匀了。具体计算公式在 TS 38.304——面试答"两侧按公开规则独立计算、结果天然一致"即可。',
        plain: '基站和手机各拿你的用户编号做同一道公开的数学题，算出只属于你的“叫醒时刻”：大家被错开排在不同时间点醒来，既不必一直开着收音机耗电，点名也不会挤在同一时刻。',
        refs: ['5.2.2.2.2'],
        ies: [],
        exam: '会答"PO/PF 由 UE_ID 和 DRX 周期按公开规则算出、两侧独立计算结果一致"；具体数值表不用背（进核验清单）。'
      },
      m2s3: {
        title: '空口广播 Paging', dir: 'dl', from: 1, to: 0,
        label: 'Paging · 广播点名', chan: 'PCCH · P-RNTI 加扰的 PDCCH 调度 · RLC TM',
        narr: '到点了：gNB 在 PO 用 P-RNTI 加扰的 PDCCH 发指示，PDSCH 里携带 Paging 消息（§6.2.2：PCCH/TM/下行，SRB 为 N/A——它根本不走信令承载）。消息里是一条**点名名单** pagingRecordList，一次可携带多条记录。像宿舍楼下的大喇叭，一嗓子喊好几个名字，喊到的自己下楼。**名单居然是可选的**：pagingRecordList 缺席时这条"寻呼"其实是短消息——只通知系统信息变更或告警，谁都不用下楼。',
        plain: '到点了，基站像楼下大喇叭一嗓子同时喊好几个名字：在无线电波上广播一份点名名单（Paging，寻呼消息），喊到的自己下楼；有时这条消息根本不带名单，只是捎个信“系统广播要更新或有告警”，谁都不用动。',
        refs: ['6.2.2'],
        ies: [
        { name: 'pcch-Message / c1 / Paging', type: 'ASN.1 消息顶层', pres: 'M', meta: '大喇叭广播的点名名单——PCCH 信道本体（SRB N/A：不走信令承载）', sem: 'Paging 消息主体', ref: '6.2.2', children: [
{ name: 'pagingRecordList', type: 'SEQUENCE (SIZE(1..maxNrofPageRec)) OF PagingRecord', pres: 'O', meta: '点名名单——一嗓子喊好几个名字，喊到的自己下楼（Need N；**缺席时这条"寻呼"其实是短消息**：只通知系统信息变更或 ETWS/CMAS 告警）', sem: '寻呼记录列表', ref: '6.2.2', children: [
{ name: 'PagingRecord（每条）', type: '容器（组）', pres: 'M', meta: '一条点名记录', sem: '寻呼记录', ref: '6.2.2', children: [
{ name: 'ue-Identity', type: 'PagingUE-Identity（CHOICE）', pres: 'M', meta: '被点名的证件号', sem: '寻呼身份', ref: '6.2.2', children: [
{ name: 'ng-5G-S-TMSI', type: 'NG-5G-S-TMSI（48bit）', pres: 'M', meta: 'CONNECTED 掉线的用户按全档案号喊', sem: '5G-S-TMSI 身份', ref: '6.2.2' },
{ name: 'fullI-RNTI', type: 'I-RNTI-Value', pres: 'M', meta: 'INACTIVE 睡着的用户按临时号喊', sem: '完整 I-RNTI 身份', ref: '6.2.2' }
                      ] },
{ name: 'accessType', type: 'ENUMERATED {non3GPP}', pres: 'O', focus: 'extra', meta: '从非 3GPP 侧来的呼入（Need N）', sem: '接入类型', ref: '6.2.2' }
                  ] }
              ] },
{ name: 'lateNonCriticalExtension', type: 'OCTET STRING', pres: 'O', focus: 'extra', dict: 'lateNonCriticalExtension', meta: '晚到的非紧急附件', sem: '非关键晚到扩展', ref: '6.2.2' },
{ name: 'nonCriticalExtension', type: 'Paging-v1700-IEs', pres: 'O', focus: 'extra', dict: 'nonCriticalExtension', meta: '版本抽屉——Rel-17 起的扩展（语音原因/群呼）', sem: '非关键扩展链', ref: '6.2.2', children: [
{ name: 'pagingRecordList-v1700', type: 'PagingRecordList-v1700', pres: 'O', focus: 'extra', meta: 'Rel-17 版点名名单', sem: 'v17 记录列表', ref: '6.2.2', children: [
{ name: 'pagingCause-r17（每条）', type: 'ENUMERATED {voice}', pres: 'O', focus: 'extra', meta: '喊你干嘛——语音呼入（省 UE 白跑一趟）', sem: '寻呼原因', ref: '6.2.2' }
                  ] },
{ name: 'pagingGroupList-r17', type: 'PagingGroupList-r17', pres: 'O', focus: 'extra', meta: '群呼名单——一嗓子喊一组', sem: '寻呼组列表', ref: '6.2.2' },
{ name: 'nonCriticalExtension', type: 'Paging-v1800-IEs', pres: 'O', focus: 'extra', meta: '下一格抽屉', sem: '扩展链', ref: '6.2.2', children: [
{ name: 'pagingRecordList-v1800', type: 'PagingRecordList-v1800', pres: 'O', focus: 'extra', meta: 'Rel-18 版点名名单', sem: 'v18 记录列表', ref: '6.2.2', children: [
{ name: 'mt-SDT（每条）', type: 'ENUMERATED {true}', pres: 'O', focus: 'extra', meta: '小数据直递——不用为几字节醒来建立连接', sem: '移动终接小数据指示', ref: '6.2.2' }
                      ] },
{ name: 'pagingGroupList-v1800', type: 'PagingGroupList-v1800', pres: 'O', focus: 'extra', meta: 'Rel-18 群呼（含群内休眠许可）', sem: 'v18 群呼列表', ref: '6.2.2' },
{ name: 'nonCriticalExtension', type: 'SEQUENCE {}', pres: 'O', focus: 'extra', meta: '抽屉链终点', sem: '空容器', ref: '6.2.2' }
                  ] }
              ] }
          ] },
      ],
        exam: '寻呼是"点名广播"不是单播；P-RNTI 是公共标识，所有 UE 解的是同一个 PDCCH。加分点：说出"名单可选、缺席即纯短消息"；再知道 Rel-17 寻呼组（先组后名）就是超纲分。'
      },
      m2s4: {
        title: 'UE 在 PO 醒来解码', dir: 'int', from: 0, to: 0,
        label: '醒来 · 扫一眼 PDCCH', chan: '只在 PO 监听 · 其余深睡',
        narr: 'UE 平时射频深度睡眠，只在每个 PO 短暂醒来解 PDCCH（§5.2.2.2.2：IDLE/INACTIVE 态 UE 在自己的 PO 监听）。这是 IDLE 态待机功耗的协议层根源：唤醒越频繁越费电、越省电则被叫越迟——手机"待机时长 vs 接通速度"的取舍就写在这里。',
        plain: '手机里的收音机平时彻底关掉省电，只在算好的叫醒时刻睁眼一小会儿，扫一扫有没有人在喊自己——醒得越勤越费电、睡得越沉接电话越慢，待机时长和接通速度的取舍就写在这里。',
        refs: ['5.2.2.2.2'],
        ies: [],
        exam: '"IDLE 态 UE 最耗电的动作是什么？"——周期性醒来监听；答出 DRX 周期与功耗/时延的权衡即高分。'
      },
      m2s5: {
        title: '命中判定', dir: 'int', from: 0, to: 0,
        label: '点名里有我？', chan: '比对寻呼记录 · 可能带原因',
        narr: 'UE 比对 Paging 记录：自己的 NG-5G-S-TMSI 在列表里→被叫！不在→翻身继续睡。记录还可能带 accessType（非 3GPP 域来话）等信息，UE 可据此决定接入策略。顺序别答反：**先解 PDCCH（P-RNTI）→ 再读 PDSCH 的 Paging → 比对记录**，三步一条链。',
        plain: '醒来后逐条核对点名名单：里面出现自己的临时编号 NG-5G-S-TMSI（网络给手机起的代号）就是被叫了，没有自己就翻个身接着睡。',
        refs: ['6.2.2'],
        ies: [],
        exam: '顺序别答反：先解 PDCCH（P-RNTI）→ 再读 PDSCH 的 Paging → 比对记录。三步一条链。'
      },
      m2s6: {
        title: '发起 RRC 连接建立（→ M1）', dir: 'ul', from: 0, to: 1,
        label: '响应寻呼 · 发起建立', chan: '转 M1 流程 · 被叫接入',
        narr: '命中的 UE 只有一条应答路径：发起 RRC 连接建立（就是 M1 那套流程），establishmentCause 填 **mt-Access**（被叫类）——接入优先级与统计口径都与主叫不同（§6.2.2 枚举里 mt-Access 与 mo-Data 等并列）。之后经核心网接通来电/短信。',
        plain: '被点到名的手机只有一条应答路：主动向基站发起连接建立（RRC 连接建立，即第一次开机入网那套流程），并亮明身份“我是被叫”——处理优先级和统计口径都与主动打电话的不同。',
        refs: ['6.2.2', '5.3.3.3'],
        ies: [],
        exam: '被叫与主叫的 establishCause 不同——一句话点出"寻呼响应是 mt-Access"，说明你把 M1 和 M3 串起来了。'
      },
      m2s7: {
        title: '扩展场景：eDRX 与 RAN 寻呼', dir: 'int', from: 0, to: 0,
        label: 'eDRX · 更长睡眠周期', chan: '更省电 ⇄ 更慢的接通',
        narr: '可穿戴/物联网设备可用 eDRX 把睡眠周期拉到极长（§5.2.2.2.2：IDLE eDRX 周期可比修改周期还长，此时用 eDRX 获取周期对齐，边界 H-SFN mod 1024 = 0）：功耗更低，被叫响应更慢。另一个方向是 M7 的 RRC_INACTIVE：基站自己在小范围内 RAN 寻呼，不劳核心网跑全程——寻呼家族两条演进线都在省"信令成本"。',
        plain: '手表、传感器这类小设备可以把睡眠周期拉得极长（eDRX，超长待机模式），更省电但被叫响应更慢；另一个方向是让基站在小范围内自己喊人、不必劳驾核心网跑全程——两条演进路线省的都是成本。',
        refs: ['5.2.2.2.2'],
        ies: [],
        exam: 'eDRX 的取舍（功耗 vs 时延）和 RAN 寻呼的动机（省核心网信令）各答一句，就是完整答案。'
      },
      m2f1: {
        title: 'UE 错过本 PO', dir: 'warn', from: 0, to: 0,
        label: '错过寻呼 …', chan: '覆盖差 / 时序偏差 · 无确认',
        narr: '覆盖太差或醒来时序没对上，UE 没解到寻呼。网络并不知道 UE 没听到——寻呼没有确认机制（PCCH 广播、RLC TM，喊话是"尽力而为"），重发策略完全在网络侧。',
        plain: '信号太差或醒来的时刻没对准，手机错过了这次点名——麻烦在于喊话没有“收到请回复”一说，网络并不知道你没听到，只能按自己的节奏决定要不要再喊。',
        refs: ['6.2.2'],
        ies: [],
        exam: '寻呼为什么不需要 ACK？——UE 没连着就没法回话；所以重发策略在网络侧，UE 侧只是守约醒来。'
      },
      m2f2: {
        title: '核心网按策略重发', dir: 'warn', from: 2, to: 1,
        label: '重发 Paging', chan: '次数用尽 → 通知主叫',
        narr: 'AMF 在同一 TA 内按次数与间隔再次 Paging（5GC 侧重发策略见 TS 23.502），直到用尽——然后向主叫回"无法接通"。这就是"您拨打的用户暂时无法接通"的协议层来源之一。演示结束：关闭失败开关回到成功路径。**这场寻呼的上游**：包先到 UPF、缓冲、报 SMF、SMF 请 AMF 发起——"网络触发服务请求"的完整链条在 **M14《5GC 流程课》第三条腿**。',
        plain: '网络按约定的次数和间隔在同一片区域反复重喊，始终没人应就放弃，回头告诉主叫方“无法接通”——你听过的那句“您拨打的用户暂时无法接通”，源头之一就在这里。',
        refs: ['23.502#4.2.2.2', '6.2.2'],
        ies: [],
        exam: '"暂时无法接通"的协议层链条：寻呼超时重发→用尽→CN 拒绝接续。把用户体验和协议行为对上号，面试官会眼前一亮。'
      }
    },
    panel: {
      cards: [
        { id: 'SLEEP', name: '深睡省电', desc: 'IDLE 默认状态：射频关闭，只等约定的 PO。' },
        { id: 'PO', name: 'PO 定点监听', desc: '醒来解 PDCCH，几毫秒内决定睡或动。' },
        { id: 'HIT', name: '命中应答', desc: '发起 RRC 建立（→ M1）接通业务。' }
      ],
      edges: [
        { label: 'PF/PO 哈希约定' },
        { label: 'ID 命中 → 建立连接' }
      ]
    },
    panelMap: {
      success: {
        0: { on: ['SLEEP'], failed: null, edge: null },
        2: { on: ['PO'], failed: null, edge: 0 },
        4: { on: ['PO'], failed: null, edge: null },
        6: { on: ['HIT'], failed: null, edge: 1 },
        7: { on: ['SLEEP', 'PO'], failed: null, edge: null }
      },
      fail: {
        0: { on: ['SLEEP'], failed: null, edge: null },
        2: { on: ['PO'], failed: null, edge: 0 },
        5: { on: ['SLEEP'], failed: 'PO', edge: null }
      }
    },
    failures: [
      { id: 'missed-paging', cond: 'UE 未在 PO 解到寻呼（覆盖差、醒来时序偏差、PDCCH 漏解）', timer: null,
        trans: 'UE 无感知，继续睡眠周期；等网络侧重发', kpi: '被叫接通时延拉长；UE 侧无计数',
        ref: '6.2.2',
        deep: '**为什么寻呼敢用"尽力而为"**——因为它是唯一能触达失联 UE 的手段：UE 没有任何专用资源（没有 SRB、没有 RNTI 级的专属信道），广播是唯一选项。而广播 + TM 模式注定无确认。补偿机制全在网络侧：按策略重发 + 次数/间隔递增。**UE 侧唯一的责任**是守约醒来——错过 PO 的 UE 甚至不知道自己错过了什么，这是"无状态失败"的极端案例（比 M2 的 SI 失败还要轻：SI 失败 UE 至少知道自己想要什么）。' },
      { id: 'paging-exhausted', cond: '核心网重发次数与时间预算用尽，UE 仍未应答', timer: null,
        trans: 'AMF 向主叫回"无法接通"（5GC 侧策略，TS 23.502）', kpi: '被叫失败（网络侧 KPI：寻呼成功率）',
        ref: '6.2.2',
        deep: '**"暂时无法接通"的完整协议链条**：来电 → CN 寻呼（TA 内所有小区）→ 各 gNB 空口广播 → 无应答 → 重发若干轮 → 耗尽预算 → 主叫收到释放/拒绝。注意每一跳都可能背锅：TA 配大了吗（寻呼范围太广）？DRX 周期配长了吗（UE 睡太死）？覆盖有洞吗（部分 PO 收不到）？——网优排"接通率"问题时这三问就是标准检查单。' },
      { id: 'short-message-only', cond: 'UE 醒来解到 P-RNTI 调度，但 Paging 消息不含点名名单（pagingRecordList 缺席）', timer: null,
        trans: '不是叫我——按短消息指示行事（SI 变更/告警处理），随后继续睡', kpi: '无失败后果；这是正常机制而非错误',
        ref: '5.2.2.2.2',
        deep: '**"空名单"的秘密**：P-RNTI 加扰的 DCI 里可以带 8 bit 短消息（systemInfoModification/etwsAndCmasIndication 等）——此时 PDSCH 上的 Paging 消息没有 pagingRecordList，纯粹当短消息的"顺风车"。设计动机：**唤醒时机是现成的**——UE 反正要在 PO 醒来听寻呼，顺手把系统信息变更/告警通知也捎上，省得再设计一套唤醒机制。所以 UE 醒来后的完整决策树是：有短消息位？→按位处理；有点名名单？→比对身份；都没有？→接着睡。' },
      { id: 'edrx-latency', cond: 'eDRX 配置的长睡眠周期导致寻呼在多个周期后才被收到', timer: null,
        trans: 'UE 按扩展周期醒来后正常响应（未丢失，只是迟到）', kpi: '被叫接通时延显著增加（换待机时长）',
        ref: '5.2.2.2.2',
        deep: '**eDRX 的账怎么算**：普通 DRX 周期是秒级以内，eDRX 可到分钟甚至小时级（可穿戴/传感器的选择）。代价是网络必须把寻呼"挂着"等 UE 醒来——5GC 侧寻呼预算随之膨胀。规范还配套了 eDRX 获取周期（边界 H-SFN mod 1024 = 0）保证长睡眠 UE 仍能感知系统信息变更。**取舍的本质**：被叫时延从"秒"变"分钟"对水表传感器无所谓，对手表来电致命——所以这是按设备类型选配而非默认开启的机制。' }
    ],
    decisionPoints: [
      { at: 1, q: '每个 UE 该在哪个 PO 醒来，由什么决定？',
        options: ['两侧按公开规则（UE 标识哈希 × DRX 周期）独立计算，天然一致', '基站每次单独通知 UE', 'UE 自己随机决定', 'AMF 下发绝对时刻表'],
        correct: 0, why: '§5.2.2.2.2：UE 在 its own paging occasion 监听；PF/PO 计算规则公开（TS 38.304），两侧独立算出同一结果——省掉"通知醒来"这条鸡生蛋的信令。',
        ref: '5.2.2.2.2' },
      { at: 3, q: '一条 Paging 消息点名多名 UE，名单装在哪个字段？',
        options: ['pagingRecordList（每条含 ue-Identity）', '为每个 UE 分配专用 RNTI', 'NAS 容器里加密携带', 'MIB 广播'],
        correct: 0, why: '§6.2.2：pagingRecordList 是记录列表，每条含 NG-5G-S-TMSI 与可选 accessType；且整个列表本身可选——缺席即纯短消息。',
        ref: '6.2.2' },
      { at: 5, q: '醒来后比对点名名单，UE 用什么标识比对？',
        options: ['C-RNTI', '39 bit 随机值', 'NG-5G-S-TMSI', '完整 IMSI'],
        correct: 2, why: '§6.2.2：PagingRecord 的 ue-Identity 类型是 PagingUE-Identity（NG-5G-S-TMSI）。C-RNTI 是连接态的，IMSI 永不上空口。',
        ref: '6.2.2' },
      { at: 6, q: '被叫 UE 发起 RRC 连接建立，establishmentCause 应填？',
        options: ['mo-Data', 'mt-Access', 'mo-Signalling', 'emergency'],
        correct: 1, why: '§6.2.2 枚举中 mt-Access 即 mobile terminated（被叫类）；主叫数据是 mo-Data。被叫原因在接入优先级与统计口径上都与主叫不同。',
        ref: '6.2.2' }
    ],
    quiz: [
      {
        q: 'IDLE 态 UE 用什么信道 / 标识监听寻呼？',
        o: ['DCCH + C-RNTI', 'PCCH + P-RNTI', 'BCCH + SI-RNTI', 'CCCH + RA-RNTI'], a: 1,
        why: '寻呼走 PCCH，由公共的 P-RNTI 加扰调度；DCCH 是专用信令、BCCH 是系统信息、CCCH 是接入类公共控制——四个信道对应四类场景，全部对上才算过关。',
        ref: '6.2.2'
      },
      {
        q: '决定 UE "在哪个时刻醒来"监听寻呼的是？',
        o: ['基站每次实时单播通知', '由 UE 标识哈希与 DRX 周期算出的 PF/PO', 'UE 每毫秒都听', '核心网指定绝对时刻'], a: 1,
        why: '两侧按同一公开规则独立计算 PF/PO，结果自然一致——这省去了"通知醒来"这条鸡生蛋的信令。',
        ref: '5.2.2.2.2'
      },
      {
        q: 'UE 错过寻呼后，网络侧行为是？',
        o: ['给 UE 发重传请求', '无确认机制，按策略重发寻呼', '立即将 UE 置为掉网', '发 SMS 提醒 UE'], a: 1,
        why: '寻呼无 ACK：网络按次数/间隔重发，用尽后向主叫回"无法接通"。UE 侧只负责守约在 PO 醒来。',
        ref: '6.2.2'
      },
      {
        q: 'UE 醒来解到 P-RNTI 调度，但 Paging 消息里没有点名名单，说明什么？',
        o: ['基站故障', '这是纯短消息：系统信息变更或告警指示，不需要 UE 应答', '该 UE 被拉黑', '马上要释放连接'], a: 1,
        why: '§6.2.2：pagingRecordList 为 OPTIONAL——缺席时本消息只承载短消息位（SI 变更/PWS 指示），UE 按指示处理后继续睡。',
        ref: '6.2.2'
      },
      {
        q: '寻呼记录中 accessType 字段的取值与含义是？',
        o: ['语音/短信/数据三选一', '仅 non3GPP——表示寻呼源自非 3GPP 接入域', '主叫/被叫标记', '优先级等级'], a: 1,
        why: '§6.2.2 ASN.1：accessType ENUMERATED {non3GPP}，OPTIONAL——只有这一个值。出现即告知 UE 这次来话来自非 3GPP 域（如不可信 WLAN 侧注册的来电）。',
        ref: '6.2.2'
      }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
