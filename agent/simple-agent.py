#!/usr/bin/env python3
"""
DevOps Organizer Simple Agent
A lightweight monitoring agent that sends data to the management server
"""

import os
import json
import time
import platform
import subprocess
import socket
import uuid
from pathlib import Path
import requests
import psutil
import argparse
import sys

# Simple logging
def log(message, level="INFO"):
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{level}] {message}")

class SimpleAgent:
    """Simplified agent that collects and reports system data"""
    
    def __init__(self, management_server_url, agent_name=None):
        self.management_server_url = management_server_url.rstrip('/')
        self.agent_id = str(uuid.uuid4())
        self.agent_name = agent_name or socket.gethostname()
        
        log(f"Agent initialized: {self.agent_name} ({self.agent_id})")
    
    def register_agent(self):
        """Register agent with management server"""
        try:
            registration_data = {
                'agent_id': self.agent_id,
                'agent_name': self.agent_name,
                'hostname': socket.gethostname(),
                'platform': platform.system(),
                'architecture': platform.machine(),
                'python_version': platform.python_version(),
                'registered_at': time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                'capabilities': {
                    'projects': True,
                    'docker': self._docker_available(),
                    'k3s': self._kubectl_available(),
                    'ssh': True
                }
            }
            
            response = requests.post(
                f"{self.management_server_url}/api/agents/register",
                json=registration_data,
                timeout=10
            )
            
            if response.status_code == 200:
                log("Agent registered successfully")
                return True
            else:
                log(f"Registration failed: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            log(f"Failed to register agent: {e}", "ERROR")
            return False
    
    def _docker_available(self):
        """Check if Docker is available"""
        try:
            import docker
            client = docker.from_env()
            client.ping()
            return True
        except:
            return False
    
    def _kubectl_available(self):
        """Check if kubectl is available"""
        try:
            result = subprocess.run(['kubectl', 'version', '--client'], 
                                  capture_output=True, timeout=5)
            return result.returncode == 0
        except:
            return False
    
    def collect_system_info(self):
        """Collect system information"""
        try:
            return {
                'agent_id': self.agent_id,
                'agent_name': self.agent_name,
                'hostname': socket.gethostname(),
                'timestamp': time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                'platform': platform.system(),
                'architecture': platform.machine(),
                'python_version': platform.python_version(),
                'cpu_count': psutil.cpu_count(),
                'cpu_percent': psutil.cpu_percent(interval=1),
                'memory_total': round(psutil.virtual_memory().total / (1024**3), 2),
                'memory_available': round(psutil.virtual_memory().available / (1024**3), 2),
                'memory_percent': psutil.virtual_memory().percent,
                'disk_total': round(psutil.disk_usage('/').total / (1024**3), 2),
                'disk_used': round(psutil.disk_usage('/').used / (1024**3), 2),
                'disk_percent': psutil.disk_usage('/').percent,
                'uptime': time.time() - psutil.boot_time(),
                'load_average': os.getloadavg() if hasattr(os, 'getloadavg') else [0, 0, 0]
            }
        except Exception as e:
            log(f"Error collecting system info: {e}", "ERROR")
            return {}
    
    def collect_projects(self):
        """Collect project information"""
        try:
            projects = self._find_git_projects()
            return {
                'agent_id': self.agent_id,
                'timestamp': time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                'projects': projects,
                'total_projects': len(projects)
            }
        except Exception as e:
            log(f"Error collecting projects: {e}", "ERROR")
            return {'agent_id': self.agent_id, 'projects': [], 'error': str(e)}
    
    def _find_git_projects(self):
        """Find Git repositories"""
        projects = []
        base_path = Path.home()
        
        try:
            # Simple search - look for .git directories
            for git_dir in base_path.rglob('.git'):
                if git_dir.is_dir():
                    project_path = git_dir.parent
                    project_info = self._analyze_project(project_path)
                    if project_info:
                        projects.append(project_info)
                        if len(projects) >= 20:  # Limit for POC
                            break
        except Exception as e:
            log(f"Error finding projects: {e}", "ERROR")
        
        return projects
    
    def _analyze_project(self, project_path):
        """Analyze a project directory"""
        try:
            return {
                'name': project_path.name,
                'path': str(project_path),
                'size': self._calculate_size(project_path),
                'file_count': self._count_files(project_path),
                'project_type': self._detect_project_type(project_path),
                'libraries': self._find_libraries(project_path),
                'has_venv': self._check_venv(project_path),
                'git_branch': self._get_git_branch(project_path)
            }
        except Exception as e:
            log(f"Error analyzing project {project_path}: {e}", "ERROR")
            return None
    
    def _calculate_size(self, path):
        """Calculate directory size in MB"""
        try:
            total_size = 0
            for dirpath, dirnames, filenames in os.walk(path):
                for filename in filenames:
                    file_path = os.path.join(dirpath, filename)
                    try:
                        total_size += os.path.getsize(file_path)
                    except (OSError, FileNotFoundError):
                        continue
                if total_size > 500 * 1024 * 1024:  # Stop at 500MB for performance
                    break
            return round(total_size / (1024 * 1024), 2)
        except Exception:
            return 0
    
    def _count_files(self, path):
        """Count files in directory"""
        try:
            count = 0
            for _, _, files in os.walk(path):
                count += len(files)
                if count > 10000:  # Limit for performance
                    break
            return min(count, 10000)
        except Exception:
            return 0
    
    def _detect_project_type(self, path):
        """Detect project type"""
        type_indicators = {
            'python': ['.py', 'requirements.txt', 'setup.py', 'pyproject.toml'],
            'javascript': ['.js', '.ts', 'package.json'],
            'java': ['.java', 'pom.xml', 'build.gradle'],
            'go': ['.go', 'go.mod'],
            'rust': ['.rs', 'Cargo.toml'],
            'docker': ['Dockerfile', 'docker-compose.yml']
        }
        
        detected_types = []
        try:
            for file_path in path.iterdir():
                if file_path.is_file():
                    file_name = file_path.name.lower()
                    file_ext = file_path.suffix.lower()
                    
                    for proj_type, indicators in type_indicators.items():
                        for indicator in indicators:
                            if indicator.startswith('.') and file_ext == indicator:
                                detected_types.append(proj_type)
                            elif not indicator.startswith('.') and file_name == indicator.lower():
                                detected_types.append(proj_type)
        except Exception:
            pass
        
        return list(set(detected_types)) if detected_types else ['unknown']
    
    def _find_libraries(self, path):
        """Find project libraries"""
        libraries = []
        try:
            # Python requirements
            req_file = path / 'requirements.txt'
            if req_file.exists():
                with open(req_file, 'r') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#'):
                            lib_name = line.split('==')[0].split('>=')[0].split('<=')[0]
                            libraries.append(lib_name)
                            if len(libraries) >= 10:  # Limit for POC
                                break
            
            # Node.js package.json
            package_json = path / 'package.json'
            if package_json.exists():
                with open(package_json, 'r') as f:
                    data = json.load(f)
                    if 'dependencies' in data:
                        libraries.extend(list(data['dependencies'].keys())[:5])
        except Exception:
            pass
        
        return libraries[:10]  # Limit to 10 libraries
    
    def _check_venv(self, path):
        """Check for virtual environment"""
        venv_indicators = ['.venv', 'venv', '.env', 'env']
        for indicator in venv_indicators:
            if (path / indicator).exists():
                return True
        return False
    
    def _get_git_branch(self, path):
        """Get current Git branch"""
        try:
            result = subprocess.run(
                ['git', 'branch', '--show-current'],
                cwd=path, capture_output=True, text=True, timeout=5
            )
            return result.stdout.strip() if result.returncode == 0 else 'unknown'
        except Exception:
            return 'unknown'
    
    def collect_docker_info(self):
        """Collect Docker information"""
        try:
            if not self._docker_available():
                return {'agent_id': self.agent_id, 'available': False}
            
            import docker
            client = docker.from_env()
            
            # Get running containers
            running_containers = []
            for container in client.containers.list():
                running_containers.append({
                    'id': container.short_id,
                    'name': container.name,
                    'image': container.image.tags[0] if container.image.tags else 'unknown',
                    'status': container.status,
                    'created': container.attrs['Created']
                })
            
            # Get stopped containers (limited)
            stopped_containers = []
            for container in client.containers.list(all=True, filters={'status': 'exited'})[:5]:
                stopped_containers.append({
                    'id': container.short_id,
                    'name': container.name,
                    'image': container.image.tags[0] if container.image.tags else 'unknown',
                    'status': container.status,
                    'created': container.attrs['Created']
                })
            
            # Get images (limited)
            images = []
            for image in client.images.list()[:10]:
                images.append({
                    'id': image.short_id,
                    'tags': image.tags,
                    'size': round(image.attrs['Size'] / (1024 * 1024), 2),
                    'created': image.attrs['Created']
                })
            
            return {
                'agent_id': self.agent_id,
                'timestamp': time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                'available': True,
                'containers': {
                    'running': running_containers,
                    'stopped': stopped_containers
                },
                'images': images
            }
        except Exception as e:
            log(f"Error collecting Docker info: {e}", "ERROR")
            return {'agent_id': self.agent_id, 'available': False, 'error': str(e)}
    
    def collect_ssh_info(self):
        """Collect SSH key information"""
        try:
            ssh_dir = Path.home() / '.ssh'
            keys = []
            
            if ssh_dir.exists():
                for key_file in ssh_dir.glob('id_*'):
                    if key_file.is_file() and not key_file.name.endswith('.pub'):
                        keys.append({
                            'name': key_file.name,
                            'path': str(key_file),
                            'type': self._determine_key_type(key_file),
                            'has_public': (key_file.with_suffix(key_file.suffix + '.pub')).exists(),
                            'size': key_file.stat().st_size,
                            'modified': key_file.stat().st_mtime
                        })
            
            return {
                'agent_id': self.agent_id,
                'timestamp': time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                'ssh_keys': keys
            }
        except Exception as e:
            log(f"Error collecting SSH info: {e}", "ERROR")
            return {'agent_id': self.agent_id, 'ssh_keys': [], 'error': str(e)}
    
    def _determine_key_type(self, key_path):
        """Determine SSH key type"""
        name = key_path.name.lower()
        if 'rsa' in name:
            return 'RSA'
        elif 'ed25519' in name:
            return 'Ed25519'
        elif 'ecdsa' in name:
            return 'ECDSA'
        elif 'dsa' in name:
            return 'DSA'
        return 'Unknown'
    
    def send_data(self, endpoint, data):
        """Send data to management server"""
        try:
            response = requests.post(
                f"{self.management_server_url}/api/agents/{endpoint}",
                json=data,
                timeout=10
            )
            
            if response.status_code == 200:
                log(f"Data sent successfully to {endpoint}")
                return True
            else:
                log(f"Failed to send data to {endpoint}: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            log(f"Error sending data to {endpoint}: {e}", "ERROR")
            return False
    
    def run_once(self):
        """Run a single data collection and send cycle"""
        log("Starting data collection cycle")
        
        # Register agent
        if not self.register_agent():
            log("Failed to register agent", "ERROR")
            return False
        
        # Collect and send system info
        system_data = self.collect_system_info()
        if system_data:
            self.send_data('system', system_data)
        
        # Collect and send projects
        log("Collecting projects...")
        projects_data = self.collect_projects()
        if projects_data:
            self.send_data('projects', projects_data)
        
        # Collect and send Docker info
        log("Collecting Docker info...")
        docker_data = self.collect_docker_info()
        if docker_data:
            self.send_data('docker', docker_data)
        
        # Collect and send SSH info
        log("Collecting SSH info...")
        ssh_data = self.collect_ssh_info()
        if ssh_data:
            self.send_data('ssh', ssh_data)
        
        log("Data collection cycle completed")
        return True
    
    def run_continuous(self, interval=30):
        """Run continuous monitoring"""
        log(f"Starting continuous monitoring (interval: {interval}s)")
        
        try:
            while True:
                self.run_once()
                log(f"Sleeping for {interval} seconds...")
                time.sleep(interval)
        except KeyboardInterrupt:
            log("Agent stopped by user")
        except Exception as e:
            log(f"Agent error: {e}", "ERROR")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='DevOps Organizer Simple Agent')
    parser.add_argument('--server', required=True, help='Management server URL')
    parser.add_argument('--name', help='Agent name (default: hostname)')
    parser.add_argument('--interval', type=int, default=30, help='Report interval in seconds')
    parser.add_argument('--once', action='store_true', help='Run once and exit')
    
    args = parser.parse_args()
    
    # Create and run agent
    agent = SimpleAgent(
        management_server_url=args.server,
        agent_name=args.name
    )
    
    if args.once:
        success = agent.run_once()
        sys.exit(0 if success else 1)
    else:
        agent.run_continuous(args.interval)


if __name__ == '__main__':
    main()
