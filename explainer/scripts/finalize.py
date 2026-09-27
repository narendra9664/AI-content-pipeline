# Two-pass EBU R128 loudness normalisation for social (-14 LUFS, -1.5 dBTP); video is copied.
# usage: FFMPEG=/path/to/ffmpeg python3 scripts/finalize.py in.mp4 out.mp4
import json, os, re, subprocess, sys

ff = os.environ.get('FFMPEG', 'ffmpeg')
src, dst = sys.argv[1], sys.argv[2]
target = 'I=-14:TP=-1.5:LRA=11'
p = subprocess.run([ff, '-hide_banner', '-i', src, '-af', f'loudnorm={target}:print_format=json', '-f', 'null', '-'],
                   capture_output=True, text=True)
m = json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}', p.stderr).group(0))
af = (f"loudnorm={target}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
      f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
subprocess.run([ff, '-hide_banner', '-loglevel', 'error', '-y', '-i', src, '-c:v', 'copy', '-af', af, '-ar', '48000',
                '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', dst], check=True)
print(f"{os.path.basename(dst)}: input {m['input_i']} LUFS / {m['input_tp']} dBTP -> -14 LUFS")
