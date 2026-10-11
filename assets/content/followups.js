/* ============================================================
   assets/content/followups.js — 面试追问链（v6 块 3）
   按 qid 挂 {levels:[{q, a, ref}]}；q.id 规则与 interview.js 题池一致
   （m.id + ':q' + 序号 / ':d' + 序号）。
   红线：每层参考答案只用对应课程已审计文本（narr/failures.deep/quiz.why）
   的压缩改写，ref 沿用原题条款锚或同模块已审计条款——不写任何新论断；
   某题找不到已审计支撑层就宁缺毋滥，不凑数。
   ============================================================ */
(function (g) {
  'use strict';
  var F = {
    /* ---- 测量域（M3/M42） ---- */
    'm3:q0': { levels: [
      { q: '把 A3 进入条件逐项拆开：Mn/Ofn/Ocn/Hys/Mp/Ofp/Ocp/Off 各是什么户口？',
        a: '进入 A3-1：**Mn + Ofn + Ocn − Hys > Mp + Ofp + Ocp + Off**。Ofn/Ocn 是邻区侧测量对象级与小区级偏移（cellIndividualOffset 没配就置零），Ofp/Ocp 是 SpCell 侧同款，且 Mp、Ofp、Ocp 固定取 SpCell；Off 是事件级 a3-Offset。量纲：Mn/Mp 随量走（RSRP dBm、RSRQ/SINR dB），六个 offset 恒 dB。',
        ref: '38.331#5.5.4.4' },
      { q: 'A3 的定义和 CHO（条件切换）是什么关系？',
        a: '条款 NOTE 2 明文：**A3 的定义同样适用于 CondEvent A3**——CHO 执行条件用的就是这组不等式；配置侧一个 measId 恰好连一个触发配置，执行条件最多挂 2 个 measId。触发后的执行戏（T304、随机接入、失败回退）是切换的来回，见 M5。',
        ref: '38.331#5.5.4.4' }
    ] },
    'm3:q1': { levels: [
      { q: '写出滤波递推式；k=0 意味着什么？',
        a: '**Fn = (1−a)·Fn−1 + a·Mn**——新采样只拿 a 那一小份，方向不许背反；a = 1/2^(k/4)；首样 F0 = M1。**k=0 时 a=1——滤波输出恒等于最新采样，等效不滤波**（NOTE 1 明文）。k 越大 → a 越小 → 曲线越钝 → 触发越保守。',
        ref: '38.331#5.5.3.2' },
      { q: '滤波在哪个域做？k 的刻度假设了什么采样节奏？',
        a: 'NOTE 2：**滤波在与判据评估相同的域做——对数量域滤波对数量**，别在 mW 域平均再换回 dBm。采样率适配条款：k 的刻度假设采样周期等于 X ms——X 是 38.133 定义的一个同频 L1 测量周期（非 DRX），随频段范围不同；输入速率变了要调整滤波器保持时间特性不变。',
        ref: '38.331#5.5.3.2' }
    ] },
    'm3:d1': { levels: [
      { q: '进入条件撑满 TTT 后，首触发 UE 具体做什么？',
        a: 'TTT 满了而账本里还没有该 measId 的条目——**建 VarMeasReportList 条目、numberOfReportsSent 清零、小区写进 cellsTriggeredList、立即启动上报流程（§5.5.5）**；配了 useT312 且 T310 在跑的话顺手点火 T312（快速失败通道）。',
        ref: '38.331#5.5.4.1' },
      { q: '离开侧怎么处理？reportOnLeave 有什么防抖限制？',
        a: '离开条件对名单内某小区满足并撑过 TTT——把它移出 cellsTriggeredList；**reportOnLeave 配了就补发一条离开报告**，但 numberOfTriggeringCells 场景下只有真给该小区发过报告才许补报；名单空了就删报告条目、停周期定时器。',
        ref: '38.331#5.5.4.1' }
    ] },
    'm42:d7': { levels: [
      { q: '缩放因子的取值域被谁钉死？“放大延迟”存在吗？',
        a: '被 §6.3.2 SpeedStateScaleFactors 枚举钉死：**只有 oDot25/oDot5/oDot75/lDot0 = 0.25/0.5/0.75/1.0**——缩放只会把 TTT 缩短或保持原值，**“放大延迟”在规范里不存在**；条款只规定“乘”这个动作，取哪一档才是网络的责任。没配 speedStatePars 则整条机制不存在，TTT 原值跑。',
        ref: '38.331#5.5.7.1' },
      { q: '38.133 那边的“高速”钩子是什么？',
        a: '38.133 各时序表里另有 highSpeedMeasFlag-r16 类高速标志——按 SMTC 周期是否 ≤40ms 把表中系数 M2 在 1.5 与 1 之间切换，相当于给采样要求也挂了速度档。两头合起来才是完整的高速故事：**38.331 缩 TTT、38.133 缩采样系数，时序表本身不随速度整体折半**。',
        ref: '38.331#5.5.7.1' }
    ] },
    /* ---- 切换域（M4） ---- */
    'm4:q0': { levels: [
      { q: 'T304 超时的后果是什么？',
        a: 'T304 只管“搬家执行”这一段：收到含 reconfigurationWithSync 的重配（HO 命令）时启动，新小区随机接入成功（竞争解决完成）时停止。**超时即切换失败——回滚：发起重建或回 IDLE 重选**。',
        ref: '38.331#5.3.5.5.2' },
      { q: 'CHO 执行时 T304 何时起跑？它和 T316 是什么关系？',
        a: 'CHO：**执行条件满足时才起跑同一枚 T304**——候选配置下发时不起跑。T316 是 MR-DC 里 MCG 失败的快速救援沙漏，**与 CHO 无关——CHO 的执行限时就是 T304**；elapsedTimeT316 进失败报告（VarRLF-Report）取证。',
        ref: '38.331#5.3.5.13.5' }
    ] },
    'm4:d6': { levels: [
      { q: 'CHO 的执行条件用哪组判据？配置挂在哪？',
        a: '执行条件就是 A3/A5 这组事件不等式（**A3 的定义同样适用于 CondEvent A3**——条款 NOTE 2）。配置经 RRCReconfiguration 的 conditionalReconfiguration-r16 下发：一个 measId 恰好连一个触发配置、执行条件最多挂 2 个 measId。网络只负责“备好钥匙+定好锁”，UE 盯着锁眼——先开哪把锁 UE 说了算。',
        ref: '38.331#5.5.1' },
      { q: 'CHO 省掉的时延具体是哪一段？',
        a: '传统切换是“上报-等命令”的往返：测量报告 → 源站决策 → 站间准备 → 命令下发；CHO 把决策前置到执行条件——**条件满足即刻执行，省掉的是上报到命令之间的往返时延**（候选配置已提前备在 UE 手里）。',
        ref: '38.331#5.5.1' }
    ] },
    'm4:d7': { levels: [
      { q: '普通切换 T304 超时与 CHO T304 超时，UE 的退路有何不同？',
        a: '普通切换超时即失败：判 RLF 走重建或回 IDLE。**CHO 的容错设计：多套候选就是多条退路——重建的选小区阶段还能按 §5.3.7.3 复用候选配置**；这也是“一次备几套”的成本换收益。',
        ref: '38.331#5.3.7.3' },
      { q: '重建请求里 UE 怎么自证身份？失败过程记在哪？',
        a: '重建请求带 **shortMAC-I 防伪章**（源站链路完整性缩略）供目标站验证身份；失败详情记进 **VarRLF-Report** 供网络取证——这就是“求救也带防伪章”的设计。',
        ref: '38.331#5.3.7.3' }
    ] },
    /* ---- 接入域（M6/接入课） ---- */
    'ma:d5': { levels: [
      { q: '安全激活后，哪些被压着的事“批量放行”？',
        a: '安全一激活（consider AS security to be activated），被卡着的事批量放行：**SRB2、DRB 从此可以建立；测量报告的评估与发送也从此合法；切换执行同样以安全激活为铁闸**。协议把安全设计成分水岭——之前明文最小集，之后才铺开干正事。',
        ref: '38.331#5.3.5.6' },
      { q: '为什么安全命令本身只做完整性、不加密？',
        a: 'SMC 到达时加密还没生效——**用已通电的完整性，锁住还没通电的加密配置**。SecurityModeComplete 因此明文（unciphered）发送但带完整性保护：完整性立即生效（含 Complete 自己），加密“过程结束后”生效——两个生效时刻的时序差是本流程最精妙的细节。',
        ref: '38.331#5.3.4.3' }
    ] },
    /* ---- INACTIVE 域（M6/INACTIVE 课） ---- */
    'm6:q0': { levels: [
      { q: '“档案保留”具体保留在哪、保留了什么？',
        a: '基站留档案（UE 上下文存锚点）、核心网 NG 连接不拆；UE 侧持有 I-RNTI 与 suspendConfig，在 RNA 内监听 RAN 寻呼。**将来唤醒只需几条信令，不必重走鉴权+安全+建承载的全家桶**——这是 5G 为“突发小包”业务省信令的核心设计。',
        ref: '38.331#4.2.1' },
      { q: 'INACTIVE 的固有软肋是什么？',
        a: '省信令的代价是状态可能失联：RAN 寻呼复用 PCCH/P-RNTI 机制，“尽力而为”——UE 错过 PO 就听不到；而**上下文保留时长是硬约束**（内存不是保险箱），一直叫不醒你，锚点迟早清档案，INACTIVE 退化成 IDLE。',
        ref: '38.331#5.3.2' }
    ] },
    'm6:d3': { levels: [
      { q: '挂起 SRB1、丢密钥、记标志——三个动作各自的道理？',
        a: 'Reject 的 resume 分支**不回 IDLE 而是留在 INACTIVE**：挂起 SRB1（还能再恢复）；丢弃当前密钥组（安全上必须——密钥可能已暴露/过期，下次恢复用 suspendConfig 链重新推）；纯 RNA 更新触发的设 pendingRNA-Update=true（位置没报成，下次一定补）。状态留不留、密钥丢不丢、标志记不记——三个细节全是面试盲区。',
        ref: '38.331#5.3.15.2' },
      { q: 'Reject 带 waitTime 时 UE 额外受限什么？',
        a: '可带 waitTime——**T302 期间接入受限**：恢复延迟，等冷静期到点再试；与接入课被拒后的冷静期是同一枚表。',
        ref: '38.331#5.3.15.2' }
    ] },
    /* ---- 双连接域（M8/EN-DC 课） ---- */
    'm8:q2': { levels: [
      { q: 'SCG 失败后 UE 的具体动作链？',
        a: '**挂起 SCG 全部承载传输、复位 SCG MAC、停 SCG 的 T304**——然后经锚上报 SCG 失败信息，主站决定删腿或换腿（删腿=复位 SCG MAC、逐 RLC 承载释放）。故障隔离：辅腿失败不拖累主腿，用户感知只是速度回落。',
        ref: '38.331#5.7.3.2' },
      { q: '哪些事由算 SCG 失败？上报走哪条腿？',
        a: 'SCG 无线链路失败、同步重配失败、SRB3 完整性校验失败等（§5.7.3.1 上报事由族）；SCG failure information **全程走 LTE 锚的 SRB1**——NSA 控制面永远是“单笔账”，这就是“锚”字的含义。',
        ref: '38.331#5.7.3.1' }
    ] },
    /* ---- 安全域（M/安全课） ---- */
    'ms:q0': { levels: [
      { q: '背一遍全树一行版；每段派生用什么保证一致？',
        a: '**K → CK/IK → KAUSF（归属锚）→ KSEAF（拜访锚）→ KAMF（当家）→ 分两支：NAS 支 KNASint/KNASenc + AS 支 KgNB → KRRCint/KRRCenc/KUPint/KUPenc**。每段有专属 KDF（Annex A 系列），输入参数顺序钉死、改一位全链作废；中间不许跳级、不许换序——口诀“根钥 K、归属 A、拜访 S、当家 A、站上 g”。',
        ref: '33.501#6.2.1' },
      { q: 'KgNB 之后怎么“换手”？',
        a: 'KgNB 不是终身制：切换时**有未用 {NH,NCC} 就纵向，否则源站从当前 KgNB 横向推衍**（Xn 切换两可，初建后第一切必横向）；N2 切换纵向（AMF 发新 {NH,NCC}）；重建立凭 NCC 换新。不把一把钥匙用到底，是为前向隔离。',
        ref: '33.501#6.9.2.3.2' }
    ] },
    'ms:d4': { levels: [
      { q: '为什么“初建后第一切必横向”？',
        a: 'AMF 初建连接时不把 NH 发给 gNB——手头没有未用的 {NH,NCC}，所以第一次切换源站只能从当前 KgNB **水平推衍**；此后 AMF 逐次下发 NH 链，Xn 切换源站有未用 {NH,NCC} 就 **shall 走纵向**（§6.9.2.3.2 原文）。',
        ref: '33.501#6.9.2.1.1' },
      { q: 'N2 切换为什么天然纵向？',
        a: 'N2 切换经 AMF 中转，**AMF 随路径下发新 {NH,NCC}**——NCC 翻页，目标站直接拿到纵向衍生的材料；Xn 则两可（有未用 NH 就纵向，否则横向）。NH 链的意义：**破一个站不回溯历史**。',
        ref: '33.501#6.9.2.3.2' }
    ] },
    /* ---- 空闲态域（M/空闲态课） ---- */
    'my:d4': { levels: [
      { q: '向低优先级重选为什么是“双条件”？',
        a: '**旧家先烂、新家再好，双锁防手痒**：服务小区 Squal < ThreshServing,LowQ 且目标 Squal > ThreshX,LowQ（无 threshServingLowQ 用 Srxlev 版），并持续 TreselectionRAT。向高优先级则只看候选人自己够不够格（ThreshX,HighQ/HighP + 1 秒驻留锁）——高优先级永远压过低优先级。',
        ref: '38.304#5.2.4.5' },
      { q: '移动状态怎么改写这些判据？',
        a: '判为高速 → **Qhyst 加上 sf-High、Treselection 乘以 sf-High**（中速 sf-Medium 同款），缩放后向上取整到最近秒——跑得越快搬家越谨慎；**折返（重选回刚离开的小区）不计入**移动状态计数。',
        ref: '38.304#5.2.4.3.1' }
    ] },
    'my:d2': { levels: [
      { q: '专用优先级的四个删除时机？',
        a: '**进入不同的 RRC 状态；T320 到期；收到 cellReselectionPriorities 缺席的 RRCRelease；应 NAS 请求执行 PLMN/SNPN 选择**。另外跨 RAT 移动时专用优先级连同 T320 剩余有效期一起继承。',
        ref: '38.304#5.2.4.1' },
      { q: '跨 RAT 之间有“等优先级”这回事吗？',
        a: 'NOTE 2 明文：**跨 RAT 之间不支持等优先级**——等优先级只在 NR 频率间成立（等优先级的 NR 异频按同频排名规则处理）。',
        ref: '38.304#5.2.4.1' }
    ] },
    /* ---- 系统消息域（M2 课，v8 块 2 扩容） ---- */
    'm1:q0': { levels: [
      { q: 'SIB1 是什么地位？NR 与 LTE 在这点上的关键差异是什么？',
        a: 'SIB1 属**"最小系统信息"，永远周期广播、不可关闭**（160ms 周期，DL-SCH）；可以按需请求获取的是其他 SIB——**"SIB1 必广播、其他按需"是 NR 与 LTE 的关键差异**。',
        ref: '38.331#5.2.1' },
      { q: 'MIB 和 SIB1 是什么关系？',
        a: '条款明文：MIB 包含 **acquire SIB1 所需的参数**——它是找 SIB1 的钥匙；小区重选参数不在 MIB 里，在 SIB1 里。开机先读 MIB，才有资格读 SIB1，再谈一切。',
        ref: '38.331#5.2.1' }
    ] },
    /* ---- 寻呼域（M3 课，v8 块 2 扩容） ---- */
    'm2:q0': { levels: [
      { q: '寻呼为什么必须走 PCCH + P-RNTI，而不是专用信令？',
        a: '待机 UE 的收音机平时彻底关着、也没有专属信道——寻呼只能走**公共广播信道 PCCH、公共的 P-RNTI 加扰调度**；被叫方没有"先被找到"之前，任何专用通道都无从谈起。信令、信道、标识三层对上（PCCH/P-RNTI/寻呼消息）才算过关。',
        ref: '38.331#6.2.2' },
      { q: 'UE 解到 P-RNTI 调度，但 Paging 消息里没有点名名单，说明什么？',
        a: '这条消息是**捎信不是点名**：要么系统广播要更新（systemInfoModification），要么有告警（etwsAndCmas）——**谁都不用动、不用发起连接**，重新读一遍广播即可；带名单的寻呼才轮到"喊到的自己下楼"。',
        ref: '38.331#6.2.2' }
    ] },
    /* ---- 承载域（M6 课，v8 块 2 扩容） ---- */
    'm5:q0': { levels: [
      { q: 'SRB2 与 DRB 为什么必须等安全激活之后才建立？',
        a: '它们承载的 NAS 信令与用户数据**必须加密传输**（§4.2.2），而加密的钥匙（KUPenc 等）依赖安全激活才生效——**顺序是结构不是建议**。对比：SRB1/MIB/PRACH 在安全激活前就存在，因为流程本身还得靠它们往前走。',
        ref: '38.331#4.2.2' },
      { q: 'UE 无法执行重配置时，正确行为是什么？',
        a: '**不执行、保留原配置、以重建自证**——走 §5.3.5.8.2 分支：继续用重配前的旧配置、发起连接重建（cause=reconfigurationFailure）。Uu 口没有重配失败的回程消息，说"不"的出口只有旧配置继续用+重建；配置是原子性承诺，执行一半比不执行更危险。',
        ref: '38.331#5.3.5.8.2' }
    ] },
    /* ---- 安全线域（M8 课，v8 块 2 扩容） ---- */
    'm7:q0': { levels: [
      { q: 'SecurityModeCommand 消息本身为什么只能完整性保护、不能加密？',
        a: '加密此时尚未激活，**只能用已生效的完整性保护锁住配置防篡改**（§5.3.4.3）——这是"先有鸡"问题的协议解法：用已通电的完整性，锁住还没通电的加密。完整性 immediate 生效（含 Complete 自己），加密"过程结束后"生效——两个开关精确卡在这条消息两侧。',
        ref: '38.331#5.3.4.3' },
      { q: 'SMC 校验失败时 UE 怎么办？为什么不能含糊？',
        a: '失败分支明文：**继续沿用先前的配置 + 发 SecurityModeFailure**——安全零妥协。条款把"失败即回退旧配置"写成死规矩，因为完整性校验失败的命令内容已不可信——你不知道它被改成了什么，把不可信当可信执行才是最大的漏洞。',
        ref: '38.331#5.3.4.3' }
    ] },
    /* ---- NAS 注册域（M13 课，v8 块 2 扩容） ---- */
    'mn:q0': { levels: [
      { q: 'SUCI 的隐私设计核心是什么？',
        a: '**真实身份号（SUPI）加密成一张只有归属运营商能解开的隐形名片**——5G 由此做到身份号码不再在空中明文裸奔；解密钥匙在归属网，伪基站截到了也用不了。',
        ref: '24.501#9.11.3.4' },
      { q: '注册时身份链的第一优先是什么？SUCI 什么时候才出场？',
        a: '§5.5.1.2.2 身份链：映射 GUTI（4G 互操作）之后**第一优先是"同 PLMN 发的 5G-GUTI"——旧档案号能让 AMF 直取上下文**；**SUCI 只在没有任何可用 GUTI 时出场**。先报旧档案号、实在没有才亮隐形名片。',
        ref: '24.501#5.5.1.2.2' }
    ] },
    'mn:q2': { levels: [
      { q: 'REGISTRATION ACCEPT 的"落户"信息里，哪件必带？',
        a: '必带的只有一件：**一片"随便走动无需重新报到"的管辖区域（TA list）**——条款明文 AMF 应（shall）指配并带上；**档案号更新（新 5G-GUTI）与切片批文（allowed NSSAI）都是可带（may）**——有更新才随信发。手机收好，从此是正式住户。',
        ref: '24.501#5.5.1.2.4' },
      { q: 'TA list 与注册区的关系为什么这样设计？',
        a: '管辖区域给大一点，UE 在里面走动就**不必频繁报到**——代价是寻呼范围跟着变大：TA list 越大，注册更新越省、寻呼要喊的范围越广——这是一对交换，网络在"省信令"与"喊得广"之间挑平衡点。',
        ref: '24.501#5.5.1.2.4' }
    ] },
    /* ---- 5GC 域（M14 课，v8 块 2 扩容） ---- */
    'mg:q0': { levels: [
      { q: 'N4 接口连接哪两个 NF？它跑的是什么面？',
        a: '**SMF（会话管家）↔ UPF（搬运大队）**——控制面对用户面下安装指令：转发规则、QoS、缓冲与上报全经 N4 下发。前台 AMF 管接入和移动、SMF 管业务、UPF 管数据转发——N4 就是管家指挥搬运工的专线。',
        ref: '23.501#4.2.7' },
      { q: 'PDU 会话建立请求随身带哪三件证件？',
        a: '**自己新生成的会话编号（PDU Session ID）、切片身份（S-NSSAI，点名要走哪类服务通道）、要去的网络名（DNN）**——托基站捎给核心网柜台；缺了切片或网络名，AMF 按用户档案补默认值，补完才找承办的 SMF。',
        ref: '23.502#4.3.2.2.1' }
    ] },
    /* ---- MAC 域（M12 课，v8 块 2 扩容） ---- */
    'mc:q0': { levels: [
      { q: 'RA-RNTI 由什么决定？为什么撞车纠纷源于它？',
        a: 'RA-RNTI **按 PRACH 时机的时频位置算出**——手机按"自己刚才在哪个时间频率位置喊的"算出收信钥匙，在规定窗口守着公共控制信道拿它试锁。**同一位置喊的人算出同一把钥匙**——这正是撞车纠纷的根源：撞了同一条前导的人，网络只回一封信，人人都以为喊中了自己。',
        ref: '38.321#5.1.3' },
      { q: '前导编号为什么是"真抽签"而不是轮询？',
        a: '§5.1.2 原文 "select a Random Access Preamble randomly with equal probability"——**等概率随机**。轮询会让重试的 UE 集中在同一编号上加剧碰撞；**随机抓阄把冲突概率均摊**，配合退避（BI）才能把撞车率压下去。',
        ref: '38.321#5.1.2' }
    ] },
    'mc:q1': { levels: [
      { q: 'MAC RAR 里装了哪三样关键信息？',
        a: '基站的回信是一捆：既有"人太多都缓缓"的告示（BI），也有给喊中者的正式批复——**批复里装着对表指令（TA）、发言座位（UL Grant）和一张临时工牌（TC-RNTI）**；每封按喊话编号挂牌，手机只认领号码对得上的那封。',
        ref: '38.321#6.2.3' },
      { q: '2-step RA 回退到 4-step 时，进度会清零吗？',
        a: '§5.1.4a：fallbackRAR 与 MAC RAR **字段完全同构**（TA/UL Grant/TC-RNTI），UE 转四步剧本且 **MSGA buffer 搬运不重组——快转慢不清零进度**。',
        ref: '38.321#5.1.4a' }
    ] },
    /* ---- 用户面域（M15 课，v8 块 2 扩容） ---- */
    'mp:q0': { levels: [
      { q: 'PDCP COUNT 怎么做到"永不回绕"？它喂给了谁？',
        a: '包头流水号位数有限、迟早转圈重演——**账本里把转过的圈数记在高位，与低位流水号合成一个永不回绕的大计数**；号码永不复用，**往后加密防伪全拿它当原料**（COUNT 进密码学，重放的老包一验就穿）。',
        ref: '38.323#6.3.5' },
      { q: 'PDCP 处理顺序为什么是"先完整性、后加密"？',
        a: '§5.2.1 顺序：associate COUNT→ROHC→integrity→ciphering。**完整性保护的对象是"压缩后的 PDU 头+数据"——先压后保，接收端验的章与发的才一致**；顺序反了，中间任何一次变换都会让章对不上。',
        ref: '38.323#5.2.1' }
    ] },
    /* ---- MRO 域（M43 新课，v8 块 2 扩容） ---- */
    'm43:q0': { levels: [
      { q: 'Too Early/Too Late/Wrong Cell 三分类的分界参数怎么读？',
        a: '三分法=**UE reported timer（自上次切换初始化或 CHO/LTM 执行到失败）与配置门限（如 Tstore_UE_cntxt）比大小，再叠加重建落点**：timer 缺失或大于门限=Too Late；小于门限且回源=Too Early；小于门限到第三小区=Wrong Cell——时间×落点两个维度叉乘出判词。',
        ref: '38.300#15.5.2.2.2' },
      { q: '「successful handover」在判责口径里指什么？',
        a: '条款明文：**refers to the UE state, namely the successful completion of the RA procedure**——看 UE 是否完成随机接入，不是看某条完成消息；RACH-less LTM 另看 UE 判定网络收到首个上行数据。',
        ref: '38.300#15.5.2.2.2' }
    ] },
    'm43:q1': { levels: [
      { q: 'UE 保存 RLF Report 的期限与放行条件分别是什么？',
        a: '**至多 48 小时或被网络取走——自检出连接失败起算**（最近一份、LTE/NR 各自算）；放行靠 **PLMN 门禁**：当前 RPLMN 在 EPLMN 列表内或正是失败当时 RPLMN（SNPN 用等价列表）——门禁不过，库里有货也不交。',
        ref: '38.300#15.5.2.2.1' },
      { q: 'rlf-Report 送达网络后，UE 怎么处理档案？',
        a: '**送达确认后即丢弃——一次性消费**（§5.7.10.3 的 discard 句）；网络没取到（超期、PLMN 不符、送达失败）就没有第二次机会，除非再发生一次新失败。取证要趁早，48 小时是保管上限不是送达承诺。',
        ref: '38.331#5.7.10.3' }
    ] },
    'm43:q3': { levels: [
      { q: 'Unnecessary HO report 的成立条件为什么这么苛刻？',
        a: '**测量期内收集的所有 UE 测量报告中，源系统小区全部超过指示的门限**（RSRP/RSRQ 或/和 SINR）——报告全在"够用线"上=NR 一直够用=当初白切了。三条否决句同样硬：测量期内切回 5GS 则作废、无 NR 小区可纳入不发、被向 5GS 以外系统的切换打断不发。',
        ref: '38.300#15.5.2.3' },
      { q: 'Voice Fallback 触发的切换切出又切回，算乒乓吗？',
        a: '**不算——表注明文：Inter-system mobility triggered by Voice Fallback is not considered as inter-system ping-pong**。语音回落是业务驱动的合法搬家，统计口径必须先剔除；回落自身的失败另归"跨系统语音回落移动性失败"单列（RLF Report 带 voice fallback 指示）。',
        ref: '38.300#15.5.2.4' }
    ] },
    'm43:q4': { levels: [
      { q: 'SHR（成功切换报告）的触发判据是什么思路？',
        a: '**比率判据——"赢是赢了，赢得太悬"**：T304/T310 已计时与配值之比超过 successHO-Config 的 thresholdPercentage 门限、或执行切换那一刻 T312 在跑且比率超标、或 DAPS 切换中源 PCell 在 T304 期间 RLF（sourceDAPS-FailureReporting=true）——四选一即存 VarSuccessHO-Report。',
        ref: '38.331#5.7.10.6' },
      { q: 'SHR 取到之后回到谁手里？',
        a: '**谁的配置触发的报告，回到谁手里去复盘**：触发为 T310/T312 的 NR 内 SHR 可经 Xn 的 ACCESS AND MOBILITY INDICATION（或 NG 双向 RAN 配置转移）转回报告中记为源小区的节点；取到者既非源也非目标时，转给配置了该 SHR 触发的节点。',
        ref: '38.300#15.5.2.7' }
    ] },
    'm43:d2': { levels: [
      { q: 'MRO 自动调参的"缰绳"是哪两根？缺了会怎样？',
        a: 'OAM 提供两个控制参数：**Handover Trigger 最大偏移**（相对 OAM 默认工作点允许的最大绝对偏离）与**两次 Handover Trigger 变更的最小时间间隔**（管稳定性与收敛）。缺了最短间隔，参数就在两个值之间来回摆不收敛；缺了偏移上限，自动调整可以飘出人工网优认可的圈。',
        ref: '38.300#15.5.2.5' },
      { q: '判责用的 Tstore_UE_cntxt 归谁管？',
        a: '条款明文：为支撑移动性优化的检测解法，**Tstore_UE_cntxt 应（shall）可由 OAM 系统配置**——判责的标尺刻度也在 OAM 手里。全部自动修改 + 判责门限三样（标尺、圈、节奏）都归 OAM，自优化的一切自由都是圈内的自由。',
        ref: '38.300#15.5.2.5' }
    ] },
    'm45:q0': { levels: [
      { q: '接通率掉了，第一步怎么把「拒绝」和「失败」分开？',
        a: '**看 RRCReject 与 T300 到期的占比**（分桶为工程口径，非 3GPP 条款）：收到 RRCReject 且带 waitTime→UE 起 T302 被门禁——这是网络主动限流（准入/拥塞），不是无线故障；T300 到期→无线面失败（reset MAC、记 VarConnEstFailReport；SIB1 带 connEstFailureControl 且同小区连败达 connEstFailCount 次才触发 connEstFailOffset 临时退避）。拒绝型看时段特征（忙时集中），失败型看 RACH 与覆盖。',
        ref: '38.331#5.3.15.2' }
    ] },
    'm45:q1': { levels: [
      { q: 'T300 到期后，UE 手里留下什么证据？',
        a: '**VarConnEstFailReport 一本账**：PLMN、失败小区全局标识/TAC、小区级与 SSB 级 RSRP/RSRQ、按重选排序的邻区测量（至多每频点 6 同频+3 异频+3 异 RAT）、perRAInfoList（按 §5.7.10.5 填）；支持多份的 UE 挪进 VarConnEstFailReportList 再写新条目；**48 小时可弃**，等 UEInformationRequest 的 connEstFailReportReq 来取——取证要趁早。',
        ref: '38.331#5.3.3.7' }
    ] },
    'm45:q2': { levels: [
      { q: '掉线率分解的第一刀切在哪？',
        a: '**先看 RLF 频次、再看重建成功率**（分桶为工程口径，非 3GPP 条款）：N310 连续 out-of-sync 起 T310（§5.3.10.1），T310 到期/连接态随机接入问题/RLC 达最大重传才判 RLF（§5.3.10.3）；N311 连续 in-sync 还能静默恢复——失步次数远多于 RLF 次数。重建成=连接保住（用户面短暂中断），不成回 IDLE（release cause「RRC connection failure」）才是真掉线。',
        ref: '38.331#5.3.10.3' },
      { q: '重建请求为什么带「PCI+C-RNTI+shortMAC-I」三样？',
        a: '**网络靠这三样找回并验证 UE context**：physCellId 定位源小区、c-RNTI 对号上下文、shortMAC-I（MAC-I 的低 16 位）计算比对验真；reestablishmentCause 三值（reconfigurationFailure/handoverFailure/otherFailure）。重建发到哪个小区同时决定 M43 三分类判责的归属——同一台 UE、同一场失败，落点不同责任站就不同。',
        ref: '38.331#5.3.7.4' }
    ] },
    'm45:q3': { levels: [
      { q: '「切换成功率」里的"成功"，协议上怎么判？',
        a: '**四条 KPI 链里唯一一个"成功"被条款写死的**（KPI 本身为工程口径，非 3GPP 条款）：38.300 §15.5.2.2.2 明文 the "successful handover" refers to the UE state, namely the successful completion of the RA procedure——看 **UE 是否完成目标小区随机接入**，不看网络收没收到 ReconfigurationComplete。切换失败的协议现场因此在目标侧 RA：T304 到期（reconfiguration with sync 失败，§5.3.5.8.3）就是最常见的现场。',
        ref: '38.300#15.5.2.2.2' },
      { q: 'T304 怎么起表、到期意味着什么？',
        a: '**执行 reconfiguration with sync 时、以其中的 t304 为目标 SpCell 起表**（§5.3.5.5.2 实文：start timer T304 for the corresponding SpCell with the timer value set to t304, as included in the reconfigurationWithSync）；到期=切换失败：释放 rach-ConfigDedicated 专用前导、revert 回源 PCell 配置、失败信息存 VarRLF-Report（这只 T304 不是 T311 期间小区选择起的才存）、发 §5.3.7 重建。成功切换后 T304 的 elapsed/configured 比率超门限还会触发 SHR（§5.7.10.6）——成功也要复盘。',
        ref: '38.331#5.3.5.5.2' }
    ] },
    'm45:d2': { levels: [
      { q: '面试官追问：四条 KPI 链的排障优先级怎么排？',
        a: '**果→因→证一张图**（分桶与优先级为工程口径，非 3GPP 条款）：**接通率**先分拒绝型/失败型（RRCReject 的 T302 门禁 vs T300 到期——失败型再分 RACH 段取 RA Report、T300 段取 connEstFailReport）→**掉线率**拆 RLF 频次与重建成功率（rlf-Report+mobilityHistory，48h/PLMN 门禁先过）→**切换率**按三分类分桶（HANDOVER REPORT 判责+SHR 抓"成功但险些失败"）→**干扰覆盖**两套口径并看（网元聚合 vs UE 抽样不能互代）。指标告诉你哪里疼，报告告诉你为什么疼。',
        ref: '38.331#5.7.10.3' }
    ] },
    'm45:d7': { levels: [
      { q: '话统干扰统计和 UE 测量报告，为什么不能互相替代？',
        a: '**两套口径**（工程口径，非 3GPP 条款）：话统是网元聚合统计（全网全样本、网管自带时间聚合、看统计面）；UE 测量是触发式抽样（过判据才报、L3 滤波 Fn=(1−a)Fn−1+a·Mn 之后才进判据）——**样本集、采样点、平滑方式都不同**。测量报告是前哨、话统是事后账；排查覆盖问题先看失败前有没有报丧式的测量事件，再对掉线记录，时序对上了才好下结论。',
        ref: '38.331#5.5.3.2' }
    ] },
    'm46:q0': { levels: [
      { q: 'CHO 的执行条件在配置上受哪些限制？为什么说判据机器还是 M42 那台？',
        a: '条款三连（38.300 §9.2.3.4.1）：执行条件由**一或两个触发条件**构成（CHO 事件 A3/A5）、**只支持单一 RS 类型**、单个候选小区**最多两种触发量**（如 RSRP+RSRQ、RSRP+SINR）。判据本体与测量事件同源——A3/A5 的不等式、L3 滤波、TTT 全是 M42 讲过的那台机器，CHO 只是把它挂在候选头上让 UE 自己判。',
        ref: '38.300#9.2.3.4.1' },
      { q: 'CHO 候选配置为什么不能带 DAPS？',
        a: '表注 1a 明文（38.300 §9.2.3.4.2）：候选小区配置**不得含 DAPS 切换配置**。机理上两条路线相反——DAPS 切了还保持源站并发收发（M5 讲过），CHO 从开始向目标同步起就**不再监视源小区**（§9.2.3.4.1，先断后接）；配置级互斥把口子封死。',
        ref: '38.300#9.2.3.4.2' }
    ] },
    'm46:q2': { levels: [
      { q: 'CHO 候选配置存在 UE 的哪个变量里？收到之后先干什么？',
        a: '存 **VarConditionalReconfig**（38.331 §5.3.5.13.1）——目标 SpCell 参数在 condRRCReconfig 里；收货按字段分派：带移除清单走移除程序、带增改清单走增改程序——**增改的尾句要求改完立即进入条件重配置评估**（§5.3.5.13.3；移除程序无此指令）。',
        ref: '38.331#5.3.5.13.1' },
      { q: '候选清单是「一锤子买卖」吗？网络怎么改写？',
        a: '不是。**增改清单**（§5.3.5.13.3）有同 id 则替换执行条件/候选配置、无则新增，改完立即再评估；**移除清单**（§5.3.5.13.2）按 condReconfigId 删表项——表注：带了不属于当前配置的 id 不算消息错误（宽容移除）；38.300 侧表注同样明文 CHO 配置之后源站还可再发重配置——候选增删改是常态运维。',
        ref: '38.331#5.3.5.13.3' }
    ] },
    'm46:q3': { levels: [
      { q: 'CHO 配置了却从没执行、连接失败——判什么？',
        a: '归 **Too Late**（CHO 场景判词 Too Late CHO Execution）：38.300 §15.5.2.2.2 检测原文把「配置了 CHO/LTM 但执行未发起」列进 Too Late 判据，UE reported timer 缺失或大于门限（如 Tstore_UE_cntxt）即落网；timer 在 CHO 场景量的是自 CHO 执行到失败的时长——从没执行自然量不出。',
        ref: '38.300#15.5.2.2.2' },
      { q: '执行了但失败呢？三分类怎么换名？',
        a: '换名句明文：Too Late/Too Early Handover 与 Handover to Wrong Cell 在 CHO 场景即指 **Too Late CHO Execution、Too Early CHO Execution、CHO Execution to Wrong Cell**（带候选 SCG 的 CHO 再换一套名）；Wrong Cell 检测还点名「UE 尝试 CHO 恢复的小区」。判责文书怎么流（Failure Indication/HANDOVER REPORT/NG 配置转移）M43 讲过。',
        ref: '38.300#15.5.2.2.2' }
    ] },
    'm46:d5': { levels: [
      { q: '两个候选小区同时满足执行条件，谁拍板选哪个？',
        a: 'UE 自己选（38.331 §5.3.5.13.5）：多个 triggered cell 选一个、多对 triggered PCell+PSCell 选一对；表注明文选哪个属 **UE 实现行为**，例如考虑波束与波束质量。协议不规定算法——网络事后从 Complete 的落点才知道 UE 选了谁。',
        ref: '38.331#5.3.5.13.5' },
      { q: '选定之后的执行动作是什么？CHO 的执行窗口与普通切换差在哪？',
        a: '应用选中小区存储的 condRRCReconfig 并按 5.3.5.3 动作生效（§5.3.5.13.5）——**不等网络再发任何命令**，这就是「条件满足即执行」；从开始向目标同步起 UE 不再监视源小区（§9.2.3.4.1）。普通切换（M5）是网络命令一到就切，CHO 是 UE 条件满足自己掐表出发。',
        ref: '38.300#9.2.3.4.2' }
    ] },
    'm47:q0': { levels: [
      { q: 'LTM 跟 CHO 共用「先备候选、后触发执行」的骨架，到底差在哪？',
        a: '差在**拍板信令与触发权**（M47）：CHO 条件满足后 UE 应用存储的 RRCReconfiguration——拍板权在 UE、信令载体仍是 RRC；LTM 由 gNB 发 **MAC CE 捎带的 cell switch 命令**拍板（38.300 §9.2.3.5.1 定义：gNB 收 L1/L3 测量报告后可据此改服务小区，命令指名事先 RRC 备好下发的候选配置）——拍板信令从 L3 降到 L2。候选的准备方式两者一样，都走 RRC 提前下发。',
        ref: '38.300#9.2.3.5.1' },
      { q: 'UE 侧配了执行条件，网络还能直接命令吗？两路怎么并存？',
        a: '能。表注 000 明文（38.331 §5.3.5.18.6）：对**已配执行条件的候选**，网络也可以直接发 LTM cell switch command MAC CE——UE 条件评估与网络命令**两路并存**，网络保留一锤定音权；执行程序入口三个：下层指示、T311 运行期间小区选择、执行条件满足（§5.3.5.18.6）——三个入口汇到同一套执行动作。',
        ref: '38.331#5.3.5.18.6' }
    ] },
    'm47:q2': { levels: [
      { q: 'RACH-less LTM 凭什么不跑随机接入？上行资源哪来？',
        a: '凭**有效 TA 在手**（38.300 §9.2.3.5.1）：只要有有效 TA 值，UE 收到 cell switch 命令就做 RACH-less；接入目标用 **configured grant**——候选配置里携带，UE 选命令所指波束关联的时机——或 **dynamic grant**，命令可带 SR 配置 ID（SR 配置+PUCCH 资源）；红线一条：RACH-less 完成前无有效 PUCCH 资源时不得触发随机接入。',
        ref: '38.300#9.2.3.5.1' },
      { q: '候选小区的 TA 从哪来？有效性谁保证？',
        a: '三来源（38.300 §9.2.3.5.1）：①命令直接捎带（网络可不经 early TA 直接给）；②PDCCH order 触发 CFRA——UE 向候选发前导但**不收 RAR**（少断源站数据），TA 由候选侧算好、经源站在命令里捎带；③UE-based TA 测量——RRC 配置、UE 自测、时机 UE 实现定。定时器侧：UE **不维护候选 TA 定时器**，TA 有效性靠**网络实现保证**（§9.2.3.5.2 步 4b）。',
        ref: '38.300#9.2.3.5.1' }
    ] },
    'm47:d6': { levels: [
      { q: 'RACH-less LTM 的「执行成功」怎么判？跟 RACH-based 差在哪？',
        a: '判据分两态（38.300 §9.2.3.5.2 步 8）：RACH-based=RA 成功完成；**RACH-less=UE 判定网络已成功收到其首个 UL 数据**——不看 RAR（RACH-less 根本没跑 RA）、不看 T304 停转，看首包上行落地。',
        ref: '38.300#9.2.3.5.2' },
      { q: '这个成功口径怎么接进判责？LTM 场景的判词叫什么？',
        a: '判责定义直接吸收（38.300 §15.5.2.2.2）：MCG LTM cell switch 场景的「成功切换」=RACH-based 的 RA 成功、或 RACH-less 的首个 UL 数据被网络收到——判 Too Early/Wrong Cell 都踩在这块地基上；timer 两支量法=自上次切换初始化、或自 **CHO/LTM 执行**到失败；换名句明文：**Too Late LTM cell switch、Too Early LTM cell switch、LTM cell switch to Wrong Cell**。文书链 M43 讲过。',
        ref: '38.300#15.5.2.2.2' }
    ] }
  };
  g.RRC_FOLLOWUPS = {
    get: function (qid) { return Object.prototype.hasOwnProperty.call(F, qid) ? F[qid] : null; },
    keys: function () { return Object.keys(F); },
    size: function () { return Object.keys(F).length; },
    levelTotal: function () { var n = 0; Object.keys(F).forEach(function (k) { n += F[k].levels.length; }); return n; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
