# Interim coverage audit — 2026-10-13

This is a gap review, **not the final completion audit**. Source of requirements:
[Design panel goal](DESIGN_PANEL_GOAL.md). All17 coverage rows remain partial.
Topic count and passing local-link checks are not coverage measures.

This pass reread the goal, components, bindings and transforms topic records,
then added a live source/instance propagation case. It did not re-execute every
older case or validate every screenshot. Those remain required for final audit.

## Priority gaps selected from the current requirements

| Requirement | Existing evidence scope | Missing proof / next experiment |
| --- | --- | --- |
| Components | [Propagation](topics/component-propagation.md) now proves radius inheritance, override and Reset others with Fill preservation; [component contexts](topics/components.md) prove variants/reset width | Create and bind actual Text/Boolean/instance-swap properties; nested override propagation and reset; exact property-row UI |
| Styles/variables | [Bindings](topics/bindings.md) prove one color style/variable creation and propagation | Local style value editing, detach preserving value, aliases/modes, scope/type filtering, text/effect styles |
| Transforms | [Transforms](topics/transforms.md) proves rotation/position coupling and aspect lock; [alignment](topics/alignment.md) covers equal-size row cases | Asymmetric flip, rotated resize, all axes and unequal-size alignment; rounding cause |
| Constraints | [Constraint resizing](topics/constraints-resize.md) proves Left/Right/Center for an out-of-flow text child | Stretch/Scale enabled fixture and actual resize; vertical axes; constraint UI measurements |
| Canvas synchronization | Panel edits/reflow screenshots across current topics | Direct canvas move/resize/handle changes with panel values and focus; selection marquee and text ranges across contexts |
| Object contexts | Existing primitive/group/section/component inventories | Line/Arrow and vector individual points/handles; ancestor+descendant selection; compare unavailable fields with rendering |
| Layout and sizing | Existing Wrap/Grid/min/max/clipping cases | Baseline/stacking/auto spacing, manual grid placement/row spans, bounds conflicts and height bounds, flexible unequal children |
| Text | Existing family/tracking/case/underline/trim/list cases | Multi-paragraph content, selected-range edits, direction, mixed typography, font fallbacks, complete decoration history |
| Paint/stroke/effects | Existing solid/gradient/multiple paints and effect types except Shader | Image fills, ordering/cancellation, multiple strokes/sides/joins, Shader, meaningful background-blur/Glass backdrop tests |
| Input and shell UI | Width lifecycle, control metrics, [Type UI](topics/type-ui.md) focus/tab states | Per-family hover/focus/typing/invalid/mixed/bound matrix, viewport/scroll/collapse, animation timing; current metrics cannot prove all states |

## Audit corrections applied

- The goal's Immediate next batch still described the first parent/child experiment,
  already performed. Replace it with the priority queue above.
- Selection-context summary said heterogeneous contexts were entirely open despite
  [mixed-types](topics/mixed-types.md) evidence. Correct that summary; retain
  ancestor/descendant and unsupported-context gaps.
- Component source propagation was genuinely missing; the new live case closes
  only the radius/Fill-preservation subset. Nested properties remain open.
- [Fill recovery](topics/text-list.md) closed the historical Fixed-versus-Fill
  fixture gap. Preserve failed-attempt records and the later verified correction.

## Final-audit requirements still outstanding

For every required behavior and applicable visual state, record a concrete case
with before/action/after, raw evidence, correct context and confidence. Check
contradictions, stale accessible names, transient snapshots, fixture drift, and
missing image captures. Then review all local links, claims, final fixture and
remaining limitations. A case marked open/inconclusive cannot count as achieved.
This interim note does not replace the complete requirement-to-evidence ledger.
