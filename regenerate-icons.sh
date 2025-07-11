#!/usr/bin/env bash
# regenerate-icons.sh - Fix Safari PWA icon issues by regenerating all icons
set -Eeuo pipefail

ASSETS_DIR="./assets"
LOGO_FILE="${ASSETS_DIR}/emperors/default.webp"

echo "🔄 Removing old icons..."
rm -f "${ASSETS_DIR}"/icon-{192,512}.png \
      "${ASSETS_DIR}"/apple-touch-icon.png || true

# Clean up splash screens if they exist
rm -f "${ASSETS_DIR}"/apple-splash-*.png 2>/dev/null || true

echo "🎨 Generating new icons..."
npx -y pwa-asset-generator \
      "${LOGO_FILE}" "${ASSETS_DIR}" \
      --type png --background transparent \
      --portrait-only --disable-favicon --path "/assets"

# Rename generated files to expected names
echo "📝 Renaming generated icons..."
if [ -f "${ASSETS_DIR}/manifest-icon-192.maskable.png" ]; then
    mv "${ASSETS_DIR}/manifest-icon-192.maskable.png" "${ASSETS_DIR}/icon-192.png"
fi

if [ -f "${ASSETS_DIR}/manifest-icon-512.maskable.png" ]; then
    mv "${ASSETS_DIR}/manifest-icon-512.maskable.png" "${ASSETS_DIR}/icon-512.png"
fi

if [ -f "${ASSETS_DIR}/apple-icon-180.png" ]; then
    cp "${ASSETS_DIR}/apple-icon-180.png" "${ASSETS_DIR}/apple-touch-icon.png"
fi

echo "✅ Verifying generated icons..."
for icon in icon-192.png icon-512.png apple-touch-icon.png; do
    if [ -f "${ASSETS_DIR}/${icon}" ]; then
        file_info=$(file "${ASSETS_DIR}/${icon}")
        echo "  ✓ ${icon}: ${file_info}"
    else
        echo "  ✗ ${icon}: NOT FOUND" >&2
    fi
done

echo ""
echo "📋 Next steps:"
echo "1. Commit the changes: git add assets/*.png && git commit -m 'Fix: Regenerate PWA icons'"
echo "2. Push to repository: git push"
echo "3. If using Vercel: The deployment will happen automatically"
echo "4. Clear Safari cache and test: Settings > Safari > Clear History and Website Data"
echo "5. Test PWA installation on iOS Safari"

echo ""
echo "🧪 To verify on deployed site:"
echo "curl -I https://your-domain.vercel.app/assets/icon-192.png"
echo "Should return: HTTP/2 200 with content-type: image/png"