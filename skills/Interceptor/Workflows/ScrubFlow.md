# ScrubFlow — motion proof the still misses

## Why stills fall short

Interceptor frames freeze an instant. A juddering fade, a dropped transition, a flickering menu, a skeleton that never settles — none survive a still. ScrubFlow films the journey as a short clip, then cuts viewable scored frames from it, so motion faults get caught ahead of any "works" claim.

Algorithm Verification Rule 1 makes it binding: a **motion/interaction ISC** (animation, transition, drag, hover-state, scroll conduct, loading/skeleton states, multi-step journeys) closes SOLELY on a ScrubFlow gallery or a VerifyDeploy flow-gallery — never one frame.

## The cutter: `Tools/FrameScrub.ts`

Clips become viewable, graded evidence. Two cuts:

```bash
# survey — N evenly-spaced frames across the whole clip (overview)
bun Tools/FrameScrub.ts <recording> survey --frames 8

# scrub — dense frames at F fps inside a ±window around a suspect instant,
# each SSIM-graded against its predecessor; the largest shift is flagged
bun Tools/FrameScrub.ts <recording> scrub --at 4.2 --window 1.5 --fps 8
```

Yield: PNG frames plus `manifest.json` (`{video, mode, frame_count, flagged_frame, min_ssim, extracted:[{frame, path, timestamp_s, ssim_to_prev}]}`). **Survey tells "the journey broadly holds"; scrub tells "the animation at 4.2s paints clean." The SSIM flag aims the model at the frame carrying the most motion, not twelve near-twins.**

Close a motion ISC by Reading the flagged frame (plus neighbors) and citing the manifest path — `VerificationGate` (T2) takes a `frames/…/manifest.json` as flow-exercised evidence.

## Sourcing the clip

**Road A — supply your own (live today).** Any `.webm` / `.mov` / `.mp4` — QuickTime grabs, Descript exports, recordings already owned — feeds FrameScrub directly. Fully working now.

**Road B — self-filming browser journeys (next increment, designed not shipped).** Fit a `MediaRecorder` onto the extension's standing tab `MediaStream` (`offscreen.js` `startCapture()` already opens the stream for stills; `captureFrame()` lifts one frame — filming taps the same stream). Output is `.webm` (Chrome MediaRecorder speaks webm/vp8-vp9; mp4 muxing wavers — never presume mp4). `screencapture` stays banned; this films in-page with zero CDP fingerprint, per Interceptor's way.

## Edges

- **Foregrounded-tab demand.** Chrome throttles tab capture on backgrounded tabs — background filming can yield frozen or junk frames that then wrongly clear the gate. ScrubFlow films with the target tab foregrounded; where focus can't be sworn, grade "filmed, not scrub-cleared," never claim clean.
- **Cite frames, not files.** "video.mp4 exists" proves nothing painted right. The evidence is the viewed frames — the manifest.
- **webm over mp4.** MediaRecorder emits webm. FrameScrub eats any ffmpeg-readable container; just never hardcode mp4 on Road B.
- **Scrub animations, don't survey them.** Even survey spacing across a 2s span can straddle a 0.4s judder. Dense-fps scrub around the suspect instant serves anything sub-second.
