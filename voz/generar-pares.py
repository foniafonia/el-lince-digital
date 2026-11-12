"""Voz de las palabras de Pares mínimos con Piper (es_ES-sharvard-medium, hablante 1 «F», CC-BY 3.0).
Lee las parejas de lince-extra.js (var PARES) y sobrescribe voz/<palabra>.mp3.
Ritmo algo más lento (length-scale 1.45), sin cortes: recorta el silencio con margen, fundido de 8 ms,
mismo volumen en todas (RMS del habla a -20 dBFS, pico máx. -1 dBFS) y MP3 a 64 kbps.
Uso:   python3 voz/generar-pares.py            (todas)
       python3 voz/generar-pares.py rana lana  (solo esas)
"""
import json, pathlib, re, subprocess, sys, tempfile, wave
import numpy as np
AQUI = pathlib.Path(__file__).resolve().parent
RAIZ = AQUI.parent
MODELO = pathlib.Path.home() / 'Developer/voz-logopedia/modelos/es_ES-sharvard-medium.onnx'
LENTO, RMS_DB, PICO_DB = 1.45, -20.0, -1.0
ANTES, DESPUES, PAD_INI, PAD_FIN, FUNDIDO = 0.06, 0.12, 0.10, 0.25, 0.008

def parejas():
    s = (RAIZ / 'lince-extra.js').read_text(encoding='utf-8')
    m = re.search(r"var PARES=(\[\[.*?\]\]);", s)
    return [p[:2] for p in json.loads(m.group(1).replace("'", '"'))]

def sintetiza(texto, wav):
    subprocess.run([sys.executable, '-m', 'piper', '-m', str(MODELO), '-s', '1', '--length-scale', str(LENTO), '-f', str(wav)],
                   input=texto.encode(), check=True, capture_output=True)
    with wave.open(str(wav)) as w:
        sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    return x, sr

def limpia(x, sr):
    v = int(0.01 * sr); n = len(x) // v
    e = np.array([np.sqrt(np.mean(x[i*v:(i+1)*v] ** 2)) for i in range(n)])
    umbral = max(e.max() * 10 ** (-40 / 20), 1e-5)
    voz = np.where(e > umbral)[0]
    a = max(0, voz[0] * v - int(ANTES * sr)); b = min(len(x), (voz[-1] + 1) * v + int(DESPUES * sr))
    y = x[a:b].copy()
    act = np.concatenate([x[i*v:(i+1)*v] for i in voz])
    y *= 10 ** (RMS_DB / 20) / np.sqrt(np.mean(act ** 2))
    pico = np.abs(y).max(); tope = 10 ** (PICO_DB / 20)
    if pico > tope: y *= tope / pico
    f = int(FUNDIDO * sr); r = np.linspace(0, 1, f); y[:f] *= r; y[-f:] *= r[::-1]
    y = np.concatenate([np.zeros(int(PAD_INI * sr)), y, np.zeros(int(PAD_FIN * sr))])
    return y, (b - a) / sr

def guarda(y, sr, mp3):
    with tempfile.TemporaryDirectory() as d:
        wav = pathlib.Path(d) / 'y.wav'
        with wave.open(str(wav), 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
            w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
        subprocess.run(['lame', '--quiet', '-m', 'm', '-b', '64', str(wav), str(mp3)], check=True)

def main():
    if not MODELO.exists(): sys.exit('Falta el modelo Piper: ' + str(MODELO))
    palabras = sorted({w for p in parejas() for w in p})
    if len(sys.argv) > 1: palabras = [w for w in palabras if w in sys.argv[1:]]
    for w in palabras:
        with tempfile.TemporaryDirectory() as d:
            x, sr = sintetiza(w + '.', pathlib.Path(d) / 'x.wav')
        y, dur = limpia(x, sr)
        guarda(y, sr, AQUI / (w + '.mp3'))
        print(f'{w:8s} {dur:.2f} s')
    print(len(palabras), 'palabras')
main()
