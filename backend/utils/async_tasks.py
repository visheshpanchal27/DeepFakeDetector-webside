from threading import Thread
from queue import Queue
import time

class TaskQueue:
    def __init__(self, max_workers=4):
        self.queue = Queue()
        self.results = {}
        self.workers = []
        
        for _ in range(max_workers):
            worker = Thread(target=self._worker, daemon=True)
            worker.start()
            self.workers.append(worker)
    
    def _worker(self):
        while True:
            try:
                task_id, func, args, kwargs = self.queue.get()
                result = func(*args, **kwargs)
                self.results[task_id] = {'status': 'completed', 'result': result}
            except Exception as e:
                self.results[task_id] = {'status': 'failed', 'error': str(e)}
            finally:
                self.queue.task_done()
    
    def submit(self, task_id, func, *args, **kwargs):
        self.results[task_id] = {'status': 'pending'}
        self.queue.put((task_id, func, args, kwargs))
        return task_id
    
    def get_result(self, task_id):
        return self.results.get(task_id, {'status': 'not_found'})
    
    def cleanup_old_results(self, max_age=3600):
        # Cleanup results older than max_age seconds
        pass

# Global task queue
task_queue = TaskQueue(max_workers=4)
