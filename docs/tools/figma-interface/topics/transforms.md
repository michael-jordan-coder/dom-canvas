# Rotation and aspect ratio — panel transactions

Observed2026-10-13, Chrome light UI, instance15:62. Baseline X-163/Y-67,
W200/H125, rotation0, aspect ratio unlocked. Blue variable-bound Fill.

## TR01 — Rotation changes position, not the displayed local dimensions

| Action | X | Y | Rotation | W/H |
| --- | --- | --- | --- | --- |
| Baseline | -163 | -67 | 0 | 200/125 |
| Rotate90 right button | -126 | -105 | -90 | 200/125 |
| Enter45 in Rotation | -178.4 | -119.9 | 45 | 200/125 |
| Enter0 in Rotation | -163.5 | -67.5 | 0 | 200/125 |

This distinguishes displayed local size from the rotated bounding box. The
half-pixel position difference on return to0 is observed, but its rounding/origin
cause is not established. Do not claim exact center-preserving or lossless
round-trip geometry from this case alone. Restore X-163/Y-67 explicitly afterward.

Evidence: [baseline](../evidence/transforms/01-baseline.txt),
[90](../evidence/transforms/02-rotate90.txt),
[screenshot](../evidence/transforms/02-rotate90.png),
[45](../evidence/transforms/03-angle45.txt),
[0](../evidence/transforms/04-angle0.txt).

## TR02 — Aspect ratio lock couples dimensions

Enable Lock aspect ratio. Width320 +Enter changes Height125→200, preserving the
200:125 ratio. The checkbox becomes checked; its adjacent generic label reads
Unlock aspect ratio although the accessible checkbox name remains Lock aspect
ratio. Enter Width200 restores Height125; disable the checkbox afterward.

Evidence: [locked edit](../evidence/transforms/05-ratio-width320.txt),
[restored](../evidence/transforms/06-restored.txt).

Remaining: flip with asymmetric content, rotated resize, nested coordinate spaces,
rotation expressions/normalization, multi-selection rotation/scale, align/distribute,
constraints, Undo and exact canvas geometry. The fixture ends200 ×125, angle0,
position-163/-67, ratio unlocked. No conclusions about internal transforms.
