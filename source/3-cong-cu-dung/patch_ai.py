#!/usr/bin/env python3
"""Gắn mô-đun tăng độ chính xác AI vào bản dựng.
Chạy SAU patch_pwa.py và patch_cloud.py:  python3 patch_ai.py <index.html>"""
import sys, pathlib
here = pathlib.Path(__file__).resolve().parent
f = pathlib.Path(sys.argv[1]); s = f.read_text(encoding='utf-8')
def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, f'cần {n} chỗ, thấy {c}: {a[:70]!r}'
    s = s.replace(a, b)
js = (here / 'ai' / 'ai-boost.js').read_text(encoding='utf-8') + '\n' + (here / 'ai' / 'ai-quality.js').read_text(encoding='utf-8') + '\n' + (here / 'ai' / 'ai-data.js').read_text(encoding='utf-8')
css = (here / 'ai' / 'ai-boost.css').read_text(encoding='utf-8')
# cấu hình gọi Gemini: kết quả ổn định, đọc ảnh độ phân giải cao
rep("generationConfig:{maxOutputTokens:32768,", "generationConfig:{maxOutputTokens:32768,...(window.__AIX?window.__AIX.gen(model,o):{}),")
rep("if(r.status===400&&tc&&/thinking/i.test(m)){G_TC=false;return geminiCall(input,o)}",
    "if(r.status===400&&window.__AIX&&window.__AIX.genFail(m))return geminiCall(input,o);\n    if(r.status===400&&tc&&/thinking/i.test(m)){G_TC=false;return geminiCall(input,o)}")
rep("</style>", css + "\n</style>", 1) if s.count("</style>") == 1 else rep("</head>", "<style>\n" + css + "\n</style>\n</head>")
rep("/* ---------- Khởi động ---------- */", js + "\n/* ---------- Khởi động ---------- */")
f.write_text(s, encoding='utf-8')
print('OK', f)
