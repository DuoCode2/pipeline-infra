import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const SIZES = [320, 640, 960, 1280];
const WEBP_QUALITY = 80;

export interface ImageManifest {
  [sourceName: string]: {
    [variant: string]: string; // e.g., "320w" → "maps-1-320.webp"
  };
}

/**
 * Optimize all JPEG/PNG images in a directory.
 * Generates WebP variants at 4 sizes for each source image.
 * @param inputDir - directory containing source images
 * @returns image manifest mapping source names to variants
 */
export async function optimizeImages(
  inputDir: string
): Promise<ImageManifest> {
  if (!fs.existsSync(inputDir)) {
    throw new Error(`Input directory not found: ${inputDir}`);
  }

  const files = fs.readdirSync(inputDir).filter((f) =>
    /\.(jpg|jpeg|png)$/i.test(f)
  );

  const manifest: ImageManifest = {};

  for (const file of files) {
    const filePath = path.join(inputDir, file);
    const baseName = path.parse(file).name;
    manifest[baseName] = {};

    for (const width of SIZES) {
      const outName = `${baseName}-${width}.webp`;
      const outPath = path.join(inputDir, outName);

      try {
        await sharp(filePath)
          .resize(width, undefined, { withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY })
          .toFile(outPath);

        manifest[baseName][`${width}w`] = outName;
      } catch (err) {
        console.warn(`Failed to optimize ${file} at ${width}w:`, (err as Error).message);
      }
    }

    // Keep original reference
    manifest[baseName]['original'] = file;
    console.log(`Optimized: ${file} → ${Object.keys(manifest[baseName]).length - 1} WebP variants`);
  }

  // Write manifest
  const manifestPath = path.join(
    path.dirname(inputDir),
    'image-manifest.json'
  );
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Manifest saved to ${manifestPath}`);

  return manifest;
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const getArg = (name: string, fallback: string) => {
    const idx = args.indexOf(`--${name}`);
    return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
  };

  const inputDir = getArg('input', 'output/test/public/images');

  optimizeImages(inputDir)
    .then((manifest) =>
      console.log(`\nProcessed ${Object.keys(manifest).length} images`)
    )
    .catch((err) => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}
