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
    ] },
    'm48:q0': { levels: [
      { q: 'LTE 的连接建立跟 NR 差在哪？',
        a: '骨架同构（M1/M48）：都是三段式、Request 都走 CCCH、都靠随机接入送 Msg3。差异在**消息名与细节**：LTE 叫 **RRCConnectionRequest/RRCConnectionSetup/RRCConnectionSetupComplete**（NR 是 RRCSetupRequest 系，少个 Connection 前缀）；LTE 的 Request 带 **establishmentCause** 与 **ue-Identity**（上层给 S-TMSI 就用、没给就抽随机数）——IE 枚举在 36.331 §6。面试时两套名字一口气对上，就是「两代差在哪」最省力的答案。',
        ref: '36.331#5.3.3.1' },
      { q: 'T300 到期 UE 具体记什么账？',
        a: '记进 **VarConnEstFailReport**（36.331 §5.3.3.6）：失败小区全局标识、失败时刻本小区 RSRP/RSRQ、邻区测量，还专门记随机接入三件——**numberOfPreamblesSent**（前导发了几根）、**contentionDetected**（有没有撞竞争）、**maxTxPowerReached**（最后一根是否顶到最大功率）。支持临时惩罚的 UE，同一小区连续 **connEstFailCount** 次到期后按 connEstFailOffset 给该小区挂一段时期的 Qoffsettemp——抬高重选门槛缓解反复失败。重建时 Complete 带 rlf-InfoAvailable 等标志——账本信息在场即可用标志告知网络。',
        ref: '36.331#5.3.3.6' }
    ] },
    'm48:q1': { levels: [
      { q: 'LTE 安全激活为什么是「完整性先行、加密随后」？',
        a: '因为 SecurityModeCommand 自身就是第一块试金石（36.331 §5.3.4.3）：UE 按命令带的算法派生 **KRRCint** 先验**命令自身的完整性**——命令本身还是明文，验不过就说明链路上有假货。验过才派生 KRRCenc/KUPenc 并**立即启用完整性保护**（含 SecurityModeComplete 自身），**加密等过程完成后生效**——原文 except for the SecurityModeComplete message which is sent unciphered，Complete 本身不加密。',
        ref: '36.331#5.3.4.3' },
      { q: '安全激活失败连接会断吗？UE 怎么办？',
        a: '不断。36.331 §5.3.4.3：校验不过——**继续使用收到命令之前的旧配置**（既不启用完整性也不启用加密）、发 **SecurityModeFailure** 收场——SRB1 还在明文跑，连接保持。条款**未设重试**，补救靠网络重新发起安全激活（工程口径）。集中失败要查算法配置与密钥同步，偶发常见于覆盖边缘的丢包乱序。',
        ref: '36.331#5.3.4.3' }
    ] },
    'm48:q3': { levels: [
      { q: '重建请求里 UE 带什么「对账暗号」？',
        a: '三件（36.331 §5.3.7.4）：**C-RNTI**（源 PCell 用的，切换失败场景）或触发重建小区的、**physCellId**、**shortMAC-I**——原文=**MAC-I 的低 16 位**，用源 PCell 的 KRRCint 密钥与完整性算法算出。这是 UE 的对账暗号：目标站拿它与备好的上下文对账——对不上（小区没备好上下文）就回 Reject（m48f5 的场景）。',
        ref: '36.331#5.3.7.4' },
      { q: '为什么说重建成功只回到「够说话的最小态」？',
        a: '因为只救回 **SRB1**（36.331 §5.3.7.1 原句：SRB1 operation resumes while the operation of other radio bearers remains suspended）——SRB2 和全部 DRB 挂起，用户面断着。要恢复业务得等**重建后的第一条 RRCConnectionReconfiguration**（36.331 §5.3.5.3：第一条重配 resume SRB2 与挂起的 DRB）；安全侧按 nextHopChainingCount 更新 KeNB、重派生三把钥匙、算法不变（§5.3.7.5）——「最小态」+一次重配，重建的恢复闭环就这两步。',
        ref: '36.331#5.3.7.1' }
    ] },
    'm49:q0': { levels: [
      { q: 'NTN 的上行同步为什么有保质期？',
        a: '因为卫星在动，网络广播的辅助信息只在一段时间内可信。RRC_CONNECTED 的 UE 收 SIB19 就要 **start 或重启 T430**（38.331 §5.2.2.4.21）：定时值=该小区 **ntn-UlSyncValidityDuration**（s5..s900 共 16 档），起点=该小区 **epochTime** 指示的子帧。到期（§5.2.2.6）UE 告知下层 UL 同步丢失→重取 SIB19→成功后告知同步恢复——上行同步不是稳态，是一份要不断续期的账。',
        ref: '38.331#5.2.2.4.21' },
      { q: '这套机制跟地面网的上行同步差在哪？',
        a: '地面网里 TA 配好基本不变，同步是「配好就一直在」的稳态；NTN 里服务链路传播延迟随卫星运动持续变化，广播的公共 TA、星历都只在 **epochTime 之后的有效期**内可用——所以 38.331 给它配了整套账本机制：保质期（T430/ntn-UlSyncValidityDuration）+时间基准（epochTime）+重取动作（表注：UE 应在有效期结束前重取 SIB19）。切换/重配到新小区还要按**新小区**的 NTN-Config 重启 T430（§5.3.5.5.2）——账本跟着小区走。',
        ref: '38.331#5.2.2.6' }
    ] },
    'm49:q2': { levels: [
      { q: '卫星切换跟地面切换差在哪？',
        a: '最大差异：**预告式 vs 命令式**。地面切换是测量事件触发、网络下 RRC 切换命令（M5/M48）；NTN 的卫星切换（SatSwitchWithReSync，38.331 §5.7.19）由 SIB19 **广播预告**：t-Service 指示小区将停止覆盖当前区域的时刻，UE 到点**自主执行四动作**——停 T430、告知下层 UL 同步丢失、向新卫星服务的 SpCell 同步 DL、按新 NTN-Config 重启 T430。全程没有 RRC 切换消息。',
        ref: '38.331#5.7.19' },
      { q: 't-ServiceStart 到 t-Service 这段窗口是干嘛的？',
        a: '给**软切换**用的（§5.7.19 原文）：支持 soft satellite switch with resynchronization 的 UE，在 t-ServiceStart 到 t-Service 之间就开始获取新卫星 SpCell 的 DL 同步——提前把新卫星下行锁住，t-Service 一到即换。硬切换语义下这就是「先听新台、到点换台」。表注明文：卫星切换后 UE 应重取 SIB19（时机 UE 实现）——新卫星的账本要重新领。',
        ref: '38.331#5.7.19' }
    ] },
    'm49:q3': { levels: [
      { q: 'RedCap 终端接入时怎么让网络认出来？',
        a: '接入第一拍就亮身份（38.331 §5.7.10.5）：RA 由 **RedCap/SDT/Msg3 重复/Msg1 重复/eRedCap/切片**等特征触发时，UE 设 **triggeredFeatureCombination** 指示全部触发特征——网络按特征组合划分专用前导分区（feature combination-specific RACH 配置）。实际用的组合与触发组合不同时，另记 usedFeatureCombination 如实上报。',
        ref: '38.331#5.7.10.5' },
      { q: '小区不就绪时 RedCap 连驻留都进不去？',
        a: '对。SIB1 接收动作里就有一道门（38.331 §5.2.2.4.2）：RedCap UE 发现 **intraFreqReselectionRedCap 缺失**、或只支持半双工 FDD 的 UE 发现 **halfDuplexRedCapAllowed 缺失**——按 38.304 判小区禁用并同频重选（eRedCap 对应 intraFreqReselection-eRedCap 一族；旗标在位再看 cellBarredRedCap1Rx/2Rx 按 Rx 分支评估）。组合场景另有关卡：SDT 五条件里 (e)RedCap 专属的 ncd-SSB-RedCapInitialBWP-SDT（§5.3.13.1b）——轻量终端在重选、接入、小数据三处都有专属规则。',
        ref: '38.331#5.2.2.4.2' }
    ] },
    'm50:q0': { levels: [
      { q: 'PC5 侧的 RRC 重配跟 Uu 侧差在哪？',
        a: '骨架像，对等体换了：Uu 侧重配的对端是网络，PC5 侧 **RRCReconfigurationSidelink 的对端是对等 UE**（SL-SRB3 承载，PC5-S 安全建立后才发）。发起方组好消息要 **per destination 起 T400**（§5.8.9.1.2）；接收方逐列表执行增删改，**sl-DRX-ConfigUC-PC5 要 UE 接受才配下层**，无法遵从（部分）就继续用旧配置并回 RRCReconfigurationFailureSidelink（§5.8.9.1.3）。',
        ref: '38.331#5.8.9.1.3' },
      { q: '收不到响应怎么办？UE 配置从哪来？',
        a: 'T400 到期就是 SL RLF 判据之一（§5.8.9.3）——重配悬而未决按直连断链处理。配置源是**三态规则**（§5.8.9.1.1 原文）：RRC_CONNECTED 用 RRCReconfiguration 给的参数，RRC_IDLE/INACTIVE 用系统信息（SIB12），其他场景用 SidelinkPreconfigNR 预配置；**拿到新状态的配置之后才应用新配置，之前继续用旧的**——切换瞬间不空窗。',
        ref: '38.331#5.8.9.1.1' }
    ] },
    'm50:q2': { levels: [
      { q: 'Sidelink 同步为什么要有优先组？',
        a: '因为直连里「跟谁对时」的候选源天生多元：**gNB 广播、GNSS、别的 UE（SyncRef UE）**都在发同步信息——没有排序就会各跟各的钟，时序一漂 HARQ 与 DRX 全错位。38.331 的解法是两层：先按 **sl-SyncPriority** 定大方向（gnbEnb=基站优先选小区、gnss=GNSS 可靠就选它），再在候选之间按**优先组**排座次（如 gnbEnb 组：inCoverage=true 的 UE→false→GNSS→SLSSID 0→其他）（§5.8.6.2/§5.8.6.2a）。',
        ref: '38.331#5.8.6.2' },
      { q: '什么时候会换同步源？',
        a: '重选评估三条（§5.8.6.2b）：候选 PSBCH-RSRP 超最小要求之余 **sl-SyncRefMinHyst** 且属更高优先组；或同组最强候选超当前 **syncRefDiffHyst**；或 GNSS 变可靠。反向兜底：当前 SyncRef UE 低于最小要求、GNSS 变不可靠、所选小区检测不到——视为未选中，重跑全搜索；无候选时按 §5.8.5.3 从 OoC 集随机选 SLSSID（排除 336/337）当临时灯塔。',
        ref: '38.331#5.8.6.2b' }
    ] },
    'm50:q3': { levels: [
      { q: 'SL RLF 判什么？',
        a: '五判据（§5.8.9.3，全是对特定 destination）：SL RLC 实体指示**达最大重传次数**；**T400 到期**；MAC 指示 **HARQ-based SL RLF**；PDCP 指示 **SL-SRB2 或 SL-SRB3 完整性校验失败**；MAC 指示**所有 RB set 持续 LBT 失败**。命中任一即视为该 destination 的 sidelink radio link failure——注意它是**按连接（destination）判**的，不是全 UE 级。',
        ref: '38.331#5.8.9.3' },
      { q: '判完之后做什么？',
        a: '一条善后链走到底：释放该 destination 的 SL DRB→SL SRB→PC5 Relay RLC 信道→丢弃其 SL 配置→重置 sidelink specific MAC→**视为该 PC5-RRC 连接已释放**→向上层指示（PC5 unavailable）。RRC_CONNECTED 的 UE 还要经 SidelinkUEInformationNR 把 **sl-Failure=rlf** 报给网络（§5.8.3.3）——直连断了，网络要知情。',
        ref: '38.331#5.8.3.3' }
    ] },
    'm51:q0': { levels: [
      { q: '广播的配置为什么放系统信息，不走专有信令？',
        a: '因为广播是小区级群发、**没有订阅账本**——网络不知道谁在听——没有订阅账可查，桌牌（MCCH 的 MBSBroadcastConfiguration）面向全体广播；收 MCCH 所需的配置同样在系统信息里（SIB1 与 SIB20，§5.9.1.1 原文）。专有信令逐条点名是单播/多播 CONNECTED 侧的心智（对照 m51 的 mrb-ToAddModList）。',
        ref: '38.331#5.9.1.1' },
      { q: '不在服务区还白收 MCCH 吗？',
        a: '规范留了口子：表注明文（§5.9.2.2），UE 可用 USD 的 Target Service Area 或 SIB27 的 ISA 避免在 MBS 服务区外获取 MCCH——怎么做由 UE 实现定。',
        ref: '38.331#5.9.2.2' }
    ] },
    'm51:q2': { levels: [
      { q: '广播 MRB 和单播 DRB 的配置来源差在哪？',
        a: '单播 DRB 由网络专有 RRCReconfiguration 逐条配置（M6 的机器）；广播 MRB 的 PDCP/RLC 配置来自 MCCH 桌牌里的 **MRB-InfoBroadcast**（§5.9.3.3 原文），而且适用状态宽到 RRC_IDLE/INACTIVE/CONNECTED 三态（§5.9.3.1）——零专有信令，读到桌牌就自己动手建。',
        ref: '38.331#5.9.3.3' },
      { q: '已配置的广播 MRB 要改配置怎么办？',
        a: '表注明文（§5.9.3.1）：已配置 MRB 的修改怎么做**由 UE 实现定**——规范不规定统一路径。工程常见解：重读 MCCH（获取是全量覆盖、无增量），按新配置做相应调整；MCCH 变更本身有修改周期+位图通知兜底（§5.9.1.3）。',
        ref: '38.331#5.9.3.1' }
    ] },
    'm51:q4': { levels: [
      { q: '为什么多播位图的 MSB 是 reserved？',
        a: '对照着看就通：广播的 MSB=1 表示**新 MBS 业务开始**（§5.9.1.3）——广播面向全小区，新业务上线要广而告之；多播只伺候 **join 过的会话**（§5.10.1.1），加入在上层完成，RRC 侧没有「新业务开始」的通知语义，MSB 自然保留（§5.10.1.3 原文：The MSB in the 2-bit bitmap is reserved）。',
        ref: '38.331#5.10.1.3' },
      { q: '漏收变更通知会怎样？',
        a: '广播/多播同款风险，两处表注都写明由 **UE 实现定**（§5.9.2.2/§5.10.2.2）。兜底在机制本身：修改周期内 MCCH 按重复周期可多次重发（§5.9.1.3），而获取是**全量覆盖、无增量**——任何时候重读一次就拿到最新配置，不会拿到半新半旧的账。',
        ref: '38.331#5.9.1.3' }
    ] },
    'm52:q0': { levels: [
      { q: '为什么 IAB-donor 也拆成 CU 和 DU？',
        a: '因为 donor 本来就是一台 gNB——「能够服务 IAB-node 的 gNB 命名 IAB-donor」（§6.1.3 原文），gNB 的 CU/DU 分离架构原样继承（M41 的地基）：IAB-node 的 F1 终结在 donor-CU、无线侧锚在 donor-DU；CP/UP 分离部署时 donor 甚至可由 donor-CU-CP+多个 CU-UP+多个 DU 组成（§6.1.3 原文）。',
        ref: '38.401#6.1.3' },
      { q: 'IAB-node 为什么不干脆叫「小 gNB」？',
        a: '它比 gNB 少一块「自己的回程」——回程借道接入链（MT 侧），所以规范叫它 node（节点）：一节 MT 一节 DU 的双角色。而 gNB-DU/gNB-CU/UE 上下文的全部功能对 IAB-DU/IAB-donor-CU/IAB-MT「同样适用，除非另有说明」（§6.1.3 原文三连）——复用存量规范、只在例外处改笔，不重写。',
        ref: '38.401#6.1.3' }
    ] },
    'm52:q2': { levels: [
      { q: 'IAB-MT 怎么向 donor 要 IP？',
        a: '走 IAB Other Information 过程（§5.7.12.1 原文）：请求侧按协议填数量字段——iab-IPv4-AddressNumReq/iab-IPv6-AddressNumReq/iab-IPv6-AddressPrefixReq（消息字段明文）；地址按 all traffic/F1-U/F1-C/non-F1 四类用途各请求各的（§8.9.13），donor-CU 可再发起 TNL Address Allocation 从 donor-DU 取号，最后经 RRC 下发。',
        ref: '38.331#5.7.12.1' },
      { q: 'EN-DC/NR-DC 下这条消息走哪条车道？',
        a: '§5.7.12.3 原文分支：**SRB3 配了就走 SRB3**；没配则 (NG)EN-DC 嵌入 E-UTRA RRC 的 ULInformationTransferMRDC（36.331），NR-DC 朝 SN 的场景嵌入 NR RRC 的 ULInformationTransferMRDC（5.7.2a.3）；SA 场景直接递交底层——车道选错消息就出不了门（故障面 m52f6）。',
        ref: '38.331#5.7.12.3' }
    ] },
    'm52:q4': { levels: [
      { q: 'boundary 节点诞生后，F1 流量怎么跟上？',
        a: '靠流量卸载（offload）：新 CU 先把 RRC 配置发给 IAB-MT——新 TNL 地址/新拓扑的 BAP 地址/默认 BH RLC channel 与 default BAP routing ID（§8.17.4 步骤 14 原文转述），随后经 IAB Transport Migration Management 系列消息把流量逐批卸载到新路径（8.17.3.1 的 14-20 步）——F1 端点留在源 CU 不动，换的只是路。',
        ref: '38.401#8.17.4' },
      { q: '卸载过去的流量还能搬回来吗？',
        a: '能。课程 b3 的账本：卸载本身可逐批释放乃至全撤。全撤通道是反向切换——boundary IAB-MT 被切回初始 CU 后，其流量沿原路径重新路由（§8.17.4 原文）；逐批回收则经 IAB Transport Migration Management 系列按 traffic 申请释放（§8.17.3.1）。',
        ref: '38.401#8.17.4' }
    ] },
    'm53:q0': { levels: [
      { q: '中间六个域的顺序是什么？',
        a: '站内按「一条消息的完整旅程」排组（player.js HUB_GROUPS 注释原文）：主线→空口信令（RRC）→接口运输→信封外层（NAS/核心网）→底层地基→横切对照——对应编号 02 RRC · 空口信令组、03 接口与用户面、04 NAS 与核心网、05 空口底层、06 安全与两代对照、07 业务与垂直（八域纵览在 M53 毕业课 g1）。',
        ref: '38.331#5.3.3.1' },
      { q: '为什么岗位域挂在最后？',
        a: '出口定位：jobs 域 desc 原文「与求职岗位最短路径的课程……全站收官」，与主线域「全站的地图，也是所有课的前置」一头一尾——中间六域是一条消息的旅程，岗位域是旅程的归宿（M53 毕业课整门讲这个归宿：地图、路径、岗位、检验四幕）。',
        ref: '38.331#5.3.3.1' }
    ] },
    'm53:q3': { levels: [
      { q: '「六层各问一句」，每句具体问什么？',
        a: 'mau 课方法论原文：L1 问失步计数到几了（N310）、MAC 问上行资源还申请得到吗（SR/BSR）、RLC 问重传到第几次了（RETX_COUNT）、PDCP 问账本（COUNT）写到哪了、RRC 问定时器（T310/T311/T301）走到哪了、NAS 问 5GMM 状态机还剩什么（M53 毕业课 c1 的取证清单同源）。',
        ref: '38.321#5.4.4' },
      { q: 'RRC 判死只有 T310 到期一条路吗？',
        a: '不是。mau 课盘点 §5.3.10.3 的死因谱系共六条触发线：T310 到期、T312 到期、MCG MAC 上报随机接入问题、MCG RLC 上报最大重传已到、（IAB）BH RLF 指示、持续上行 LBT 失败——殊途同归 consider radio link failure to be detected；其中 RLC 那条（rlc-MaxNumRetx）可以不经过 T310 直接判死。',
        ref: '38.331#5.3.10' }
    ] },
    'm53:q4': { levels: [
      { q: '「骨架一句话」的反面教材长什么样？',
        a: '牛客系列点过的反面典型（niuke-11 原文）：把广播多播答成「就是一种群发」，或把它说成 LTE eMBMS 换个名字（两代是独立设计）——都是骨架没立住就抢细节；另一种反面是先讲细节再归纳，三步法第一步永远先给体系（M53 毕业课 c4）。',
        ref: '38.331#5.8.1' },
      { q: '「坐标系」怎么报才有效？',
        a: '报课程号与条款号：牛客原话「本站 M51 里有一张七行对照表」——答广播多播时点出「这套对照在 M51 课里」，面试官立刻知道你是系统学过不是刷帖刷来的；坐标系的本质是让知识显出编目（M53 毕业课 c4 的说法：报得出课程号与规范条款号，知识就是编了目的）。',
        ref: '38.331#5.8.1' }
    ] },
    'm54:q0': { levels: [
      { q: '这 48 小时从哪一刻起算，窗内网络怎么把账本取走？',
        a: '从 T330 到期那一刻起算（§5.5a.1.4 原文 48 hours after T330 expiry）。到期时配置 VarLogMeasConfig 已先行释放，数据 VarLogMeasReport 多活 48 小时等取回；取回通道是 UE information procedure（§5.5a.1.1 表注）——取数流程站内 m6-m8 课已讲，「allowed to」是许可不是义务，UE 可以留满 48 小时（M54 课 s3）。',
        ref: '38.331#5.5a.1.4' },
      { q: '内存满和收到新配置，对这条 48 小时窗各是什么影响？',
        a: '两条岔路：内存满=stop T330 并按 5.5a.1.4 到期同款处置（§5.5a.3.2 尾句）——保留窗照常起算，只是起点被提前；收到新配置（同 RAT 或另一 RAT）则完全不同——按 §5.5a.2.2 立即 release 两变量，旧数据直接清、没有保留窗（M54 课 s3/g5 的对照）。',
        ref: '38.331#5.5a.3.2' }
    ] },
    'm54:q4': { levels: [
      { q: '5.5c 的「停打」有几种原因，恢复条件各是什么？',
        a: '两种：事件型 eventA1/A2 的 leaving 条件满足→该配置停打，要等 entering 重新满足才再打（判定复用 5.5.4.2/5.5.4.3 的进入/离开条件，m3 课已讲）；内存满→暂停打点，不再满即恢复（§5.5c.3.2 尾句）——停打与暂停是两条语义，别与 5.5a 的「满=等效到期清配置」混谈（M54 课 n3/m54f6）。',
        ref: '38.331#5.5c.3.2' },
      { q: '怎么从 UE 账本上看出网侧打点断过档？',
        a: '看 timeGap 标记：同配置同小区两次记录的间隔超过 loggingPeriodicity（未配则按 csi-LoggedResourceConfig 的资源周期）时，UE set timeGap=true（§5.5c.3.2）——账本自己标出断档位置，排查连续性问题时先筛它（M54 课 n3）。',
        ref: '38.331#5.5c.3.2' }
    ] },
    'm55:q0': { levels: [
      { q: 'SRAP 头里认人的凭证是什么？两段链路用同一个号吗？',
        a: '**local Remote UE ID 同时出现在 PC5 SRAP 头与 Uu SRAP 头**——两段认人用同一个号。配置方向：Relay UE 由 gNB 配置该 ID；Remote UE 经 Uu RRC 消息获得（RRCSetup/RRCReconfiguration/RRCResume/RRCReestablishment）。防撞号是 gNB 的责任；换号经 RRCReconfiguration 下发，且独立于 PC5 单播链 L2 ID 更新流程——换号不必换链路地址（M55 课 a5）。',
        ref: '38.300#16.12.2.1' },
      { q: '为什么 SRB0 消息在直连 PC5 段没有 SRAP 头？',
        a: '§16.12.2.1 两条特例：转发 Remote UE 的 BCCH/PCCH 消息时 PC5 hop 无 SRAP 头；SRB0 消息在 Remote UE 与直连 Relay UE 之间的 PC5 hop 无 SRAP 头——而 Uu hop 与 Relay UE 之间的 PC5 hop 上 DL/UL 都有。深因：SRB0 走 RRCSetupRequest/RRCSetup 时 local Remote UE ID 尚未分配（建连后才配），直连段靠指定的 PC5 Relay RLC channel 认道即可——六步建连正是这么走通的（M55 课 a3/c1）。',
        ref: '38.300#16.12.2.1' }
    ] },
    'm55:q2': { levels: [
      { q: '中继选择与重选各用什么测量量？没数据在跑呢？',
        a: '两段判据：**选择**（与候选 parent 无单播 PC5 连接时）用 **SD-RSRP** 评朝候选的 PC5 链路质量；**重选**在 Relay→Remote 有 DL 数据传输时用 **SL-RSRP** 做触发评估，无数据传输时用 SL-RSRP 还是 SD-RSRP 由 UE 实现定。suitable=PC5 链路质量超（预）配置阈值+满足全部 AS 与高层判据；多 suitable 候选实现定挑一（M55 课 b3）。',
        ref: '38.300#16.12.4' },
      { q: 'Relay UE 换小区要通知谁？收通知的 UE 必须放链吗？',
        a: 'IDLE/INACTIVE 的 Relay UE 选了新小区→用 **PC5-RRC** 通知已连 Remote/child UE（切换、检测到 Uu/PC5 RLF、Uu RRC 建连或恢复失败、与父链 PC5 释放同样要通知）；RLF 触发的通知要等恢复动作成功后才发、恢复失败则发不发实现定；小区没变可省略。**收通知后放链还是保链由接收方实现定**——放链则触发 PC5 释放并可能小区/中继重选（M55 课 b4）。',
        ref: '38.300#16.12.4' }
    ] },
    'm55:q4': { levels: [
      { q: '中继场景的统一访问控制（UAC）谁做？中继会代做吗？',
        a: '§16.12.5.7 原文两句：The L2 U2N Remote UE performs unified access control——**Remote UE 自己做**统一访问控制；The L2 U2N Relay UE does not perform UAC for L2 U2N Remote UE\'s data——**Relay UE 不为 Remote UE 的数据做 UAC**。中继只是转发通道，准入判定的责任留在被中继者自己（M55 课 c3）。',
        ref: '38.300#16.12.5.7' },
      { q: 'Remote UE 挂在中继下时，移动注册更新按谁的时机走？',
        a: '按 **Relay UE 的服务小区**判：L2 U2N Remote UE 的 Mobility Registration Update/RNAU 基于 Relay UE 的服务小区；IDLE/INACTIVE 的 Remote UE 在服务小区变更（因 Relay 换小区）且**新小区在其配置 RNA/TA 之外**时才发起——中继带着走，出了注册区才重新报到（M55 课 c3）。',
        ref: '38.300#16.12.5.8' }
    ] },
    'm56:q0': { levels: [
      { q: 'MP Remote UE 的信令锚在哪条路径？为什么必须钉在那里？',
        a: '§16.21.3.1：split SRB1 与 SRB2 的 primary path **永远配置在 direct 路径**；非 split 的 SRB1/2 **只允许配在 direct**。因由=全局约束「PCell 恒在 direct」的延伸——信令锚在永远在的直连腿上，间接路全断也不影响 RRC 基本盘；间接口在信令面只是「多一条腿」而非「换主心骨」（M56 课 b2）。',
        ref: '38.300#16.21.3.1' },
      { q: '配了 split SRB1 复制时，路径添加的 Complete 为什么要双发？',
        a: '§16.21.3.1 step6：至少经 direct 发 RRCReconfigurationComplete；配了 split SRB1 with duplication 时**也经 indirect 路径再发一份**——重复信令顺带把「间接路已通」通报给 gNB：收到 indirect 版 Complete 即知中继段就绪（工程口径：不必额外探活）；且第 5 步可在 6a 后执行、与 6a 独立（M56 课 c1/b2）。',
        ref: '38.300#16.21.3.1' }
    ] },
    'm56:q2': { levels: [
      { q: 'N3C 间接路能像 PC5 那样反向补直连吗？一台 N3C Relay 能服务几台 Remote？',
        a: '都不能按直觉来：§16.21.3.1——**不允许**「N3C 间接路之上再加 direct 路径」（N3C 单向：只能在唯一 direct 路径上加 N3C 间接路）；且用 N3C 间接路的 MP Relay UE **被限制为只服务一台** L2 MP Remote UE——multi-Relay 形态要用多台 Relay 铺，每台 N3C Relay 各服务一台 Remote（M56 课 b1）。',
        ref: '38.300#16.21.3.1' },
      { q: 'N3C 形态的候选上报和 PC5 形态差在哪？',
        a: '差不只是字段：PC5 形态报候选 **MP Relay UE ID+小区 ID**（要建 PC5 链）；N3C 形态改经 **UEAssistanceInformation** 报 **C-RNTI+小区 ID**，且**表注限定：MP Remote 与 MP Relay 的安全连接建立后才可报**——字段反推动作，配置张冠李戴先查接口类型与安全前提（M56 课 b3）。',
        ref: '38.300#16.21.3.1' }
    ] },
    'm56:q4': { levels: [
      { q: '间接加流程里 PC5 形态的第 5 步做什么？N3C 形态为什么没有这一步？',
        a: '§16.21.3.1 step5：MP Remote UE 与目标 Relay **建立 PC5 单播链**；表注——**N3C 形态省略第 5 步**，N3C 间接路怎么建由 UE 实现定（预配/静态关系）；且第 5 步可在 6a 之后执行、与 6a 独立（M56 课 c1）。',
        ref: '38.300#16.21.3.1' },
      { q: '直接加流程的 RRCReconfiguration 为什么走间接路下发？',
        a: '§16.21.3.1 Figure -3 step4：此刻 MP Remote UE 还没有 direct 腿——gNB **经 Relay 转发**把重配（至少含 direct 路径添加配置的目标小区）发给 Remote；随后 Remote 同步目标小区下行+随机接入、**把目标小区配置为 PCell**，直连腿立起（M56 课 c3）。',
        ref: '38.300#16.21.3.1' }
    ] },
    'm57:q0': { levels: [
      { q: 'A-IoT 里 reader 的角色由谁担当？设备侧为什么不发周期信号？',
        a: '§16.23.1：本版本 **A-IoT reader 就是 gNB-reader**（reader 是 gNB 的一项能力，没有独立网元）；设备侧第一性原理是「**只要能量够就监听 R2D 消息**」——不主动扫网、不周期上报，一切从「听到 R2D」开始：发射的能量重活交给网络侧，标签只留最省电的监听动作（M57 课 a1）。',
        ref: '38.300#16.23.1' },
      { q: 'gNB、reader 与 A-IoT Area 三者的关系怎么记？',
        a: '§16.23.2 增补七条：**一台 gNB 服务一个或多个 reader**、**一台 reader 只属于一台 gNB**（归属唯一）；**Area 与 reader 多对多**——A-IoT Area 可包含同一或不同 gNB 的 reader、一个 reader 可映射多个 Area；而这一切映射**全靠 OAM 配置**下发（M57 课 a2）。',
        ref: '38.300#16.23.2' }
    ] },
    'm57:q2': { levels: [
      { q: 'CN 侧 AIOTF 直连与经 AMF 间接，差别在哪？',
        a: '§16.23.2：A-IoT CN 节点要么是 **AIOTF（直连）**要么是 **AMF（间接）**；间接形态下 **A-IoT 特定信息经 AMF 透明转发**——AMF 只当信使不改内容（抓包在 AMF 侧看不到 A-IoT 语义）；gNB 经 **OAM** 得知自己是否直连；本版本**不期望**直连与间接并存的部署（NOTE）（M57 课 a3）。',
        ref: '38.300#16.23.2' },
      { q: '本版本的 A-IoT 有哪些「不」要背？',
        a: '三条版本级边界（§16.23.2）：**gNB 之间无 A-IoT 特定通信**（Area 可跨 gNB，但 gNB 间不为 A-IoT 通话）、**不支持 split gNB 架构**、**直连+间接并列部署不期望**（NOTE）——都是「In this version」合同范围，不是实现选项；再加位置只承诺 **Reader ID 粒度**（M57 课 d1/d2）。',
        ref: '38.300#16.23.2' }
    ] },
    'm57:q4': { levels: [
      { q: 'CBRA 与 CFA 的关键区别是什么？',
        a: '§16.23.5.3：**CBRA**——在寻呼配置的 access occasion 里随机选一个、监听 Access Trigger、发 MSG1（Access Random ID）、等 MSG2 竞争解决（**含匹配频率索引且随机 ID 相同才算成功**）；**CFA**——用寻呼提供的**专用资源直发 D2R 上层数据、不监听 Access Trigger**（省掉整个竞争环节）；两者都由**寻呼消息的显式指示**选择（M57 课 c1）。',
        ref: '38.300#16.23.5.3' },
      { q: '访问与数据的失败重入各有哪几把钥匙？',
        a: '§16.23.5.3/5.4：CBRA 竞争失败后**应（shall）在收到带同一 transaction ID 的寻呼时重入**；数据侧两条线——收到**含本设备 AS ID 的 MSG2**→重传 D2R 上层数据；收到**含本设备 AS ID 的 NACK**→重入（待同事务寻呼）；无 SDU 场景另有一枚指示区分「尚不可用（reader 可 follow-up）/被忽略」（M57 课 c1/c2）。',
        ref: '38.300#16.23.5.4.1' }
    ] },
    'm58:q0': { levels: [
      { q: 'NR sidelink 的三种传输模式各承诺什么？',
        a: '§16.9.1：**单播**=一对 S/D L2 ID 间一条 **PC5-RRC 连接**+双向控制与用户流量+**HARQ 反馈**+发射功控+**RLC AM**+连接 RLF 检测；**组播**=组内流量收发+**HARQ 反馈**；**广播**=UE 间收发、**无反馈承诺**——三种关系形态（专线/群聊/大喇叭），选型先数承诺清单（M58 课 a1）。',
        ref: '38.300#16.9.1' },
      { q: 'PC5-RRC 连接与单播链路是什么关系？释放条件有哪些？',
        a: '§16.9.2.6：PC5-RRC 连接=一对 S/D L2 ID 的逻辑连接，**与 PC5 单播链路一一对应**（在单播链路建立后视为建立），一个 UE 可有多条；释放三条件——**不再感兴趣于侧行传输、宣告 PC5-RRC 连接的 SL RLF、或 L2 链路释放过程完成**（M58 课 a2）。',
        ref: '38.300#16.9.2.6' }
    ] },
    'm58:q2': { levels: [
      { q: 'Mode 1 与 Mode 2 的资源分配各有什么前提？',
        a: '§16.9.3.1：**调度式（Mode 1）**——UE 须 **RRC_CONNECTED**、由 **NG-RAN 调度**资源；**自主式（Mode 2）**——覆盖内（不论 RRC 状态）与覆盖外都能发、**UE 从资源池自主选**；基础面 NR sidelink **只在单载波上发**（M58 课 b1）。',
        ref: '38.300#16.9.3.1' },
      { q: 'Type 1 与 Type 2 配置授权的区别？',
        a: '§16.9.3.2：**Type 1=RRC 直接提供**配置授权（仅 NR sidelink）；**Type 2=RRC 定周期性、PDCCH 激活/去激活**（**SL-CS-RNTI** 寻址）；一个 UE 可同时有**多个配置授权被激活**；MCG 波束失败时可**续用 Type 1** 直到发起 RRC 重建立（M58 课 b2）。',
        ref: '38.300#16.9.3.2' }
    ] },
    'm58:q4': { levels: [
      { q: '单播 SL DRX 怎么谈成？谁有权定配置？',
        a: '§16.9.6.2 四拍：**RX 可发辅助信息**→**定配置**（idle/inactive/OOC 或连接态 Mode 2 的 TX 自定；**连接态 Mode 1 由 TX 的服务 gNB 定**）→**TX 把配置发给 RX**→**RX 可接受或拒绝**；**SL DRX MAC CE 只在单播引入**（M58 课 c3）。',
        ref: '38.300#16.9.6.2' },
      { q: 'IUC 两方案的差别与载体？',
        a: '§16.9.8：**scheme 1=优选/非优选资源**（触发两路：本 UE 条件/对端显式请求；载体 **MAC CE 与二阶 SCI 或仅 MAC CE**；显式请求两件全单播、条件触发的非优选集可三 cast）；**scheme 2=对端 SCI 资源上的预期/潜在冲突**（载体 **PSFCH**）——scheme 1 给地图、scheme 2 给警告（M58 课 d1）。',
        ref: '38.300#16.9.8' }
    ] },
    'm59:q0': { levels: [
      { q: '广播与多播两族服务的授权边界与可收状态差别是什么？',
        a: '§16.10.1：**广播**=同一内容给**地理区域内所有 UE**（区域内全授权），交付用 **broadcast session**，**三态全可收**（IDLE/INACTIVE/CONNECTED）；**多播**=给**专属的一组 UE**（非服务区内全授权），交付用 **multicast session**，**CONNECTED** 用 PTP 和/或 PTM、**INACTIVE** 用 PTM，且 CONNECTED 下 **HARQ 反馈/重传对两腿都可用**——「对区域喊」vs「对名单发」（M59 课 a1）。',
        ref: '38.300#16.10.1' },
      { q: '多播数据只能在哪些 RRC 状态接收？状态之间靠什么搬运？',
        a: '§16.10.5.2：多播**只能在 RRC_CONNECTED 或 RRC_INACTIVE 收**（没有 IDLE）；C→I 经 **RRCRelease**、I→C 经 **group notification 或 UE-specific paging**；组通知以 **P-RNTI** 寻址、paging 带 **MBS session ID**（不逐个页）；两者同至时**跟随 UE-specific paging 进 CONNECTED**（M59 课 b2）。',
        ref: '38.300#16.10.5.2' }
    ] },
    'm59:q2': { levels: [
      { q: '5GC 的两种 MBS 交付模式是什么？共享 NG-U 怎么用？',
        a: '§16.10.5.1：**5GC Shared MBS traffic delivery** 与 **5GC Individual MBS traffic delivery**；只要 gNB 支持 MBS，网络 **shall 用 Shared**——**首个 UE join 时**建 MBS Session Resource，gNB 触发 **Multicast Distribution Setup** 分配**共享 NG-U**（location dependent 服务按 **Area Session ID** 各建 NG-U）；传输选项 unicast 或 multicast transport（M59 课 b1）。',
        ref: '38.300#16.10.5.1' },
      { q: '多播无损切换的条件是什么？PDCP COUNT 值怎么保同步？',
        a: '§16.10.5.3.2：无损切换支持于「**目标小区 MRB 配了 PTP RLC AM**」（regardless of 源小区）——网络还须保证 **DL PDCP COUNT 同步与连续性**、可做数据转发与 PDCP status report；COUNT 同步两法（§16.10.5.1）：**DL MBS QFI Sequence Number 推导**（单流 shall、多流可取和）与 **Shared NG-U Termination**（M59 课 b3）。',
        ref: '38.300#16.10.5.3.2' }
    ] },
    'm59:q4': { levels: [
      { q: '广播的 MCCH 有哪四条原则？内容什么时候可以改？',
        a: '§16.10.6.2 四原则：**①目录**（列所有进行中会话+session ID/G-RNTI 调度/邻区，周期性传输窗口=重复周期+窗口时长+帧/时隙偏移）；**②修改**——**只在 modification period 边界改**+变更通知机制；**③NOTE**（盯 MCCH 的时机由 UE 实现按 USD 定）；**④同期获取**——收到变更通知在**同一修改周期内**取更新 MCCH（M59 课 c2）。',
        ref: '38.300#16.10.6.2' },
      { q: 'UE 在 RRC_INACTIVE 续收多播、换小区不断线，靠什么条件？',
        a: '§16.10.5.3.5：续收前提=**新小区 PTM 配置能从多播 MCCH 获得**（拿不到必须恢复连接去取）；**即使此前被指示停盯 G-RNTI**，重选后也要读新小区 MCCH；**RNA 内 cell PDCP COUNT 同步**指示时 UE **不初始化 PDCP 状态变量**（否则初始化）——配置可得性+计数连续性两根柱子（M59 课 b4）。',
        ref: '38.300#16.10.5.3.5' }
    ] },
    'm60:q0': { levels: [
      { q: '透明载荷与再生载荷的核心区别是什么？服务链路与馈电链路各指哪一段？',
        a: '§16.14.1：**透明载荷**把从 UE（经**服务链路 service link**）收到的无线协议**透明转发**给 NTN Gateway（经**馈电链路 feeder link**），反向亦然——gNB 在地面；**再生载荷**则**终结 Uu（经服务链路）、NG 与 Xn 接口**——gNB 上星；一个 Gateway 可服务多个载荷、一个载荷可被多个 Gateway 服务，再生载荷还可终结星间链路（M60 课 a1）。',
        ref: '38.300#16.14.1' },
      { q: '三种会动的小区型分别怎么定义？GSO 与 NGSO 各能提供哪些？',
        a: '§16.14.1：**Earth-fixed**=波束持续覆盖同一地理区域（GSO）；**Quasi-Earth-fixed**=一个区域覆盖有限时间、另一时段换区域（NGSO 可控波束）；**Earth-moving**=覆盖区在地表滑动（NGSO 固定/非可控波束）；组合：**NGSO 给 quasi 或 earth-moving，GSO 给 earth-fixed 或 quasi**（M60 课 a1）。',
        ref: '38.300#16.14.1' }
    ] },
    'm60:q2': { levels: [
      { q: 'NTN 调度与定时里有哪几笔偏移？调度偏移的条件与用途各是什么？',
        a: '§16.14.2.1：DL/UL 在**上行时间同步参考点 RP** 帧对齐（偏移 NTA,offset）；增强项=**Common TA**（定时偏移，约等于 RP 与载荷间 RTT）与两偏移——**调度偏移**须 **≥ 服务链路 RTT+Common TA**（给 UE 足够的 DL→UL 处理时间）、**K_mac**（≈RP 与 gNB 间 RTT；用于延迟 MAC CE 配置应用、UE-gNB RTT 估计、RAR/MsgB 窗口起点）（M60 课 b1）。',
        ref: '38.300#16.14.2.1' },
      { q: 'UE 在什么情况下绝不允许发送？预补偿由谁算、谁算哪一段多普勒？',
        a: '§16.14.2.2：UE **shall** 有**有效 GNSS 位置+星历+Common TA** 才连 NTN 小区；**若无有效 GNSS 位置和/或有效星历与 Common TA——shall not transmit until both are regained**；UE 自算 UE↔RP 的 RTT 并**自主预补偿 TTA**、自算**服务链路多普勒**并预补偿；**馈电链路多普勒与转发器频率误差留给网络实现**（M60 课 b2）。',
        ref: '38.300#16.14.2.2' }
    ] },
    'm60:q4': { levels: [
      { q: 'Mapped Cell ID 在哪些场景使用？哪些消息里期望的是 Uu Cell ID？',
        a: '§16.14.5：Mapped Cell ID 五处——**ULI（User Location Information）/NG 寻呼优化/Area of Interest/PWS/MBS 广播服务**（与轨道、服务链型无关）；而**NG/Xn 切换消息、Xn Setup、Xn NG-RAN Node Configuration Update** 里的 cell identity **expected to be Uu Cell ID**；映射配在 RAN 与 CN 两侧、**gNB 负责构建**，特殊 Mapped Cell ID/TAC 可指示服务 PLMN 国家之外的区域（M60 课 a2）。',
        ref: '38.300#16.14.5' },
      { q: '卫星重同步切换（satellite switch with re-synchronization）软/硬的同步时间窗差别？',
        a: '§16.14.3.2.3：透明载荷、准地对固定场景、同 SSB 频、同 gNB 下支持；靠维持同一 PCI 避免 L3 移动。**软切换**=UE **可在源卫星结束服务前**开始与目标卫星同步、切换时**不要求仍连着源**；**硬切换**=**只能等源卫星结束服务后**才开始同步；与 CHO 同时触发时由 UE 实现决定走哪个；重同步的随机接入可由**目标卫星的 PDCCH order** 触发（M60 课 c3）。',
        ref: '38.300#16.14.3.2.3' }
    ] },
    'm61:q0': { levels: [
      { q: '切片、SNPN、PNI-NPN 三种身份分别写在哪？',
        a: '§16.3.1：切片身份=**S-NSSAI**（必选 **SST 8 bit，0–255**+可选 **SD 24 bit**；NSSAI 至多 **8 个**，UE 不必支持超过 8 个）；§16.6.1：SNPN 身份=**PLMN ID+NID**，在 **SIB1** 广播，SNPN access mode 下只选/注册 SNPN；§16.7.1：PNI-NPN 的 **CAG identifier** 在 **SIB1** 广播，CAG-capable UE 每 PLMN 配 **Allowed CAG list+CAG-only indication**——三种身份分别写在 PLMN 内、PLMN 外与 PLMN 的封闭小区上（M61 课 h0/d1）。',
        ref: '38.300#16.3.1' },
      { q: 'UE 既没有 Temp ID、也没有 NSSAI 时，NG-RAN 怎么选 AMF？选路底表是什么？',
        a: '§16.3.4.2：两者都没有时，NG-RAN **routes the UE to one of the configured default AMF(s)**；无 Temp ID 时用 UE 在 RRC 连接建立提供的 NSSAI（**MSG3 之后**）。底表=**NG Setup Response** 里的 **supported S-NSSAI 列表**，可经 **AMF Configuration Update** 更新——三条选路按 Temp ID→NSSAI→默认 AMF 排序（M61 课 a2）。',
        ref: '38.300#16.3.4.2' }
    ] },
    'm61:q2': { levels: [
      { q: '切片的三档资源是什么？切片级 RACH 的 NSAG 门槛怎么记？',
        a: '§16.3.3.1：每张切片可分到 **shared、prioritized 或 dedicated** 无线资源（RRM 实现+SLA，28.541）；OAM 配不同配置集，RAN 按「哪套配置适用于这张切片」选择。切片级 RACH 可进 **SIB1** 并**关联 NSAG**：UE 考虑的 NSAG 没配 RACH 配置→不把它用于选切片级 RACH；**UE AS 未从 NAS 收到 RA 用 NSAG 信息→不应用切片级 RACH 配置**（M61 课 b1）。',
        ref: '38.300#16.3.3.1' },
      { q: '切片资源短缺时，RAN 有哪两种腾挪方法？',
        a: '§16.3.3.2：① **Multi-Carrier Resource Sharing**——在同一张切片可用、**频率不同且覆盖重叠**的载波上建**双连接或载波聚合**；② **Resource Repartitioning**——切片自有专用/优先资源不可用时，用**共享池和/或优先池**（优先池未使用资源按 28.541）。切片 RRM 策略由 **O&M** 配，RAN 上报 **RRM 策略利用率测量**，O&M 可据此更新配置（M61 课 b2）。',
        ref: '38.300#16.3.3.2' }
    ] },
    'm61:q4': { levels: [
      { q: 'SNPN 的 suitable 条件是什么？连接态切换怎么筛目标、谁做接入控制？',
        a: '§16.6.2.1：SNPN 接入模式 UE 只在**所选/已注册 SNPN 或等效 SNPN** 内重选，小区 suitable 需**广播的 PLMN 与 NID 都匹配**；§16.6.2.3：源节点**不把不支持服务 SNPN 或限制内等效 SNPN 的小区列为候选**，**目标节点执行接入控制**，不能接受则**切换失败并带适当 cause**（M61 课 c2）。',
        ref: '38.300#16.6.2.1' },
      { q: 'CAG-only indication 下的 suitable 规则是什么？onboarding UE 在什么时机发指示？',
        a: '§16.7.2.1：配了 **CAG-only indication** 后**只有 CAG Member Cell 才 suitable**（Member Cell=广播所选/注册/等效 PLMN ID 且 CAG ID 属于 **Allowed CAG list**）；非 suitable 小区仍可 acceptable（若对该 PLMN 配了 CAG-only）。§16.6.6：UE 打算 onboarding 时**在 RRC 连接建立期间向 gNB 发 onboarding request indication**，NG-RAN 按 **AMF 的 onboarding 支持能力**选合适 AMF（M61 课 d2/c4）。',
        ref: '38.300#16.7.2.1' }
    ] },
    'm62:q0': { levels: [
      { q: 'URLLC 的 LCP 限制能让 RRC 控制哪些维度？为什么说它是「发牌规则」而不是调度算法？',
        a: '§16.1.2：RRC 可把逻辑信道限制到**已配置小区、numerology、PUSCH 传输时长、CG 配置**的**子集**，并控制能否用 **Type 1 CG** 与带**物理优先级**的动态授权；因此可把**最大 SCS/最短 PUSCH 时长**留给 URLLC。RRC 还能给逻辑信道关联**不同 SR 配置**（更频繁的 SR 机会）——限制定「能上哪些资源」，选谁仍由调度器定（M62 课 a1）。',
        ref: '38.300#16.1.2' },
      { q: '包复制有哪些硬边界？SRB 和主 RLC 为什么特殊？',
        a: '§16.1.3：PDCP 控制 PDU **不复制**、永远交主 RLC；复制激活时**原始与副本不得同载波**；DRB 复制初态由 RRC 设、MAC CE 动态开关（DC 不分 MCG/SCG）；**SRB 复制恒激活、不可动态关**；**主 RLC 不可去激活**；辅 RLC 去激活**不重建不冲 HARQ**，PDCP 指示它丢弃复制 PDU（M62 课 a2/f1/f2）。',
        ref: '38.300#16.1.3' }
    ] },
    'm62:q2': { levels: [
      { q: 'PUCCH 小区切换的两种指示方式分别适用哪些 UCI？为什么 TDD 需要它？',
        a: '§16.1.8：为降低 **TDD** 下 URLLC 的 **HARQ-ACK 反馈时延**；每 PUCCH 组可配 **PUCCH sSCell**，发送小区由**高层半静态时域图样**或**调度 PUCCH 的 PDCCH 动态指示**确定；图样适用**全部 UCI 类型**，动态指示**只适用 HARQ 反馈**（M62 课 b1）。',
        ref: '38.300#16.1.8' },
      { q: '10 ns 时间参考怎么变成真正的同步？PDC 的两种执行侧区别是什么？',
        a: '§16.8.1：gNB 用单播/广播 RRC 发 5G 系统时间参考，粒度 **10 ns**、可带**不确定度**；UE 可用 **UAI** 表达偏好；**PDC 基于 RTT 或 TA**，可在 UE 或 gNB 侧执行，**UE 侧由 RRC 控制**；RTT 法用**一对 TRS/PRS 与 SRS** 的 **Rx-Tx 时间差**五步，两侧镜像——区别只在谁收测量、谁算 PDC（M62 课 b3）。',
        ref: '38.300#16.8.1' }
    ] },
    'm62:q4': { levels: [
      { q: 'TSCAI 告诉调度器什么？survival time 状态进入后做什么？',
        a: '§16.8.1：TSCAI 含**突发到达时间、周期、survival time**，可来自 CN（QoS 流建立时）或切换中另一 gNB；调度器用 **CG/SPS/动态授权**。上行周期业务用 CG 建立业务-CG 映射，gNB 用 **CS-RNTI** 的 CG 重传调度触发 survival time 状态；进入后**该 DRB 全部 RLC 激活做复制**；已激活 CA/DC 复制时，收到**任一活跃 LCH 的任一重传授权**即进入（M62 课 b4/f6）。',
        ref: '38.300#16.8.1' },
      { q: 'L4S 的 ECN 三件套是什么？TSN 传输网在 38.300 里有多重？',
        a: '§16.16：**SMF 请求 + gNB 回状态 + Xn 切换交底**对 gNB 标记/UPF 标记/拥塞上报**各来一遍**；CE 码点设在 **DL/UL SDAP SDU**，依据 **RFC 9330/9331/9332**。§16.17 只有一句：NG-RAN **may support** TSN enabled Transport Network，细节在 **23.501**——38.300 不定义传输网机制（M62 课 d1-d3/f5）。',
        ref: '38.300#16.16' }
    ] },
    'm63:q0': { levels: [
      { q: 'PWS 的寻呼监听为什么要分状态？告警寻呼与普通配置变更最大的区别是什么？',
        a: '§16.4：IDLE 与 INACTIVE（无 SDT 进行中）守**自己的寻呼时机**；CONNECTED 以及 INACTIVE 的 SDT 中听**任意寻呼时机**——网络知道连接态 UE 在哪、可随时叫。寻呼指示 **ETWS/CMAS** 时**triggers acquisition of system information (without delaying until the next modification period)**，即**不等修改周期**立刻取 SIB；ePWS 支持语言无关内容与无界面终端，KPAS/EU-Alert 复用 CMAS 的 AS 机制（M63 课 a1/a2/f1）。',
        ref: '38.300#16.4' },
      { q: 'ims-EmergencySupport 与 eCallOverIMS-Support 的共享环境条件为什么相反？受限态 UE 为什么要两个都看？',
        a: '§16.5.2：ims-EmergencySupport 在非共享环境看**任一 AMF**、共享环境看**至少一个 PLMN**；§16.5.3e：eCallOverIMS-Support 在共享环境要求**所有 PLMN** 都支持。受限服务态的 UE 判断 eCall 时必须**同时看**两个指示；非受限态才**只看** eCallOverIMS-Support（M63 课 a3/a4/f2）。',
        ref: '38.300#16.5.3e' }
    ] },
    'm63:q2': { levels: [
      { q: '灾难漫游的放行范围与负载控制分别由什么决定？为什么用 Access Identity 3？',
        a: '§16.11：小区广播**有灾难条件的 PLMN 列表**，灾难漫游**只在覆盖灾区范围的区域**提供；负载控制用**灾难漫游专用接入控制参数**，接入尝试基于 **Access Identity 3**——网络可把 AI 3 参数设得使这些 UE **更易被禁**，实现「放你进来但按容量收着放」（M63 课 b1/f3）。',
        ref: '38.300#16.11' },
      { q: 'RedCap 与 eRedCap 的接入门禁有哪些硬规则？IFRI 缺失意味着什么？',
        a: '§16.13.3：MSG3/MSGA 用**专用 LCID** 识别，**无论是否配置专用随机接入配置**；MSG1/MSGA 可选。1Rx/2Rx 与 HD-FDD 可分别经系统信息允许；**RedCap/eRedCap 专用 IFRI 缺失时不允许接入**（白名单门禁）；1Rx 对广播 RSRP 阈值应用偏置。§16.13.4/.5 另有测量放松与初始 BWP 锚 CD-SSB 的省电账（M63 课 b3/b4/f4）。',
        ref: '38.300#16.13.3' }
    ] },
    'm63:q4': { levels: [
      { q: 'Aerial UE 的干扰检测为什么会抑制后续报告？飞行路径更新由哪些条件触发？',
        a: '§16.18.5：干扰检测用 A3/A4/A5/AxHy；触发小区列表**仍≥配置数量**时**不再发更多报告**，除非配置 **reportOnLeave**（列表本身仍更新）。§16.18.6：NG-RAN 可**基于或不基于** UE 的「有航路信息」指示请求航路；航路=3D 航点（37.355），可带时间戳；配置**距离/时间阈值**且任一航点满足，或**新增航点/未来航点被删除**时，UE 指示有更新（M63 课 c3/f5）。',
        ref: '38.300#16.18.5' },
      { q: 'ATG 的 UE 在接入前要自己算什么？AI/ML for NG-RAN 的模型边界在哪？',
        a: '§16.19.2.2：UE 接入 ATG 小区前须有**有效 GNSS 位置与 gNB 位置**，据二者**自算 RTT** 并**自主预补偿 TTA**；连接态持续更新 TA，可事件触发上报。§16.20.2：AI/ML **算法与模型在 3GPP 范围之外**；**模型性能信息不在 38.401 的 NG-RAN 接口交换**；**不适用 ng-eNB**；流程与用例/数据类型无关、**不指示数据用途**（M63 课 d1-d3/f6）。',
        ref: '38.300#16.20.2' }
    ] },
    'm64:q0': { levels: [
      { q: 'MUSIM 的三项增强分别解决什么？寻呼避撞在哪个网触发、选哪张网由谁决定？',
        a: '§20.1：三项可任选其一或多项——**寻呼避撞**（20.2）、**切网通知**（20.3）、**能力临时限制与移除**（20.4）。§20.2：双卡在两个网络都处 **RRC_IDLE/RRC_INACTIVE** 时寻呼时机可能重叠，Network A=NR、B=E-UTRA 或 NR；UE **可判定潜在冲突并在 NR 网触发避撞动作**（23.501）；**选两个 RAT/网络中的哪一个来避撞由 UE 实现决定**，网络之间不横向协调（M64 课 a1/b1/f1）。',
        ref: '38.300#20.2' },
      { q: '切网前要通知什么？MUSIM gap 有几个、能否用替代模式？离开连接态的超时兜底是什么？',
        a: '§20.3：切走前应通知 A——**离开 RRC_CONNECTED**（RRC 或 NAS 偏好；RRC 偏好后若网络配置的时间窗内未收 **RRCRelease**，UE **可自行进 RRC_IDLE**），或**保持连接态并临时切走**（scheduling gaps 偏好，含间隙建立/释放）。A **最多配 4 个 gap 模式=3 周期+1 非周期**；应至少给一个请求模式或都不给，**本版不支持替代模式**；可给周期间隙优先级并偏好 keep solution（M64 课 b2/b3/f2/f3）。',
        ref: '38.300#20.3' }
    ] },
    'm64:q2': { levels: [
      { q: 'UE 侧模型的适用性上报怎么走？周期、半持续与非周期 CSI 配置分别怎么激活？',
        a: '§22.2.3 七步：能力问询 → **UECapabilityInformation** 报支持功能 → gNB 经 **CSI 上报配置/推理相关参数配置**给带**关联 ID** 的推理配置 → UE 按网络侧附加条件、UE 侧附加条件与**模型可用性**判定 → 在 **RRCReconfigurationComplete** 报适用性 → **周期 CSI 上报时 UE 自主激活**，半持续由 **MAC CE/DCI**、非周期由 **DCI** 激活 → 变化经 **UAI** 或 RRCReconfigurationComplete 上报。无关联 ID 时如何判定由 UE 实现（M64 课 c2/dp）。',
        ref: '38.300#22.2.3' },
      { q: '已激活功能变为不适用时 UE 能自行去激活吗？两侧模型的监测责任怎么分？CSI 预测有何差异？',
        a: '§22.2.3：**UE 不自行去激活**，只向 gNB 指示适用性变化；gNB 收到后应去激活或释放；NOTE 2：**所有推理配置无论适用与否都保留，直到 gNB 释放**。§22.2.4：网络侧模型由 **gNB 负责性能监测**、UE 只提供测量/数据且不知管理决策；UE 侧模型由 **gNB 发起监测**并按结果决策，UE 可报测量或报性能指标。§22.3：CSI 预测**只支持时间域+UE 侧模型**，且适用性上报**无推理相关参数配置**（M64 课 c3/f5）。',
        ref: '38.300#22.2.4' }
    ] },
    'm64:q4': { levels: [
      { q: 'SBFD 的子带数量与 BWP 交叠规则是什么？UE 是否支持全双工？',
        a: '§23.1：SBFD 用于 **TDD 载波**，gNB 在不重叠子带上同时下行发、上行收；**UE 侧不支持全双工**。小区级 SBFD 时频资源经 **SIB1/专用信令**；子带在 tdd-UL-DL-ConfigurationCommon 的 **DL 与灵活符号**里。每 SBFD 符号**最多 1 个 UL 子带、2 个 DL 子带**；多载波下 UE **最多配一个 TDD 载波**。SBFD 符号内除 **CLI 测量**外，UE 只在 **active BWP 与子带交叠**的 RB 收发（M64 课 a3/d1/f6）。',
        ref: '38.300#23.1' },
      { q: 'SBFD 随机接入的支持范围有哪些例外？两种 RACH 配置怎么选？PRACH 时机能换几次？',
        a: '§23.2：支持 9.2.6 全部触发事件，**除 Request for Other SI 与 Early UL synchronization with an LTM candidate cell**；不支持服务小区 **additional PCI** 的 RACH；RACH-based LTM cell switch **仅 intra-DU**。CBRA/CFRA 都支持，但**只用 4-step RA type 与 SBFD RACH 资源**。配置两选一：**单套**同时支持非 SBFD 与 SBFD，或**双套**（一套非 SBFD、一套专用 SBFD）；aware UE 支持则应用、否则回落非 SBFD。CFRA 经 PDCCH order/LTM MAC CE/专用 RRC 指示时机；CBRA 按 SI 指示、否则按 SSB RSRP 阈值、都无则 UE 实现；过程中**允许切换一次，同一过程不得再切**；CFRA 回退 CBRA 用同类型 occasions（M64 课 d2-d4）。',
        ref: '38.300#23.2' }
    ] },

    'm65:q0': { levels: [
      { q: 'QoE 收集支持哪三类服务与三种承载？各态支持有何差异？两基激活怎么分？',
        a: '§21.1：三类应用层服务=**DASH streaming/MTSI/VR**；承载=**MBS broadcast/MBS multicast/Unicast**，一次收集只对应配置指示的一种通信服务类型。DASH/MTSI/VR 默认**只 RRC_CONNECTED**（MBS 广播承载除外）；**MBS 广播三态全支持**，**MBS 组播仅连接态**。两基=**management-based**（OAM 直配 gNB，gNB 按能力与 area/slice scope 选 UE）与**signalling-based**（OAM 经 5GC 发 UE-associated 信令）；Uu 口叫 application layer measurement，与 NG/Xn/OAM 口 QoE Measurement 等价（M65 课 a1/b1）。',
        ref: '38.300#21.1' },
      { q: '去激活与暂停有什么区别？替换配置的基座红线是什么？',
        a: '§21.2.2：去激活**永久停**配置——OAM 发起，信令基走 **UE-associated NGAP+QoE reference 列表**，UE 删应用层与 AS 参数、弃未发报告；可放旧配新，但**不得为配 management-based 而释放 signalling-based**。§21.2.3：RAN 过载走**暂停/恢复**——RRCReconfiguration 暂停后 UE 把报告**暂存 AS 层**，恢复后回放；存与删方向相反（M65 课 b2/f1）。',
        ref: '38.300#21.2.2' }
    ] },
    'm65:q2': { levels: [
      { q: 'UE 掉到 IDLE/INACTIVE 时 QoE 配置怎么办？缓存报告怎么取回、有什么连接红线？',
        a: '§21.2.4：INACTIVE 存 **UE Inactive AS context**；IDLE **释放全部**配置（显式指示适用的除外——MBS 广播会话可三态续收）；area scope 外**只留配置不开新会话**，报告存 AS 层，gNB 经 **SRB4/SRB5** 取回；UE **不得为发送存储报告而回连接态**，只在因其他原因回连时补交；恢复到不支持 QMC 的 gNB 则全放。§21.2.5：per-slice 配置带 slice scope、报告容器带**网络切片标识**（M65 课 b3/f2）。',
        ref: '38.300#21.2.4' },
      { q: '切换时 QoE 配置谁决定留放？RAN visible QoE 与 MDT 对齐各是什么账？',
        a: '§21.3：源 gNB 经 **XnAP/NGAP** 传配置信息；目标支持 QMC 由 **target 决定留放**，不支持则 **UE 全放**；gNB↔ng-eNB 跨制式**只保一份**（源决定，UE 换用对端配置）；出 area scope 仍继续测。§21.4：RAN visible QoE 是 **gNB 可读的显式 IE**（仅 DASH/VR、须同服务类型 QoE 配置在场；暂停期封装报告存、RAN visible 照报）。§21.5：immediate MDT 与 QoE 由 **MCE/TCE 关联**，锚=**NG-RAN Trace ID+时间戳**（M65 课 b4）。',
        ref: '38.300#21.3' }
    ] },
    'm65:q4': { levels: [
      { q: 'cell DTX/DRX 的六条硬规则与非激活期行为是什么？',
        a: '§15.4.2.3：pattern **小区公共**、DTX/DRX **分别配置激活**、每 MAC 实体对不同服务小区**最多 2 个**、只适用 **RRC_CONNECTED** 且不碰 RA/SSB/寻呼/SI 广播、**单 TRP**、经 **RRC 或 L1 组公共信令**开关。DTX 非激活可**不监控 PDCCH/SPS**；DRX 非激活**不发 CG/SR/周期半持续 SRS**（**定位 SRS 豁免**）；应急豁免；须与 UE **C-DRX on-duration 部分重叠**（周期互成倍数）（M65 课 c3/f3）。',
        ref: '38.300#15.4.2.3' },
      { q: 'RIM 的编组与两套框架怎么运作？CLI 测量与上报两型怎么分？',
        a: '§17.1：victim/aggressor 按**半静态集合**编组，每小区**最多一 victim+一 aggressor set ID**（gNB 可兼两角）；victim 集合**同发同一 RIM-RS**；纯无线框架 aggressor 回 RIM-RS、**收不到即波导止**；回程框架**点到点、对核心网透明**；终止=victim 停发。§17.2：CLI 测量两型=**SRS-RSRP**（aggressor 的 SRS 资源）与 **CLI-RSSI**（RSSI 总功率）；上报 **L1/L3 互斥**——L3 带三层滤波、事件+周期，L1 按量分：SRS-RSRP **只非周期**、CLI-RSSI 周期/非周期皆可；gNB-to-gNB CLI 靠 victim gNB 报告+邻站评估，兜底 **UL resource muting**（偶/奇子载波二选一）（M65 课 d1-d4/f4/f5）。',
        ref: '38.300#17.2' }
    ] },

    'm66:q0': { levels: [
      { q: 'MO-SDT 的三道发起门与 MT-SDT 的触发链各是什么？双入口资源怎么配？',
        a: '§18.0：MO 三门=**UL 数据≤配置量**（对全部 SDT 承载合并计）+**DL RSRP 高于阈值**+**有效 SDT 资源**（38.321 §5.27.1）；MT=网络在 **paging message** 带指示、UE 复验 RSRP 后以 **MT-SDT resume cause** 发 **RRCResumeRequest/RRCResumeRequest1**。双入口=**RACH**（经系统信息）与 **Type 1 CG**（经 RRCRelease 专用信令）；资源在 **initial BWP**、NUL/SUL 可兼；CG 仅在原 PCell 有效、关联一或多 SSB；**CFRA 不支持**、MT 走 RACH 只能用非 SDT 资源（M66 课 a1/b1/f1/f2）。',
        ref: '38.300#18.0' },
      { q: 'SDT 的成功出口与失败判据各有哪些？CG-SDT 的 TA 怎么守？',
        a: '§18.0：成功=导向 IDLE/留 INACTIVE（RRCRelease 或 RRCReject）/升 CONNECTED（RRCResume/RRCSetup），带 **resumeIndication** 则续 RRC Resume；失败六判据=重选/失败检测 timer 到期/PRACH preamble 阈值/RLC 重传阈值/完整性失败/CG 上 TA 或 configuredGrantTimer 到期无响应——**一律回 IDLE**。CG-SDT 需**有效 UL TA**：专用 TA timer+高排名 SSB 的 RSRP；TA 到期**释放资源但保留配置**；另有 next CG occasion 最大时长门（MO 按 LC/MT 按 UE）（M66 课 b2/f6）。',
        ref: '38.300#18.0' }
    ] },
    'm66:q2': { levels: [
      { q: '带与不带上下文迁移的两张流程图差在哪？收尾消息各是什么？',
        a: '§18.2：全上下文经 **Xn-AP Retrieve UE Context** 迁到新站，UL 直送 UPF，新站发 **NGAP Path Switch Request**、防丢经 **Xn-U ADDRESS INDICATION**，收尾 **RRCRelease（suspend）**+**UE CONTEXT RELEASE**；升连接态扳机=非 SDT 到达/DL SDT 太大/BSR 超阈值/UP policy 不一致。§18.3：只传**含 SDT RLC context 的 partial UE context**，UE context 留原站，DRB 走 **GTP-U 隧道**转发，收尾=新站发 **RETRIEVE UE CONTEXT CONFIRM**（正常结束/无线链路问题/BSR 大量）+原站回 **RETRIEVE UE CONTEXT FAILURE** 内封装 RRCRelease。§18.1：clock quality UE 必须**全迁移**（M66 课 b3/b4）。',
        ref: '38.300#18.2' },
      { q: 'MT-SDT 怎么把 DL 数据送到停在 INACTIVE 的 UE？',
        a: '§18.4：DL 数据到 **Last Serving gNB**（或长 eDRX 的 RAN Paging），经 **XnAP RAN PAGING** 把 **MT-SDT information** 散给 RNA 内邻站，各站自行决定是否触发 **MT-SDT Paging**——经 **Uu Paging** 够到 UE 的即 Receiving gNB；UE 以 **MT-SDT resume cause** 发 RRCResumeRequest，后续并入 18.2-1/18.3-1（首包换 DL）；步骤 2-6 间来非 SDT 数据则原站应迁移上下文并转发（M66 课 b4）。',
        ref: '38.300#18.4' }
    ] },
    'm66:q4': { levels: [
      { q: 'LP-WUS 的空口形态与按态 codepoint 数是什么？唤醒不成怎么办？',
        a: '§11：LP-WUS 全态可配，基于 **OOK** 叠加 **overlaid OFDM sequence(s)**，至多 **5 information bits**/**32 codepoints**；**IDLE/INACTIVE 盯 2 个 codepoint**、**CONNECTED 最多 8 个**；一个 OFDM 符号内 OOK 符号数 1/2/4。IDLE/INACTIVE 侧 **wake-up delay** 三候选，gNB 在 reference PF of PO 与 LP-WUS occasion 间配 offset——**都不小于上报值才监控**，否则放弃唤醒改盯 **PEI/paging**；LR 与 MR 不同时收；LP-SS 只在非连接态保 LR 同步（M66 课 c2/c3/f4）。',
        ref: '38.300#11' },
      { q: '§19 的上行八式与下行两式怎么分？MSG1 repetition 回退卡在哪？',
        a: '§19：上行（FR1+FR2）对 PUSCH/PUCCH/PRACH/MSG3 八式=TB repetition 聚合（两计数口径上限都 **32**）/TB processing 跨时隙/DMRS bundling（可与 inter-slot 跳频同用）/PUCCH repetition factor 动态/MSG3 repetition（RSRP 低于阈值经独立 RACH 资源）/MSG1 repetition（按重复数广播分开 RSRP 阈值）/波形 DFT-S-OFDM↔CP-OFDM（DCI 0_1/0_2+PHR 双口径）/频域谱整形（MPR/PAR）；下行仅 **FR1+TN** 两式=CSS 的 PDCCH repetition+SIB1 PDSCH 两连续时隙。回退禁区=**MSG1-based SI request** 与 **CFRA→CBRA 已发生**；CFRA→同重复数 CBRA 可以（M66 课 d1-d4/f5）。',
        ref: '38.300#19' }
    ] },

    'm67:q0': { levels: [
      { q: '38.300 §13 的密钥树怎么长？两条 SMC 各管什么、键何时产出？',
        a: '§13.1：主认证产出锚钥 **KSEAF**，**KAMF** 由 ME 和 SEAF 派生；NAS 分支=**KNASint/KNASenc** 由 ME 和 AMF 从 KAMF 派生、**成功跑完 NAS SMC 后**才产出；AS 分支=**KgNB** 由 ME 和 AMF 从 KAMF 派生，gNB 侧再从 KgNB 展开四键；中间键 **NH**（前向安全，只 UE 和 AMF 能算）与 **KgNB\***。AS SMC=算法协商+RRC 安全激活：AMF 发**完整 UE 5G security capabilities**、gNB 按配置优先级选算法、**六条时序先验后开**（gNB 下行加密在发出 SMC 后、其余在收到并校验后），MAC-I 失败接收侧 PDCP 丢弃（M67 课 b1/b3/f1/f2）。',
        ref: '38.300#13.1' },
      { q: '水平/垂直密钥推导与 NCC 怎么记？回 IDLE 时哪些键删、哪些留？',
        a: '§13.1/§13.3：每个 KgNB 与 NH 都关联 **NCC**——初始 KgNB 关联 **NCC=0 的 virtual NH**、初始 NH 值 NCC=1；切换时 KgNB* 从**当前激活 KgNB** 派生=**horizontal（NCC 不增）**、从 **NH 参数**派生=**vertical（NCC 增）**，落地后四键重派；NH/KgNB* 须**绑定目标 PCI 与 ARFCN-DL**（目标 PCell 的 CD-SSB 绝对频率）再投入使用。回 IDLE：gNB 与 UE **删 NH/KgNB/KRRCint/KRRCenc/KUPint/KUPenc 及相关 NCC**，**AMF 与 UE 保留 KAMF/KNASint/KNASenc**——重入连接态不必重新主认证；intra-gNB-CU 切换未指示新算法则**沿用原算法**（M67 课 b2/b4/f3）。',
        ref: '38.300#13.3' }
    ] },
    'm67:q2': { levels: [
      { q: 'NR 能力的分层结构与 Feature Set 组合矩阵怎么读？过滤三闸是什么？',
        a: '§14：能力按 **per UE、duplex mode、frequency range、band、band combination** 分层（SDAP/PDCP/RLC 恒 per-UE）；**category 只为营销、不上报网络**，峰值速率=各载波求和。**FS** 按 band 内连续小区块定义，feature sets per band 通告备选；**feature set combination** 二维矩阵——每 band 的 FS 数=band 条目数且各 band 相同、BC 一一对应（图 14-1）；intra-band 连续 CA 逐载波 feature set per component carrier、顺序无关。过滤三闸=**限带请求**/UE 按 **fallback behaviour 跳子集**（38.306/38.331）/**eRedCap 可无视过滤**但须镜像 filter+显式指示（M67 课 c1/c2）。',
        ref: '38.300#14' },
      { q: '能力 ID 与 AMF 存储怎么分工？为什么 UTRA-FDD 能力要现取不存？',
        a: '§14：UE 可在 **NAS 信令**里给一或多个 RAT 提供代表无线能力的 **ID**——厂商分配=**pre-provisioned 预置集**、PLMN 分配在 **NAS 信令里完成**；**AMF 存储 gNB 上传的 UE Radio Capability**（23.501），换 gNB 不换账本。**RAT 请求面三分**：NR/EUTRA/UTRA-FDD；UTRAN 能力即 **INTER RAT HANDOVER INFO**，内含 **START-CS/START-PS/predefined configurations 动态 IE**——为防 **START 失步与密钥重放**，**切换 UTRA-FDD 前总是现取、且不上传 AMF**（动态值不留底，NR/EUTRA 才由 AMF 存储）（M67 课 c3/c4/f4/f5）。',
        ref: '38.300#14' }
    ] },
    'm67:q4': { levels: [
      { q: '三十二枚 RNTI 怎么分组记？「认人」与「报事」的分界是什么？',
        a: '§8.1：二分刀法=清单里带 **unique UE identification** 的才认人——调度类认人五枚（**C-RNTI/CG-SDT-CS-RNTI/CS-RNTI/MCS-C-RNTI/SP-CSI-RNTI**）+功控三 TPC；报事类只标事件——**P-RNTI/SI-RNTI/INT-RNTI/CI-RNTI/SFI-RNTI**。随机接入四枚（**RA-RNTI/MSGB-RNTI/Temporary C-RNTI/竞争决断随机值**，后两枚临时）；状态与业务专属：**I-RNTI**（NG-RAN 级寻址 INACTIVE 上下文）、省电 **PS-RNTI/PEI-RNTI**、IAB **AI-RNTI**、**NCR-RNTI**、MBS 四枚（**Multicast MCCH-RNTI** 特供 INACTIVE 态组播）、网络节能 **cellDTRX-RNTI**（M67 课 d1/d2/f6）。',
        ref: '38.300#8.1' },
      { q: '网络侧十枚身份怎么拼装？侧链 Layer-2 ID 的拆分为什么不对称？',
        a: '§8.2/§8.3：网络身份全走「PLMN+局部号」——**NCGI**=PLMN identity+NCI（SIB1 按广播顺序取首 PLMN）、**gNB ID 装在 NCI 里**、**Global gNB ID**=PLMN identity+gNB ID、**TAI**=PLMN+TAC、切片 **S-NSSAI/NSAG**（TA 内唯一）、**NID**（SNPN）、CAG、**Local NG-RAN Node ID 在 I-RNTI 里引用**；8.3=CN 给 **IPv4/IPv6 双传输地址**由 NG-RAN 节点任选。§8.4：**Layer-2 ID 全长 24 bits 非对称拆分**——Source 低 8 位进物理层/高 16 位进 MAC 头，Destination 低 16 位进物理层/高 8 位进 MAC 头；**PC5 Link Identifier** 终生认链路；SL-PRS Source ID **12 或 24 bits**（M67 课 d3/d4）。',
        ref: '38.300#8.4' }
    ] },

    'm68:q0': { levels: [
      { q: 'Sidelink 承载分哪三族？「条件-操作二段式」怎么读 §5.8.9.1a？',
        a: '§5.8.9.1a 三族：**sidelink DRB** 承用户数据（sidelink QoS flow 映射其上，流断则拆）；**sidelink SRB** 承 PC5-RRC、PC5-S 与发现信令（**SRB4 专席**服务发现消息）；**additional sidelink RLC bearer** 给同一 DRB/SRB 加**第二条 RLC 腿**（PDCP duplication 或载波分离）。二段式刀法=每族拆 **conditions 叶（什么触发）+operations 叶（触发后做什么）**：DRB 释放（.1.1/.1.2）、DRB 增改（.2.1/.2.2）、附加承载释放（.5.1/.5.2）、附加承载增改（.6.1/.6.2）四套对子+SRB 释放（.3）/添加（.4）两单叶（M68 课 h0/a1）。',
        ref: '38.331#5.8.9.1a.2.1' },
      { q: '三源配置通道是什么？unicast 侧的时序闸怎么走？',
        a: '四通道汇于同一批 UE 行为：RRC_CONNECTED 的 **sl-ConfigDedicatedNR**、广播 **SIB12**、脱网 **SidelinkPreconfigNR**、对端 PC5-RRC 直发 **RRCReconfigurationSidelink**——回执 **RRCReconfigurationCompleteSidelink** 是 unicast 的时序闸。三分支=「for groupcast and broadcast」**即时执行**；「triggered after the reception of the RRCReconfigurationSidelink message」**收到即执行**；sl-ConfigDedicatedNR/SIB12/SidelinkPreconfigNR/上层来源**等自己发出 Complete 之后**才执行——等的是 UE 自己的回执不是对端确认（M68 课 a2/f1）。',
        ref: '38.331#5.8.9.1a.1.2' }
    ] },
    'm68:q2': { levels: [
      { q: 'DRB 释放九触发怎么分组记？释放动作里 SDAP 的两步是什么？',
        a: '§5.8.9.1a.1.1 九条按三组记：**配置面点名**（slrb-Uu-ConfigIndex 进 sl-RadioBearerToReleaseList、SL-RLC-BearerConfigIndex 进双列表、unicast 的 slrb-ConfigToReleaseList 与 **sl-ResetConfig**）；**数据面断流**（no sidelink QoS flow with data 两条——unicast 版要求两路流都无数据，是 AND 不是 OR）；**连接面生灭**（RLF 5.8.9.3/上层请求 5.8.9.5/e2e 失败 5.8.9.3a/e2e 上层请求 5.8.9.5a）。释放三层=「release the PDCP entity」→SDAP **先通知（37.324 clause 5.3.3）再回收无主实体（clause 5.1.2）**→按 sl-RLC-BearerConfigIndex 逐条放 RLC 与逻辑信道；per-hop 拆完要跟 **5.8.3 UE information procedure**、RLF 按 destination 三层一锅端（M68 课 b1/b2/b3/f2）。',
        ref: '38.331#5.8.9.1a.1.1' },
      { q: '附加承载什么时候加第二腿？SL-TxProfile 两个值怎么定？',
        a: '§5.8.9.1a.6.1 七路=三清单来源×**SL-TxProfile** 状态机：sl-RLC-BearerToAddModList（RRCReconfigurationSidelink，锚 slrb-PC5-ConfigIndex）+sl-RLC-BearerToAddModListSizeExt（sl-ConfigDedicatedNR，锚 sl-ServedRadioBearer）+sl-RLC-BearerConfigListSizeExt（SIB12/Preconfig 三态，前提 DRB 已立未拆）——**backwardsIncompatible**=全部关联流兼容性不保、非单播直接加腿；**backwardsCompatible**=至少一流兼容且 **UE decides to use PDCP duplication**；unicast 资格=**both UEs support PDCP duplication**；SRB1/2/3 版=双端支持且 UE 决定。附加承载随 PC5-RRC 重配走时序闸、跟随宿主释放（M68 课 d1/d3/f5）。',
        ref: '38.331#5.8.9.1a.6.1' }
    ] },
    'm68:q4': { levels: [
      { q: '附加承载释放的 received/transmitted 镜像语法是什么？两腿载波有什么硬约束？',
        a: '§5.8.9.1a.5.2 三分支按凭据视角分：groupcast/broadcast 与 unicast+sl-ConfigDedicatedNR 源→按**收到的** sl-RLC-BearerToReleaseListSizeExt；unicast 收 RRCReconfigurationSidelink→按**收到的** sl-RLC-BearerToReleaseList；SIB12/预配置/上层源→按 **transmitted sl-RLC-BearerToReleaseList** 对账——UE 把释放意图装进自己发出的 RRCReconfigurationSidelink，本端按 transmitted 拆自己侧、对端按 received 拆对端侧。两腿载波约束（.6.2）：RRC_CONNECTED 走 **sl-AllowedCarriers**（DRB）/**sl-AllowedCarrierFreqSet1 与 Set2**（SRB），脱网 UE 自挑但 **the allowed carriers for the two RLC bearers are not overlapping with each other**（M68 课 d2/d4/f4/f6）。',
        ref: '38.331#5.8.9.1a.5.2' },
      { q: 'SRB 怎么建怎么拆？e2e 中继面 SRB 有什么特殊动作？',
        a: '§5.8.9.1a.4 三触发全由上层拉动：PC5-S 传输请求→按 **clause 9.1.1.4** 建三件套（if needed）；发现消息→**SRB4 专席**；PC5-RRC 建立指示→建立并 **consider the PC5-RRC connection is established**（建立即认链）。**allowed carrier 预指示**=「before the reception of initial RRCReconfigurationCompleteSidelink message which confirms SL CA carrier(s) addition」——in coverage（TS 38.304）走 sl-FreqInfoList、覆盖外走 sl-PreconfigFreqInfoList，抢在回执前喂低层。释放（.3）四路与建立镜像：PC5-RRC 释放或 RLF→三层拆+consider released；PC5-S/发现终止→放对应 SRB；e2e release/failure→放 PDCP+**解除与 egress PC5 Relay RLC channel 的关联并 reconfigure SRAP configuration**；端到端 SRB0/1/2/3 以 **SL-U2U-RLC** 为出口信道、映射交 SRAP（M68 课 c1/c2/c3/c4）。',
        ref: '38.331#5.8.9.1a.3' }
    ] },
    'm69:q0': { levels: [
      { q: '中继控制面五件账怎么记？三类角色和两层账本是什么？',
        a: '§5.8.9.7–.11 五件账：**PC5 Relay RLC 信道管理**（.7 管道——per-hop QoS 派生/释放/增改）、**Remote UE information**（.8 需求单——SIB/posSIB/寻呼/SFN-DFN/connectionForMP）、**Uu message transfer**（.9 中继把 Uu 的 Paging/SI 搬给远端或 child）、**Notification Message**（.10 上游事件通知下游）、**UE information transfer**（.11 U2U 的 QoS split 协商）。三类角色=U2N Remote/U2N Relay（单跳 Last 或多跳 Intermediate）、U2U Remote/Relay。两层账本=e2e（端到端 DRB/QoS）与 per-hop（每跳 Relay RLC 信道与 split QoS）——五件账都是两层之间的搬运工（M69 课 h0/a1）。',
        ref: '38.331#5.8.9.7.0' },
      { q: '为什么说 .8 与 .11 都带「Remote 信息」字样但完全不同？',
        a: '.8 是**单向需求单**：远端在 IDLE/INACTIVE 把「缺什么」告诉中继（SIB/posSIB 请求、寻呼信息、SFN-DFN offset、connectionForMP），中继自己服务或转 5.8.3/5.2.2，再经 .9 把结果送下。.11 是 **U2U 双向 QoS 握手**：Remote 交底 e2e QoS，Relay 做 split（PDB 每跳）回 first-hop split 值，两端各自 merge 成 per-SLRB profile 并派生本跳管道（.7.0）。一句话：.8 是「需求单」，.11 是「对账」（M69 课 a3/d4）。',
        ref: '38.331#5.8.9.11.1' }
    ] },
    'm69:q2': { levels: [
      { q: 'PC5 Relay RLC 信道的派生/释放/增改里，时序闸怎么复用？',
        a: '与 M68 SLRB 同款两段闸：PC5 对端直发 RRCReconfigurationSidelink→**收到即执行**；sl-ConfigDedicatedNR 或 .7.0 派生结果触发→**等本端发出 RRCReconfigurationCompleteSidelink 之后**执行。释放/增改各三分支镜像。**清单分叉**：Uu 侧 sl-RLC-ChannelToReleaseList vs PC5 侧 sl-RLC-ChannelToReleaseListPC5；增改二分=已有信道 reconfigure vs 未配置 establish。**建立铺底**：U2N 建 SRAP+SL-RLC0 specified（IDLE/INACTIVE 再 SL-RLC1 default）；U2U 建 SRAP+SL-U2U-RLC（M69 课 b2/b3/b4/f2/f3）。',
        ref: '38.331#5.8.9.7.1' },
      { q: 'first hop 和 second hop 的派生谁负责？聚合单位是什么？',
        a: '§5.8.9.7.0：**first hop** 由 source L2 U2U Remote UE 把带 split QoS 信息的 QoS flow 聚合成 **per-SLRB level QoS profile**（每个 e2e DRB 一条），再取 sl-RLC-BearerConfigList/PreConfigList 中与匹配 SL-RadioBearerConfig 关联的 SL-RLC-BearerConfig；**second hop** 由 L2 U2U Relay UE 对 second hop 同构处理。聚合单位是 per-SLRB 级 profile，不是逐 QoS flow 建信道；两跳各算各账（M69 课 b1/f1）。',
        ref: '38.331#5.8.9.7.0' }
    ] },
    'm69:q4': { levels: [
      { q: '远端需求单有哪些块？中继收到后怎么服务？',
        a: '需求单七块：SIB 请求（sl-RequestedSIB-List）、posSIB（需中继声明 posSIB-ForwardingSupported）、SFN-DFN offset（需 sfn-DFN-OffsetSupported）、寻呼信息（IDLE：ng-5G-S-TMSI+上层 DRX；INACTIVE：再加 fullI-RNTI 且 DRX 取上层与 RRC 最小值）、进 CONNECTED 三项 release、CONNECTED 内 offset 重发与 connectionForMP、Intermediate 汇聚 child 请求。中继四路：**自听寻呼**（CONNECTED 有 paging CSS 或 IDLE/INACTIVE）、**SidelinkUEInformationNR 上报**（CONNECTED 无 CSS）、**SIB 采集→Uu 消息转移**、**connectionForMP→建连/恢复**（M69 课 c1/c2）。',
        ref: '38.331#5.8.9.8.2' },
      { q: 'Notification 的三套指示字段怎么分？U2U Remote 收到 PC5-RLF 后做什么？',
        a: '.10.3 三套字段=**indicationType**（U2N/Intermediate 四值：Uu-RLF/HO/CellReselection/Uu-RRC-Failure）、**mh-indicationType**（Intermediate 专属：RelayReselection/CellSelection/Parent-PC5LinkRelease）、**sl-IndicationType**（PC5-RLF 侧链事件）；Intermediate 转手沿用 parent 的 indicationType，U2U PC5-RLF 通知必带 sl-DestinationIdentityRemoteUE。远端收（.10.4）：CONNECTED+MP→HO 挂起间接路径、其余 5.7.3c；非 MP 且 T301 未跑→5.3.7 重建；U2U Remote 收 PC5-RLF→视为 e2e 失败走 5.8.9.3a（M69 课 d2/d3/f5）。',
        ref: '38.331#5.8.9.10.3' }
    ] },
    'm70:q0': { levels: [
      { q: 'Relay/Remote UE 操作这五节里，四顶帽子和三机制轴怎么记？',
        a: '四顶帽子按两族分：**U2N Relay**（单跳 U2N Relay UE 或多跳 Last）看自己驻留小区的 **Uu RSRP**；**U2N Remote** 看自身覆盖差再挑 Relay；**U2U Relay** 看源端/邻居的 **PC5 链路**并判近邻；**U2U Remote** 看对端链路与中继响应；多跳的 **Intermediate** 对 parent 是 Remote、对 child 是 Relay。三机制轴=**门限条件**（entry/leave+迟滞）、**选择与重选**（触发清单+候选评估+合适判定）、**近邻条件**（Model A 通告名单）。一句话：Uu 门限管回传、PC5 门限管转发；Remote 门限管求助、Relay 门限管接单（M70 课 h0/a1/a2）。',
        ref: '38.331#5.8.14.1' },
      { q: '为什么 1.08× 的体量还判定「机制点补强」？',
        a: '14 叶 19,497 chars 刚过 18KB 判定线（1.08×），但机制密度足：四角色×三机制轴，其中 **.15.3 选择重选 4,428**、**.17.3 条件 2,172**、**.17.4 动作 2,393** 三块算法主料占 9,000+，另有 **.16.3 近邻 829** 与 **.19.2 多跳门限 2,508** 两个特面。沿 v32 1.06×/v34 0.92× 先例按机制点补强判定，课头与台账如实注记（M70 课 a4/课头）。',
        ref: '38.331#5.8.15.3' }
    ] },
    'm70:q2': { levels: [
      { q: 'U2N 两侧门限的方向为什么相反？',
        a: '**Relay 侧（.14.2）是双门限带**：RSRP 要低于 threshHighRelay 减 hystMaxRelay（太高说明自己直连更好）且高于 threshLowRelay 加 hystMinRelay（太低说明自己覆盖差），entry 是 AND、leave 任一越界即 OR。**Remote 侧（.15.2）是单门限**：RSRP 低于 threshHighRemote 减 hystMaxRemote **或根本没有服务小区**时 entry——覆盖越差越该找中继。所以同一个「迟滞」，Relay 用来收窄进入带、Remote 用来防止刚够格就来回切（M70 课 b1/b2/f1/f2）。',
        ref: '38.331#5.8.14.2' },
      { q: 'U2N 选择重选为什么要分成「触发」与「候选 AS 判据」两道门？',
        a: '**触发门（.15.3 前半）**判「该不该找」：外门=无服务小区或驻留小区/PCell RSRP 低于 threshHighRemote；内环六条=无已选中继、已选中继 SL-RSRP 低于 sl-RSRP-Thresh（SL 不可用则看 SD）、上层停用、上层要求释放 PC5-RRC、PC5-RRC 侧链 RLF。**候选门（.15.3 后半）**判「谁能用」：对同一 Relay UE ID 做 L3 滤波（sl-FilterCoefficientRSRP 按 SIB12/ConfigDedicatedNR/预配置三选），候选 **SD-RSRP 超 sl-RSRP-Thresh 且高出 sl-HystMin** 才算过 AS 判据；suitable 还要加 23.304 上层判据（M70 课 b3/b4/f3）。',
        ref: '38.331#5.8.15.3' }
    ] },
    'm70:q4': { levels: [
      { q: 'U2U 的两套门限和两条动作路径分别怎么对？',
        a: '**Relay 侧（.16.2）两套消息共用一个阈值 sd-RSRP-ThreshDiscConfig**：集成发现的 **DCR 看 SL-RSRP** 高过阈值才 entry、低于阈值减 sd-hystMaxRelay 则 leave；Model B 发现消息**看 SD-RSRP** 同法。**Remote 侧（.17.2）两套**：solicitation/DCR 看**对端 Remote** 的 SL/SD-RSRP 低于阈值（或对端不可达）即 entry；Response 看 **U2U Relay 的 SD-RSRP** 高于阈值。**动作（.17.4）两路径**：5.8.13 发现路径候选判据用 **SD-RSRP**，5.8.8 集成发现路径收到 DCR 后候选判据用 **SL-RSRP**——原文如此，别统一（M70 课 c1/c3/c4/f4/f5）。',
        ref: '38.331#5.8.17.4' },
      { q: '多跳三份门限怎么按角色和连接状态分？',
        a: '三份共用 **sd-RSRP-ThreshDiscConfigMH** 与 **sd-hystMaxRelayMH**，输入统一是 **Candidate Child 的 Model B 消息 SD-RSRP**：**① Last 且无 child PC5** → 发送 Discovery Response；**② Intermediate 且无 parent PC5** → 发送 Discovery Solicitation（向上找 parent）；**③ Intermediate 且有 parent PC5** → 发送 Discovery Response。进入=高出阈值加迟滞，离开=低于阈值减迟滞。衔接：First/Intermediate 连 parent 前要先以 Remote 身份过 .15.2 门限（M70 课 d1/d2/d3/f6）。',
        ref: '38.331#5.8.19.2' }
    ] },
    'm71:q0': { levels: [
      { q: '发现与定位这两节，和 M70 的分工怎么一句话说清？',
        a: '**M70 管判据、本课管流程**。§5.8.14–.19 的门限与选择重选回答「够不够格、选谁」；§5.8.13/.18 回答「消息怎么发、池从哪来」：发现=**监控**（.13.2 在哪个池听）+**传输**（.13.3 何时可发、用哪个池），定位=**测量**（.18.2 收 SCI 与 SL-PRS）+**传输**（.18.3 发 SL-PRS）。.13.3 的十一条角色条件正是对 M70 各门限的调用点，同一事实不在两课重复展开（M71 课 h0/a1）。',
        ref: '38.331#5.8.13.1' },
      { q: '三套配置源和覆盖态怎么对应？定位为什么多一张 SIB23？',
        a: '**CONNECTED 用 RRC 专用**（sl-ConfigDedicatedNR：sl-DiscConfig、sl-DiscTxPoolSelected、角色 *Config 族）；**覆盖内空闲用 SIB12**（sl-DiscConfigCommon、公共池、*ConfigCommon 族）；**覆盖外用预配置**（SL-PreconfigurationNR / SidelinkPreconfigNR，9.3，池与 *Preconfig 族）。**SIB23 是定位专属**：sl-PosFreqInfoList 与 sl-PosConfigCommonNR 提供 SL-PRS 频率与池，配 sl-PRS-RxPool/sl-PRS-TxPoolSelectedNormal/sl-PRS-TxPoolExceptional 与 sl-PosAllowedResourceSelectionConfig——发现侧不查 SIB23（M71 课 a2/a3）。',
        ref: '38.331#5.8.18.2' }
    ] },
    'm71:q2': { levels: [
      { q: '监控池的三级与每级内部的优先级怎么记？',
        a: '**三级源**：handover 的 RRCReconfiguration（with reconfigurationWithSync）→ 所选小区的 SIB12 → 覆盖外预配置（SL-PreconfigurationNR，9.3）。**每级内部同一序**：发现专用池 **sl-DiscRxPool 优先**，通用池 **sl-RxPool 兜底**。**NOTE 的豁免**：若两池同时在 SIB12 或同时被预配置，用哪个由 UE 实现决定——所以硬优先级只在「只配了其中一个」时成立。**覆盖外不是停摆**：切到预配置池继续监控（M71 课 b1/b2/b3/f1/f2）。',
        ref: '38.331#5.8.13.2' },
      { q: '传输侧十一条角色条件为什么是 OR，非中继发现又怎么选池？',
        a: '十一条 3> 级条件以「or」连接——**任一成立即可发**；每条内部是 AND：角色 + **sl-DiscConfig 在 RRCReconfiguration** + 对应门限（5.8.14.2/.15.2/.16.2/.16.3/.17.2/.19.2）。角色条件都不成立时，若做**非中继发现**：**调度配置**下三定时器（T310/T311、T301、T304）→ 例外池 **mode 2 随机选择**，否则 **mode 1**（sl-DiscTxPoolScheduling/sl-TxPoolScheduling）；**自选配置**下 sensing 不可用→例外池，否则 **sl-DiscTxPoolSelected → sl-TxPoolSelectedNormal**（M71 课 c1/c3/f3/f4）。',
        ref: '38.331#5.8.13.3' }
    ] },
    'm71:q4': { levels: [
      { q: 'SIB12 分支与覆盖外分支跟专用配置有什么差异？',
        a: '**SIB12 分支**：十一条角色条件换 *Common 族照走，但 **Intermediate Model A 多一条前提**——has an established PC5 link with the selected parent U2N Relay UE（专用分支没有）；非中继发现三档：sl-DiscTxPoolSelected（sensing 可用或允许随机选择）→ sl-TxPoolSelectedNormal → 例外池（含「发起 RRC 建立/恢复起、到 RRCReconfiguration/RRCRelease/RRCReject 止」的窗口）。**覆盖外分支**：换 *Preconfig 族，**首条 L3 U2N Relay UE 无条件**（不查门限），Intermediate Model A 仍要求已与 parent 建 PC5；非中继发现直接 mode 2 资源选择（M71 课 c2/c4/f5）。',
        ref: '38.331#5.8.13.3' },
      { q: '定位传输为什么用 scheme 1/scheme 2，sensing 为什么只写 full？',
        a: '**术语**：发现侧写 **mode 1/mode 2**，定位侧写 **scheme 1/scheme 2**——同一层概念两套写法，原文按节各写各的。**scheme 1 只出现一处**：配了 sl-ScheduledConfig 且三定时器例外都不成立时（有调度配置的正常路径）；例外成立则 **scheme 2 随机选择**（sl-PRS-TxPoolExceptional/sl-TxPoolExceptional）。**sensing**：定位只写 **full sensing**（按 sl-PosAllowedResourceSelectionConfig），发现侧才是 **full/partial**——别照搬。另有原文细节：.18.3 内嵌 NOTE: Void；SIB23 分支一处写作 sl-PosTxPoolSelectedNormal（少一个 R）（M71 课 d2/d3/d4/f6）。',
        ref: '38.331#5.8.18.3' }
    ] },
    'm72:q0': { levels: [
      { q: 'M72 与 M70/M71 在测量面上的分工怎么一句话说清？',
        a: '**M70 判据、M71 用结果、M72 管测量账本**。§5.8.10 收测量配置/执行/触发/上报的完整流程：四件套（对象/报告配置/身份/量配置）由本端经 RRCReconfigurationSidelink 下发给对端，对端测 DMRS/SL-PRS、按 5.5.3.2 做 L3 过滤后按事件（S1/S2）或周期触发 MeasurementReportSidelink。M70 的门限评估吃的就是这里的过滤后结果，M71 的池选择同样读测量结果（M72 课 h0/a1）。',
        ref: '38.331#5.8.10.1' },
      { q: '四件套各管什么？身份为什么随报告回传？',
        a: '**对象定「测哪」**（待测参考信号所在的 NR 侧链频率）、**报告配置定「怎么报」**（判据=周期或单事件；RS 类型本版 DMRS 与 SL-PRS 都支持；格式仅 RSRP）、**身份定「哪对哪」**（把一个对象与一条报告配置链起来，多对多）、**量配置定「怎么滤」**（L3 过滤系数，分量配置）。身份随报告回传 serving as a reference to the network——网络按它对账；PC5-RRC 两端各维护对象/报告配置/身份三张表 VarMeasConfigSL（M72 课 a2）。',
        ref: '38.331#5.8.10.1' }
    ] },
    'm72:q2': { levels: [
      { q: '配置面的三条纪律是什么？',
        a: '**删除级联**：删对象/删报告配置→连带删全部关联身份→逐身份清报告条目、停周期定时器（.2.4/.2.6）；remove list 带不在册 id 不算错（.2.2/.2.4/.2.6 三处 NOTE 同口径——幂等盲发）。**增改镜像**：对象增改**先清报告后重配**、报告配置增改**先重配后清报告**（.2.5/.2.7 顺序相反各守一半）。**量配置全局复位**：改过滤系数对在册**每个**身份清报告停表——所有已过滤结果作废（.2.8）（M72 课 b1/b2/b3/b4/f1/f2/f3）。',
        ref: '38.331#5.8.10.2.8' },
      { q: '事件三态与 S1/S2 的镜像关系怎么记？',
        a: '**首频进入**=进入条件在 sl-TimeToTrigger 内持续成立且尚无报告条目→建条目+计数归零+频入 sl-FrequencyTriggeredList+发起上报；**后续频**=同样归零+入表+发起（不重建条目）；**离开**=移出触发表，sl-ReportOnLeave=true 再报一次，表空则删条目停表（.4.1）。**镜像**：S1 进=S2 出（Ms – Hys > Thresh）、S1 出=S2 进（Ms + Hys < Thresh）——两事件共用一对不等式只是进出互换；Ms 不含偏移、RSRP 时用 dBm、Thresh 与 Ms 同单位（.4.2/.4.3）（M72 课 c2/c3/f4）。',
        ref: '38.331#5.8.10.4.2' }
    ] },
    'm72:q4': { levels: [
      { q: '周期型上报发满后为什么要「自毁」？',
        a: '发满 sl-ReportAmount 且 sl-ReportType=sl-Periodical 时，UE 删该身份的报告条目，**并把该 sl-MeasId 从 sl-MeasIdList 里删掉**（.5.1）——身份都不留。事件型发满只停发不删身份（等离开条件重置节奏）。记法：量按 rs-Type 装包（sl-ResultDMRS/sl-Result-SL-PRS）、计数+1、不足按 sl-ReportInterval 续表、周期发满连身份一起清（M72 课 c4/f5）。',
        ref: '38.331#5.8.10.5.1' },
      { q: '拾遗五件各收什么？载波增删的「收发不对称」指什么？',
        a: '**载波增删**（5.8.9.1b 二段式）、**能力转移**（5.8.9.2：enquiry 必带 frequencyBandListFilterSidelink，仅端到端 L2 U2U relay 豁免；对端按 filter 顺序编译候选组合尽量多装并回填 appliedFreqBandListFilter）、**PC5 收尾**（5.8.9.3b：三触发→丢弃端到端 SRB/DRB/QoS/SRAP 配置→IDLE/INACTIVE/OOC 触发 RLC 信道派生、CONNECTED 发 SUI）、**V2X 同步**（5.8.5a：按 36.331 5.10.7 发 SLSS+MIB-SL-V2X）、**Zone**（5.8.11：y1*64+x1，Floor+Mod 64，WGS84 测地距离）。**不对称**：信令触发只动**接收**侧（增=四参数加收/释=释放收），配置/上层触发在 RRCReconfigurationCompleteSidelink **之后**才动**发送**侧（增=只按 sl-AbsoluteFrequencyPointA 加发+SRB/DRB 额外允许载波指示/释=释放发+收回指示）（M72 课 d1/d2/d3/d4/f6）。',
        ref: '38.331#5.8.9.1b.2.2' }
    ] },
    'm73:q0': { levels: [
      { q: '为什么 SS-RSRP 的测量时机要锁在 SMTC 窗内？',
        a: '**SMTC=SS/PBCH 块测量时间配置窗**——网络把「什么时候有 SSB 可测」的账（窗长+周期+偏移）告诉 UE；测量时间资源锁窗内是默认口径，例外只有两个：**WUR 唤醒接收机测量、L1-RSRP 用途**（38.214 上报配置指示时不受限）。锁窗的工程意义：异频测量要配 gap、邻区 SSB 周期各异——UE 只在窗内醒着测，省电与干扰两得；越窗采样混入非目标 RE，与门限（dBm）对不上账（M73 课 b1/f4）。',
        ref: '38.215#5.1.1' },
      { q: 'SS-RSRP 的加用规则为什么「跟着用途走」？',
        a: '默认只测**承载 SSS 的 RE**；可加用 **PBCH DMRS**；高层指示时还可加 **CSI-RS**（按 38.213 功率缩放线性平均）——但**非 L1-RSRP 用途时不得加 CSI-RS**（§5.1.1 原文 not applicable）。另一条通用纪律：只在**同 SSB 索引+同 PCI** 的信号之间平均，高层指示子集时只测指示集——把不同小区/不同波束的 RE 混在一起平均是口径红账（M73 课 b1/a4）。',
        ref: '38.215#5.1.1' }
    ] },
    'm73:q2': { levels: [
      { q: 'LP-RSSI 为什么 ON 与 OFF 符号都观测？',
        a: 'LP-SS 是 **OOK（开关键控）**信号——ON 符号有信号、OFF 符号只剩底噪；LP-RSSI 在 **OOK ON 与 OFF 符号上都观测**（§5.1.54，all sources 同款）——ON 段给信号+底噪、OFF 段给纯底噪，LP-RSRP÷LP-RSSI 才能同时看到「信号」与「全源背景」。别的 RSSI 只挑特定符号段，这枚连 OFF 段一起算，是全站独一份口径（M73 课 d4）。',
        ref: '38.215#5.1.54' },
      { q: 'LP 双量的户口为什么只有 IDLE/INACTIVE serving cell？',
        a: 'LP-SS 服务于**低功耗唤醒链路**——UE 在 IDLE/INACTIVE 用唤醒接收机监听服务小区的 LP-SS，决定要不要醒过来收 PDCCH；CONNECTED 态不需要唤醒判决，量就没有户口（§5.1.53 Applicable 只写 IDLE/INACTIVE for serving cell）——与 SS-RSRP 的 WUR 分支同一条链路的电平账（M73 课 d4/b1）。',
        ref: '38.215#5.1.53' }
    ] },
    'm73:q4': { levels: [
      { q: 'SGCS 的分集口径为什么是「夹在 min/max 之间」？',
        a: 'SGCS 是**相似度**（定义本体在 38.214 5.2.1.4.6，本规范只落口径）：各分支测出的相似度有高有低，§5.1.55 要求上报值 **no lower than the minimum and no higher than the maximum**——夹逼保真：上报值必须落在实测区间内。功率类量取「不低于任何分支」是保**分集增益下限**，SGCS 取区间是保**取值保真**——两套口径目的不同，别混（M73 课 d4）。',
        ref: '38.215#5.1.55' },
      { q: '这门课在全站测量链里的位置？',
        a: '38.331 管配置与上报——账本与 **L3 滤波工序（5.5.3.2）在 m42**、事件判据在 m3、SL 测量流程在 M72；38.215 管「**量本身怎么算**」——判据吃的每个数、报告装的每个量，户口都在这里（m42 原话「测量模型整图归 38.215/38.300」）。SL 量族 15 叶与 gNB 量族 10 叶留 M74 接力（M73 课 h0/a1/a4）。',
        ref: '38.215#4' }
    ] },
  };
  g.RRC_FOLLOWUPS = {
    get: function (qid) { return Object.prototype.hasOwnProperty.call(F, qid) ? F[qid] : null; },
    keys: function () { return Object.keys(F); },
    size: function () { return Object.keys(F).length; },
    levelTotal: function () { var n = 0; Object.keys(F).forEach(function (k) { n += F[k].levels.length; }); return n; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
