import re

AI_KEYWORDS = [
    'chatgpt', 'gpt', 'dalle', 'midjourney', 'stable-diffusion', 'stablediffusion',
    'gemini', 'bard', 'claude', 'copilot', 'ai-generated', 'ai_generated',
    'artificial', 'synthetic', 'deepfake', 'gan', 'diffusion', 'neural',
    'generated', 'ai-art', 'aiart', 'runway', 'leonardo', 'firefly',
    'bing-image', 'craiyon', 'nightcafe', 'artbreeder', 'wombo', 'dream'
]

def detect_ai_in_filename(filename):
    """Check if filename contains AI-related keywords"""
    filename_lower = filename.lower()
    
    for keyword in AI_KEYWORDS:
        if keyword in filename_lower:
            return True, keyword
    
    return False, None
