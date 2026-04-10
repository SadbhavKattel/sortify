#!/usr/bin/env python3
"""Generate all Android app icon variants from source images."""
from PIL import Image
import os

ASSETS_DIR = "/Users/lcpratik/sortify/mobile/assets"
RES_DIR = "/Users/lcpratik/sortify/mobile/android/app/src/main/res"

# Source images
foreground_path = os.path.join(ASSETS_DIR, "android-icon-foreground.png")
icon_path = os.path.join(ASSETS_DIR, "icon.png")

# 1. Create a plain white/light background for adaptive icon
bg = Image.new("RGB", (1024, 1024), (240, 240, 240))
bg.save(os.path.join(ASSETS_DIR, "android-icon-background.png"))
print("Created android-icon-background.png")

# 2. Create monochrome version from foreground (convert to grayscale then threshold)
fg = Image.open(foreground_path).convert("RGBA")
# Create a grayscale version - make all non-white content black
mono = Image.new("RGBA", fg.size, (255, 255, 255, 255))
pixels = fg.load()
mono_pixels = mono.load()
for y in range(fg.size[1]):
    for x in range(fg.size[0]):
        r, g, b, a = pixels[x, y]
        # If pixel has content (not white/near-white), make it black
        if a > 50 and (r < 230 or g < 230 or b < 230):
            mono_pixels[x, y] = (0, 0, 0, 255)
        else:
            mono_pixels[x, y] = (255, 255, 255, 255)
mono.save(os.path.join(ASSETS_DIR, "android-icon-monochrome.png"))
print("Created android-icon-monochrome.png")

# 3. Create splash icon (just the logo on white bg)
splash = Image.new("RGB", (200, 200), (255, 255, 255))
fg_resized = fg.resize((160, 160), Image.LANCZOS)
splash.paste(fg_resized, (20, 20), fg_resized)
splash.save(os.path.join(ASSETS_DIR, "splash-icon.png"))
print("Created splash-icon.png")

# 4. Create favicon
icon_img = Image.open(icon_path).convert("RGBA")
favicon = icon_img.resize((48, 48), Image.LANCZOS)
favicon.save(os.path.join(ASSETS_DIR, "favicon.png"))
print("Created favicon.png")

# 5. Generate mipmap icons for Android
# Android icon sizes: mdpi=48, hdpi=72, xhdpi=96, xxhdpi=144, xxxhdpi=192
# Foreground/background: mdpi=108, hdpi=162, xhdpi=216, xxhdpi=324, xxxhdpi=432
mipmap_sizes = {
    "mipmap-mdpi": {"launcher": 48, "adaptive": 108},
    "mipmap-hdpi": {"launcher": 72, "adaptive": 162},
    "mipmap-xhdpi": {"launcher": 96, "adaptive": 216},
    "mipmap-xxhdpi": {"launcher": 144, "adaptive": 324},
    "mipmap-xxxhdpi": {"launcher": 192, "adaptive": 432},
}

for folder, sizes in mipmap_sizes.items():
    out_dir = os.path.join(RES_DIR, folder)
    os.makedirs(out_dir, exist_ok=True)
    
    # ic_launcher.webp - the full icon (with background)
    launcher_size = sizes["launcher"]
    full_icon = Image.new("RGB", (1024, 1024), (240, 240, 240))
    fg_copy = fg.copy()
    full_icon.paste(fg_copy, (0, 0), fg_copy)
    full_icon_resized = full_icon.resize((launcher_size, launcher_size), Image.LANCZOS)
    full_icon_resized.save(os.path.join(out_dir, "ic_launcher.webp"), "WEBP", quality=90)
    
    # ic_launcher_round.webp - same but will be masked as round by system
    full_icon_resized.save(os.path.join(out_dir, "ic_launcher_round.webp"), "WEBP", quality=90)
    
    # ic_launcher_foreground.webp
    adaptive_size = sizes["adaptive"]
    fg_resized = fg.resize((adaptive_size, adaptive_size), Image.LANCZOS)
    fg_resized.save(os.path.join(out_dir, "ic_launcher_foreground.webp"), "WEBP", quality=90)
    
    # ic_launcher_background.webp
    bg_resized = bg.resize((adaptive_size, adaptive_size), Image.LANCZOS)
    bg_resized.save(os.path.join(out_dir, "ic_launcher_background.webp"), "WEBP", quality=90)
    
    # ic_launcher_monochrome.webp
    mono_resized = mono.resize((adaptive_size, adaptive_size), Image.LANCZOS)
    mono_resized.save(os.path.join(out_dir, "ic_launcher_monochrome.webp"), "WEBP", quality=90)
    
    print(f"Generated icons for {folder}")

print("\nAll icons generated successfully!")
