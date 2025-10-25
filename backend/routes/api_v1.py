from flask import Blueprint

def create_api_v1(db, detector):
    api_v1 = Blueprint('api_v1', __name__, url_prefix='/api/v1')
    
    from routes.auth import create_auth_routes
    from routes.analysis import create_analysis_routes
    
    auth_routes = create_auth_routes(db)
    analysis_routes = create_analysis_routes(db, detector)
    
    for rule in auth_routes.url_map.iter_rules():
        if rule.endpoint.startswith('auth.'):
            api_v1.add_url_rule(
                rule.rule.replace('/api', ''),
                view_func=auth_routes.view_functions[rule.endpoint],
                methods=rule.methods
            )
    
    for rule in analysis_routes.url_map.iter_rules():
        if rule.endpoint.startswith('analysis.'):
            api_v1.add_url_rule(
                rule.rule.replace('/api', ''),
                view_func=analysis_routes.view_functions[rule.endpoint],
                methods=rule.methods
            )
    
    return api_v1
