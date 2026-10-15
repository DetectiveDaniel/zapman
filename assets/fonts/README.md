# Local fonts

## Zapman Lexie

`zapman-lexie.ttf` is a local outline font reconstructed from the letter-grid image supplied for the Zapman settings. The small reference letters are interpolated into continuous contours with quadratic curves, rather than enlarged pixel squares. It includes uppercase and lowercase letters, numbers and punctuation, retaining the chart's individual letter shapes.

This is a Zapman reconstruction of the supplied chart, not the commercial Lexie Readable font. Version 2 replaces the original pixel outlines with smooth lettering.

The font is loaded by `display-settings.css` when **Lexie Font** is enabled, so it works without a font service or network request. Browser font fallback handles characters outside the font's character set.

## Chewy

`chewy/Chewy-Regular.ttf` is the unmodified [Chewy font from Google Fonts](https://github.com/google/fonts/tree/main/apache/chewy), distributed under the Apache License 2.0. Its licence is included in `chewy/LICENSE.txt`.

The picker heading uses this local, chunky, rounded font as a freely licensed alternative to Wedges. The Lexie Font setting still overrides it when enabled.
