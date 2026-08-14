# Artwork

Ten files go here — five illustrations, two crops each. Sawan is in; the other
four are still to come.

```
sawan-wide.webp     sawan-tall.webp       ✓ in  (+ .jpg of each)
peke-wide.webp      peke-tall.webp
mehendi-wide.webp   mehendi-tall.webp
peengh-wide.webp    peengh-tall.webp
giddha-wide.webp    giddha-tall.webp
```

Sawan's wide crop had 220px trimmed off the right edge to remove a generator
watermark, and the frame was squared back to 16:9 by trimming evenly top and
bottom. Its tall crop is a 9:16 slice centred on the storm and the courtyard,
chosen so the bottom of the frame stays quiet where the copy sits.

- **wide** is 16:9, used whenever the viewport is landscape.
- **tall** is 9:16, used whenever the viewport is portrait — phones, and
  tablets held upright. It must be the illustration *reframed* for a vertical
  composition, not the wide one cropped or scaled.
- Ship the `.jpg` alongside each `.webp`. The JPEG is the `<img>` source and the
  fallback for anything that cannot decode WebP.
- Compress hard. Ten full-bleed images is the entire weight of this site.
- **No text or lettering in the artwork.** Every word on the page is HTML.

Leave the lower third of the tall crops relatively quiet — on mobile that is
where all the copy and the player sit.

Once a section's files are here, fill in its `artworkWide` and `artworkTall` in
`js/sections.js`. Availability is per section — a section with empty fields
draws its palette gradient and requests nothing, so the console stays clean
while the others are still being painted.

Alt text for each illustration is already written in `js/sections.js`. Update it
there if your artwork shows something different from what it describes.

After adding one, re-check text contrast over it. The scrims are tuned against
real pixels, not guessed — see the README.
