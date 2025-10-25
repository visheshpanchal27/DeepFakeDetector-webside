from celery import Celery
from kombu import Queue
import os

def make_celery(app=None):
    """Create Celery instance with Flask app context"""
    broker_url = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
    backend_url = os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
    
    celery = Celery(
        'deepfake_detector',
        broker=broker_url,
        backend=backend_url
    )
    
    celery.conf.update(
        task_serializer='json',
        accept_content=['json'],
        result_serializer='json',
        timezone='UTC',
        enable_utc=True,
        task_track_started=True,
        task_time_limit=600,  # 10 minutes max
        task_soft_time_limit=540,  # 9 minutes soft limit
        worker_prefetch_multiplier=1,
        worker_max_tasks_per_child=50,
        task_acks_late=True,
        task_reject_on_worker_lost=True,
        task_default_queue='default',
        task_queues=(
            Queue('default', routing_key='task.#'),
            Queue('analysis', routing_key='analysis.#'),
            Queue('video', routing_key='video.#'),
        ),
        task_routes={
            'tasks.analyze_image': {'queue': 'analysis'},
            'tasks.analyze_video': {'queue': 'video'},
        }
    )
    
    if app:
        celery.conf.update(app.config)
        
        class ContextTask(celery.Task):
            def __call__(self, *args, **kwargs):
                with app.app_context():
                    return self.run(*args, **kwargs)
        
        celery.Task = ContextTask
    
    return celery

# Create celery instance
celery_app = make_celery()

@celery_app.task(bind=True, name='tasks.analyze_image')
def async_analyze_image(self, image_path, user_id, file_id):
    """Async image analysis task"""
    from detectors.image_detector_v4 import analyze_image
    from models.analysis import Analysis
    
    try:
        # Update task state
        self.update_state(state='PROCESSING', meta={'progress': 0})
        
        # Analyze image
        result = analyze_image(image_path)
        
        # Save to database
        Analysis.create(
            user_id=user_id,
            file_id=file_id,
            original_filename=os.path.basename(image_path),
            analysis_result=result,
            cloudinary_url=None
        )
        
        self.update_state(state='SUCCESS', meta={'progress': 100})
        return result
        
    except Exception as e:
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

@celery_app.task(bind=True, name='tasks.analyze_video')
def async_analyze_video(self, video_path, user_id, file_id):
    """Async video analysis task"""
    from detectors.video_detector_v4 import analyze_video
    from models.analysis import Analysis
    
    try:
        # Update task state
        self.update_state(state='PROCESSING', meta={'progress': 0})
        
        # Analyze video
        result = analyze_video(video_path)
        
        # Save to database
        Analysis.create(
            user_id=user_id,
            file_id=file_id,
            original_filename=os.path.basename(video_path),
            analysis_result=result,
            cloudinary_url=None
        )
        
        self.update_state(state='SUCCESS', meta={'progress': 100})
        return result
        
    except Exception as e:
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

@celery_app.task(name='tasks.cleanup_old_files')
def cleanup_old_files():
    """Periodic task to cleanup old temporary files"""
    import glob
    import time
    
    temp_dir = '/tmp'
    current_time = time.time()
    
    for file_path in glob.glob(f'{temp_dir}/*'):
        if os.path.isfile(file_path):
            file_age = current_time - os.path.getmtime(file_path)
            if file_age > 3600:  # 1 hour
                try:
                    os.remove(file_path)
                except:
                    pass
