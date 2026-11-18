from PIL import Image, ImageDraw, ImageFont
import os, io

W, H = 1654, 2339           # A4 @ 200dpi
PAPER = (236, 234, 228)
INK = (11, 11, 11)
MUTED = (95, 93, 88)

F = '/usr/share/fonts/pickle-hwp/'
sans = lambda s: ImageFont.truetype(F+'NotoSansCJKkr-Regular.otf', s)
mono = lambda s: ImageFont.truetype(F+'NotoSansMonoCJKkr-Regular.otf', s)
serif = lambda s: ImageFont.truetype(F+'NotoSerifCJKkr-Regular.otf', s)

ML, MR, MT, MB = 170, 170, 150, 150
CW = W - ML - MR

SONGS = [
 ("01", "HUMANO", """(Louder. Please. Turn it up)

Si eres humano
Puedes hacerlo
Todos lo tienen
Es automático

It's not for the chosen ones
Everybody got it
Think a little
Use a little

It's not for the chosen ones
Everybody got it
Think a little
Use, Use a little

Use that little brain of yours
You got a brain to use
Use that little brain of yours
You got a brain to use 

o-yeah

Think a little
Use a little
Think a little
Use a little
Think a little
Use a little
Think a little
Use a little

Si eres humano
Puedes hacerlo
Todos lo tienen
Es automático

Si eres humano
Puedes hacerlo
Todos lo tienen
Es automático"""),
 ("02", "GOTTA FIX MY BANGS", """Bring me scissors
I gotta fix my bangs 
Five more minutes 
Till I'm on my way 

지기 싫어 나 오늘
아무한테도 지기 싫어 나 오늘

엄마가 준 거 낭비 낭비 25yrs
걱정 개같이 하다 finally I'm here
나 바뻐 taking pictures, click bait here
feel like I've turned into a mutant
예쁘게 좀 봐 this potent

첨부터 알았다구
거울 못보는 건 아니래두
몰래 청불 영화를 보구
오른쪽 뇌가 녹았다구

You know me
I ain't never really flexin'
But you know what?
You know me
I was born a bad boy

You know, you know bad boy
You know, bad boy
Bad boy
You know, bad boy

Bring me scissors
I gotta fix my bangs 
Five more minutes 
Till I'm on my way 

지기 싫어 나 오늘
아무한테도 지기 싫어 나 오늘

You know me, you you
You know me, oh
You know me, you you
You know me, yay

You know me, you you
You know me, oh
You know me, you you
You know me, bad boy"""),
 ("03", "HIGH LIFE", """When I was a little girl
All I ever want is high life

Standing here as a woman
Still want nothing but the high life

Plz say that my music smells like money
Say I would cash out, members only
Promise you won't leave me when I make it
I can't behave but I'll buy you some chanelly

I might be the worst
but money makes you bust
난 기억하기 싫어 어제는
You broke my heart
act like I'm so tough
이 짓이 지겨워 난 이제
나 돈벌러 가야돼
넌 입을 닫길 바래

I might be the worst
But I bet I'm the only one
Who makes you feel this way (way)

Makes you feel this way
Makes you feel this way
Makes you feel this way
This way

Plz say that my music smells like money
Say I would cash out, members only
Promise you won't leave me when I make it
I can't behave but I'll buy you some chanelly

I might be the worst
but money makes you bust
난 기억하기 싫어 어제는
You broke my heart
act like I'm so tough
이 짓이 지겨워 난 이제
나 돈벌러가야돼
넌 입을 닫길 바래"""),
 ("04", "KNOCK ME OUT", """Bitch you ain't got shit on me
할 말 있음 해 빨리
Everybody be on my D
Trying so hard,
you can not sit with me

나 엿 먹이면
I might fuck your daddy
나 걱정할 시간
니 꼬라지나 
그만 좀 불러제껴
나 관심 없으니까
니네들처럼 될까봐
밖에 나가기 무서워

Knock me out before I wild out
Knock me out before I wild out
Knock me out before I wild out
Knock me out before I cranked up

Bitch you ain't got shit on me
할 말 있음 해 빨리
Everybody be on my D
Trying so hard,
you can not sit with me

Bitch you ain't got shit on me
Bitch you ain't got shit on me

Don’t try to mess with me, huh
Unless you can make me come
My shit, 'no protocol zone'
Go and mute that trashy song

Don’t try to mess with me, huh
Unless you can make me come
My shit, 'no protocol zone'
Go and mute that trashy song

Uh, now we're talking
Ughhhh, now we're talking

Knock me out before I wild out
Knock me out before I wild out
Knock me out before I wild out
Knock me out before I cranked up

Bitch you ain't got shit on me
할 말 있음 해 빨리
Everybody be on my D
Trying so hard,
you can not sit with me

Bitch you ain't got shit on me
Bitch you ain't got shit on me"""),
 ("05", "BRATTY TEEN DAUGHTER", ""),
]

