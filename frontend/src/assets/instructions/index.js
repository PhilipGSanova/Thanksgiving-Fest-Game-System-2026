// Stall instruction PDF lookup.
//
// Drop one PDF per Game stall inside this folder, named after the stall's
// name (spaces/special characters replaced with dashes, lowercased). For
// example, a stall named "Ring Toss" becomes:
//
//     ring-toss.pdf
//
// The PDFs are registered at build time via Vite's import.meta.glob so the
// correct file is bundled and resolved no matter the exact deploy path.

const files = import.meta.glob('./*.pdf', {
  eager: true,
  query: '?url',
  import: 'default',
});

const normalizedFileNames = Object.keys(files).reduce((lookup, filePath) => {
  const fileName = filePath.split('/').pop().replace(/\.pdf$/i, '');
  lookup[fileName.replace(/[^a-z0-9]/gi, '').toLowerCase()] = filePath;
  return lookup;
}, {});

// Convert a stall name like "Ring Toss!" into a filename-safe slug:
//   "Ring Toss!" -> "ring-toss"
export function slugifyStallName(name) {
  return (name || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Return the URL for a stall's instruction PDF, or null if none exists yet.
export function getStallInstructionUrl(stall) {
  if (!stall) return null;
  const slug = slugifyStallName(stall.name);
  const exactMatch = files[`./${slug}.pdf`];
  if (exactMatch) return exactMatch;

  const normalizedMatch = normalizedFileNames[
    slug.replace(/[^a-z0-9]/gi, '').toLowerCase()
  ];
  return normalizedMatch ? files[normalizedMatch] : null;
}
