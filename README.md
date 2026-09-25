<div align="center">

<h1>HarnessPAI</h1>
<h3>An Evolving Harness for Physical AI</h3>

<p><strong>Execute programs. Learn from outcomes. Evolve the harness and models.</strong></p>
<p>Darwin Agent Team</p>

<p>
  <a href="https://darwin-agent.github.io/HarnessPAI/"><img alt="Homepage" src="https://img.shields.io/badge/Homepage-HarnessPAI-ff6900?style=flat"/></a>
  <a href="https://arxiv.org/abs/2609.29166"><img alt="Paper" src="https://img.shields.io/badge/Paper-arXiv-3b82f6?style=flat"/></a>
  <img alt="Code: Coming soon" src="https://img.shields.io/badge/Code-Coming%20soon-f59e0b?style=flat"/>
</p>

<p>
  <a href="https://darwin-agent.github.io/HarnessPAI/">Homepage</a> •
  <a href="https://arxiv.org/abs/2609.29166">Paper</a> •
  <a href="#overview">Overview</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#results">Results</a> •
  <a href="#release-status">Release Status</a> •
  <a href="README_zh.md">中文文档</a>
</p>

</div>

<a id="overview"></a>
## 🔭 Overview

> **Physical intelligence depends not only on the action model, but also on the executable system that organizes, checks, and improves its behavior.**

**HarnessPAI** is a model- and embodiment-agnostic harness for Physical AI. It uses **code as an executable and evolvable interface** to coordinate perception, geometric reasoning, action primitives, and execution checks, rather than asking an action model to handle the entire task on its own.

The framework separates two timescales:

- **Execute within a rollout.** A fixed task program grounds targets, invokes perception and action primitives, and checks outcomes before proceeding. Once selected, the program runs without online high-level LLM deliberation.
- **Evolve across rollouts.** A coding agent uses execution feedback to diagnose failures, revise candidate programs, and validate them before promoting successful code into a reusable library.
- **Reuse what works.** Structured skill memory captures failure–repair experience for later tasks, while successful trajectories can become demonstrations for downstream model training.

<p align="center">
  <img src="assets/images/intro.webp" alt="HarnessPAI overview: seven experimental settings, four embodiment categories, and five downstream interfaces" width="900"/>
</p>

### Highlights

- 🧩 **One harness, multiple backends.** Evaluated with VLAs, WAMs, grasp primitives, direct control APIs, and a PPO-trained policy across seven experimental settings.
- 🎯 **Stronger execution without retraining the action model.** The main experiments improve LIBERO-PRO success by **61.6 percentage points** and RoboCasa Atomic-Seen success by **27.2 points** over their respective base models.
- 🧠 **Reusable repair experience.** Skills are organized by workflow node and reference maintained implementations, rather than duplicating executable code in isolated notes.
- 🔁 **From execution to training data.** In a separate downstream experiment, fine-tuning π₀.₅-LIBERO on successful harness trajectories improves LIBERO-PRO success by **38.8 points**.


<a id="architecture"></a>
## 🏗️ Architecture

<p align="center">
  <img src="assets/images/framework.webp" alt="HarnessPAI architecture: task memory, structured skill memory, executable code memory, and a primitive library" width="900"/>
</p>

### Memory and primitives

| Component | Role |
| --- | --- |
| **Task Memory** | Stores known task descriptions and supports retrieval of previously evolved programs. |
| **Structured Skill Memory** | Organizes failure–repair knowledge around workflow nodes such as approach, grasp, and transport. |
| **Executable Code Memory** | Stores validated task programs and the implementations referenced by repair skills. |
| **Primitive Library** | Provides perception, geometric control, and learned action capabilities that task programs can compose. |

### Execute, diagnose, revise, validate

1. **Retrieve or build a task program.** Reuse validated code for a known task; otherwise, use the task instruction, environment information, success condition, and relevant skills to construct a candidate.
2. **Run the fixed program.** Coordinate grounding, motion, learned actions, and predefined checks. In the LIBERO hybrid rollout, code handles grounding, approach, and transport, while the VLA handles grasp and placement.
3. **Use feedback between rollouts.** Inspect diagnostics and rollout videos, retrieve matching repair skills, and revise an isolated candidate. Unverified edits do not overwrite the validated code library.
4. **Validate and retain experience.** Promote candidates that pass the required validation, and consolidate reusable repair knowledge into skill memory.

Workflow-graph extraction from demonstration videos, action-model capability assessment, and perception initialization are **optional preparation steps**, enabled when the task and available inputs call for them.

> **“Open-loop” refers to the program level, not to blind execution.** The program stays fixed within a rollout, but it can still use current observations, feedback control, predefined checks, and recovery logic. Program edits happen between rollouts. Avoiding online high-level LLM deliberation does **not** mean avoiding perception or action-model inference.

