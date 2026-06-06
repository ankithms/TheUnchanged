from PIL import Image
import os

files = [
    'media__1780764449845.png',
    'media__1780764449867.jpg',
    'media__1780764449878.png'
]

folder = '/Users/ankithms/.gemini/antigravity/brain/f93b4c0b-e440-4e89-8983-fd4879b0d96c'

for f in files:
    path = os.path.join(folder, f)
    if os.path.exists(path):
        with Image.open(path) as img:
            w, h = img.size
            cx, cy = w // 2, h // 2
            
            # Read color at center
            center_color = img.getpixel((cx, cy))[:3]
            
            # Find left boundary
            left = cx
            while left > 0:
                col = img.getpixel((left - 1, cy))[:3]
                # If color diff is large, stop
                diff = sum(abs(col[i] - center_color[i]) for i in range(3))
                if diff > 20:
                    break
                left -= 1
                
            # Find right boundary
            right = cx
            while right < w - 1:
                col = img.getpixel((right + 1, cy))[:3]
                diff = sum(abs(col[i] - center_color[i]) for i in range(3))
                if diff > 20:
                    break
                right += 1
                
            # Find top boundary
            top = cy
            while top > 0:
                col = img.getpixel((cx, top - 1))[:3]
                diff = sum(abs(col[i] - center_color[i]) for i in range(3))
                if diff > 20:
                    break
                top -= 1
                
            # Find bottom boundary
            bottom = cy
            while bottom < h - 1:
                col = img.getpixel((cx, bottom + 1))[:3]
                diff = sum(abs(col[i] - center_color[i]) for i in range(3))
                if diff > 20:
                    break
                bottom += 1
                
            print(f"File: {f} | Center Color: {center_color} | Left: {left}, Top: {top}, Right: {right}, Bottom: {bottom} | Width: {right - left} | Height: {bottom - top}")
