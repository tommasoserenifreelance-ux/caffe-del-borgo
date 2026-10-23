# Caffè del Borgo – video

Progetto [Remotion](https://www.remotion.dev) per i reel di Caffè del Borgo (verticale 1080×1920, 30 fps).

Parte dallo stesso stile del reel "iced latte":

- look vintage a contrasto basso, con bloom, grana da pellicola e vignettatura (`src/shared/Clip.tsx`, `src/shared/FilmLook.tsx`)
- titolo impilato in Instrument Serif color crema (`src/shared/Title.tsx`)
- effetti sonori sul titolo: whoosh, pop per parola, chime (`public/sfx/`)

## Come si usa

1. Metti le clip in `public/clips/`.
2. Elenca le inquadrature in `src/CaffeDelBorgo/index.tsx` (`SHOTS`): file, punto di inizio in secondi, velocità e durata in frame.
3. Cambia il titolo in `TITLE_WORDS`.

```console
npm i
npm run dev                                                 # anteprima
npx remotion render CaffeDelBorgo out/caffe-del-borgo.mp4   # export
```
