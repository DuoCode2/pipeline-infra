/**
 * Next.js config for DuoCode static export.
 *
 * ⚠️  DO NOT MODIFY — this config is validated by the pipeline.
 *     Adding webpack aliases, React resolve overrides, or custom loaders
 *     WILL break React.cache and cause build failures.
 *     If you need custom config, add it to CLAUDE.md as a known pattern first.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
};

module.exports = nextConfig;