CREDITS = ["Composed by Lemac, NECTA","Lyrics by NECTA","Arranged by Lemac",
           "synth, drum, perc, bass by Lemac","Mixed by Lemac, omnostereo","Mastered by omnostereo"]

pages = []

def new_page(song_label="", page_no=None):
    img = Image.new('RGB', (W, H), PAPER)
    d = ImageDraw.Draw(img)
    # running header
    d.text((ML, MT), "NECTA — GOTTA FIX MY BANGS (EP) / LYRICS", font=mono(19), fill=MUTED)
    d.line([(ML, MT+42), (W-MR, MT+42)], fill=(11,11,11), width=2)
    pages.append([img, d])

def footer(page_no):
    img, d = pages[-1]
    d.text((W-MR-60, H-MB+30), "%02d" % page_no, font=mono(19), fill=MUTED)
    d.text((ML, H-MB+30), "NECTA", font=mono(19), fill=MUTED)

# ---------- cover page ----------
new_page()
img, d = pages[-1]
y = MT + 150
d.text((ML, y), "NECTA", font=sans(34), fill=MUTED)
y += 70
d.text((ML, y), "GOTTA FIX MY BANGS", font=serif(112), fill=INK)
y += 130
d.text((ML, y), "(EP)", font=serif(72), fill=INK)
y += 150
d.text((ML, y), "LYRICS", font=mono(34), fill=INK)
y += 120
d.line([(ML, y), (ML+280, y)], fill=INK, width=3)
y += 60
d.text((ML, y), "JAN 22, 2027", font=mono(24), fill=MUTED)
y += 120
d.text((ML, y), "SEOUL, KR", font=mono(24), fill=MUTED)

# track index
y = H - MB - 420
d.line([(ML, y), (W-MR, y)], fill=(11,11,11), width=2)
y += 40
for num, title, _ in SONGS:
    d.text((ML, y), num + ".", font=mono(26), fill=MUTED)
    d.text((ML+90, y), title, font=sans(34), fill=INK)
    y += 74
footer(1)

# ---------- lyric pages ----------
page_no = 2
guessed = []

def wrap(text, font, maxw):
    if not text.strip():
        return [""]
    words = text.split(" ")
    out, cur = [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if font.getlength(t) <= maxw:
            cur = t
        else:
            if cur:
                out.append(cur)
            cur = w
    if cur:
        out.append(cur)
    return out

TOP_START = MT + 100
BOTTOM = H - MB - 250

def wrap(text, font, maxw):
    if not text.strip():
        return [""]
    words = text.split(" ")
    out, cur = [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if font.getlength(t) <= maxw:
            cur = t
        else:
            if cur:
                out.append(cur)
            cur = w
    if cur:
        out.append(cur)
    return out

TITLE = sans(44)
SMALL = mono(21)

for num, title, text in SONGS:
    new_page()
    img, d = pages[-1]
    y = TOP_START
    d.text((ML, y), num + ".", font=SMALL, fill=MUTED)
    y += 38
    d.text((ML, y), title, font=TITLE, fill=INK, stroke_width=1, stroke_fill=INK)
    y += 92
    d.line([(ML, y), (W-MR, y)], fill=(11,11,11), width=2)
    y += 42
    top = y
    usable = BOTTOM - top

    # measure with a reference font, then fit the page
    slots = 0
    for raw in text.split("\n"):
        slots += 1 if raw.strip() else 0.55
    lh = min(42, max(26, usable / max(slots, 1)))
    body = sans(int(lh * 0.66))

    yy = top
    for raw in text.split("\n"):
        if not raw.strip():
            yy += int(lh * 0.55)
            continue
        for line in wrap(raw, body, CW):
            d.text((ML, yy), line, font=body, fill=INK)
            yy += lh
    cy = H - MB - 210
    d.line([(ML, cy), (W-MR, cy)], fill=(11,11,11), width=2)
    cy += 26
    d.text((ML, cy), "CREDITS", font=mono(17), fill=MUTED)
    cy += 34
    for line in CREDITS:
        d.text((ML, cy), line, font=mono(21), fill=INK)
        cy += 31
    footer(page_no)
    page_no += 1

imgs = [p[0] for p in pages]
out = '/workspace/.deploy-clone/assets/NECTA-GOTTA-FIX-MY-BANGS-LYRICS.pdf'
imgs[0].save(out, "PDF", resolution=200, save_all=True, append_images=imgs[1:])
imgs[0].save('/workspace/tool-results/lyrics-page1.png')
imgs[1].save('/workspace/tool-results/lyrics-page2.png')
imgs[2].save('/workspace/tool-results/lyrics-page3.png')
imgs[5].save('/workspace/tool-results/lyrics-page6.png')
print("pages", len(imgs), "size", round(os.path.getsize(out)/1024/1024,2), "MB")