See **Section 4 of the [paper](https://arxiv.org/abs/2609.29166)** for the full framework and evolution mechanism.


<a id="results"></a>
## 📊 Results

### Main task-completion results

Success rates are reported in **%**; gains are **absolute percentage points (pp)**. The action backends remain frozen during harness evolution.

| Benchmark / evaluated subset | Reference method | Reference | HarnessPAI | Gain | Paper |
| --- | --- | ---: | ---: | ---: | --- |
| **LIBERO** — Spatial, Object, Goal | π₀.₅-LIBERO | 96.9 | **98.1** | **+1.2 pp** | Table 4 |
| **LIBERO-PRO** — three suites × Swap / Task | π₀.₅-LIBERO | 34.9 | **96.5** | **+61.6 pp** | Table 7 |
| **RoboCasa Target50** — Atomic-Seen, 18 tasks | WorldDreamer | 65.0 | **92.2** | **+27.2 pp** | Table 5 |
| **robosuite** — seven manipulation tasks | ASPIRE | 81.0 | **96.3** | **+15.3 pp** | Table 6 |

**Evaluation notes.** LIBERO and LIBERO-PRO evaluate each task over 50 seeds, including the 15 seeds used for program evolution and 35 additional seeds. RoboCasa evaluates WorldDreamer and HarnessPAI under the same 20-seed setting. The robosuite ASPIRE baseline is taken from prior work, not a controlled same-backend ablation. See the paper for complete protocols, per-task results, and differences between reference methods.

### Seven experimental settings

| Setting | Embodiment / task | Backend used in the paper |
| --- | --- | --- |
| **robosuite** | Single-arm and bimanual manipulation | GraspNet |
| **LIBERO** | Language-conditioned tabletop manipulation | π₀.₅-LIBERO |
| **LIBERO-PRO** | Manipulation under object-position and instruction perturbations | π₀.₅-LIBERO; DreamZero in the transfer experiment |
| **RoboCasa** | Household tasks with a mobile manipulator | WorldDreamer |
| **BEHAVIOR-1K** | Household navigation and object pickup | GraspNet |
| **VacuSim** | Robot-vacuum cleaning and coverage | Direct control API |
| **MicroDuck** | Legged locomotion and drift correction | PPO-trained Walker policy |

These settings use task-appropriate metrics: manipulation success, navigation and pickup completion, cleaning coverage, or locomotion error. They are not combined into a single aggregate score.

### Beyond the main results

- **Cross-model transfer.** A harness evolved with π₀.₅ on LIBERO-Object is applied unchanged to DreamZero. On the LIBERO-PRO Object suite, success rises from **0.6% to 73.4%** under Swap and from **9.6% to 84.4%** under Task, without re-evolving the harness (Table 15).
- **Lower online deliberation overhead.** On LIBERO-Goal Task 1, serial execution is **23.1× faster under Swap** and **18.4× faster under Task** than the evaluated serial Harness VLA baseline (Figure 21). These are task-specific measurements, not an across-benchmark speedup. The fixed program incurs no online high-level LLM API charge; perception, action inference, simulation, hardware, and program development still have costs.
- **Trajectories for post-training.** In a **separate experiment**, successful harness rollouts are filtered by the environment's success check and used to fine-tune π₀.₅-LIBERO, raising LIBERO-PRO success from **34.9% to 73.7% (+38.8 pp)**. The result uses the best checkpoint within 30,000 training steps; per-task seeds 0–39 supply the additional training data and seeds 40–49 are held out for evaluation (Section 5.6). The harness is not re-evolved around the improved model in this experiment.

Visit the **[project homepage](https://darwin-agent.github.io/HarnessPAI/)** for videos, qualitative comparisons, and additional analysis.

### Scope

HarnessPAI targets **repeated-task settings** in which a program can be developed, validated, and reused. Its effectiveness depends on perception quality, usable action primitives, a checkable success condition, and the evolution budget. It organizes existing physical competence; it does not create missing low-level abilities or establish a universal one-shot solution to unseen tasks.


<a id="release-status"></a>
## 🚧 Release Status

| Resource | Status |
| --- | --- |
| Project homepage and demonstrations | **Available** |
| Paper PDF | **Available** |
| Research code | **Being organized; not yet publicly released** |
| Installation and reproduction instructions | **Not yet available** |

This is currently a **paper and project-page repository**, not an installable framework release. Code-release updates will be posted here. We do not provide provisional installation commands or unverified API examples.


<a id="paper-and-citation"></a>
## 📄 Paper & Citation

**HarnessPAI: An Evolving Harness for Physical AI**<br/>
Darwin Agent Team

**[Read the paper](https://arxiv.org/abs/2609.29166)** · **[Explore the project](https://darwin-agent.github.io/HarnessPAI/)**

```bibtex
@article{wang2026harnesspai,
  title   = {{HarnessPAI}: An Evolving Harness for Physical AI},
  author  = {Xin Wang and Wenhao Wu and Menghao Zhang and Zhi Wang and Kun Shao and Jian Luan and Yang Li and Qing Li and Shangding Gu and Huichi Zhou and Shuqing Shi and Fei Ni and Shuo Lu and Weicheng Meng and Kang Li and Jin Wu and Kang Zhao and Shangmin Guo and Gen Li and Yongqiang Tang and Zhizhong Zhang and Yuan Xie and Heng Qu},
  journal = {arXiv preprint arXiv:2609.29166},
  year    = {2026}
}
```


<div align="center">
  <strong>HarnessPAI</strong> — <em>Execute programs. Learn from outcomes. Evolve the harness and models.</em>
  <br/>
  <sub>By the <strong>Darwin Agent Team</strong></sub>
</div>
