# Hero image slot

The home hero carousel includes a **Leadership & Vision** slide with a drop-in
portrait slot.

To show an official photograph (e.g. the Hon'ble Chief Minister of Karnataka):

1. Add a **licensed, official** image at:

   ```
   public/hero/cm-portrait.jpg
   ```

   Recommended: ~1200×900px (4:3), optimized JPG/WebP, under ~300KB.

2. (Optional) To show a caption with the name/designation, edit the
   `leadership` slide in `src/components/home/HeroSection.tsx` and set its
   `portraitCaption` field.

If no image is present, the slide gracefully renders a neutral emblem fallback
with the line "Government of Karnataka" and no name caption — so nothing
misleading is shown over an empty frame.

> Do not commit copyrighted or unlicensed imagery. Only use photos you are
> authorized to publish.
