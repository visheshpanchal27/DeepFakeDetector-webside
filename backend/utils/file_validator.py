import magic
import os

ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp']
ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/avi', 'video/quicktime', 'video/webm', 'video/x-matroska']

def validate_file_type(file_path):
    try:
        mime = magic.Magic(mime=True)
        file_type = mime.from_file(file_path)
        
        if file_type in ALLOWED_IMAGE_TYPES:
            return True, 'image'
        elif file_type in ALLOWED_VIDEO_TYPES:
            return True, 'video'
        else:
            return False, None
    except:
        ext = os.path.splitext(file_path)[1].lower()
        if ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']:
            return True, 'image'
        elif ext in ['.mp4', '.avi', '.mov', '.webm', '.mkv']:
            return True, 'video'
        return False, None

def check_file_signature(file_path):
    signatures = {
        b'\xFF\xD8\xFF': 'jpeg',
        b'\x89PNG\r\n\x1a\n': 'png',
        b'GIF87a': 'gif',
        b'GIF89a': 'gif',
        b'\x00\x00\x00\x18ftypmp42': 'mp4',
        b'\x00\x00\x00\x1cftypmp42': 'mp4'
    }
    
    with open(file_path, 'rb') as f:
        header = f.read(32)
        for sig, ftype in signatures.items():
            if header.startswith(sig):
                return True, ftype
    return False, None
