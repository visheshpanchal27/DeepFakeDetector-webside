import os
import uuid
import tempfile
import cloudinary
import cloudinary.uploader
from werkzeug.utils import secure_filename

class FileService:
    def __init__(self):
        self.allowed_extensions = {
            'image': {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'},
            'video': {'.mp4', '.avi', '.mov', '.webm', '.mkv'}
        }
        self.max_sizes = {
            'image': 100 * 1024 * 1024,  # 100MB
            'video': 500 * 1024 * 1024   # 500MB
        }
    
    def validate_file(self, file):
        if not file or file.filename == '':
            return False, 'No file selected'
        
        filename = secure_filename(file.filename)
        file_ext = os.path.splitext(filename)[1].lower()
        
        # Check extension
        is_image = file_ext in self.allowed_extensions['image']
        is_video = file_ext in self.allowed_extensions['video']
        
        if not (is_image or is_video):
            return False, 'Unsupported file format'
        
        # Check size
        file.seek(0, 2)
        file_size = file.tell()
        file.seek(0)
        
        file_type = 'video' if is_video else 'image'
        if file_size > self.max_sizes[file_type]:
            size_limit = '500MB' if is_video else '100MB'
            return False, f'File too large. Maximum size: {size_limit}'
        
        if file_size == 0:
            return False, 'File is empty'
        
        return True, {
            'type': file_type,
            'size': file_size,
            'extension': file_ext,
            'filename': filename
        }
    
    def save_temp_file(self, file, file_ext):
        try:
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=file_ext)
            temp_path = temp_file.name
            file.save(temp_path)
            return temp_path
        except Exception as e:
            print(f"Error saving temp file: {e}")
            return None
    
    def upload_to_cloudinary(self, file_path, file_type, file_id):
        try:
            resource_type = "video" if file_type == 'video' else "image"
            upload_result = cloudinary.uploader.upload(
                file_path,
                public_id=f"deepfake_{file_id}",
                resource_type=resource_type,
                folder="deepfake_detector",
                use_filename=True,
                unique_filename=False
            )
            return upload_result['secure_url']
        except Exception as e:
            print(f"Cloudinary upload failed: {e}")
            return None
    
    def cleanup_temp_file(self, file_path):
        try:
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Cleanup error: {e}")
    
    def generate_file_id(self):
        return str(uuid.uuid4())