# DevOps Developer Organizer

A modern web-based tool for monitoring and managing multiple development machines. Track local projects, Docker containers, K3s clusters, and SSH keys across all your development environments from a centralized dashboard.

![DevOps Organizer](https://img.shields.io/badge/DevOps-Organizer-blue?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.11-green?style=for-the-badge)
![Flask](https://img.shields.io/badge/Flask-2.3-red?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge)

## 🌟 Features

### 🖥️ **Multi-Machine Monitoring**
- **Agent-Based Architecture**: Deploy lightweight agents on any machine.
- **Centralized Dashboard**: Monitor all machines from one web interface.
- **Real-Time Data**: Live updates from connected agents.
- **Cross-Platform**: Works on Linux, macOS, and Windows.

### 📁 **Project  Discovery**
- **Git Repository Detection**: Automatically finds all Git projects.
- **Multi-Language Support**: Python, JavaScript, Java, C#, Rust, Go, PHP, Ruby, C++, Docker, Terraform.
- **Smart Analysis**: Project sizes, file counts, dependencies, virtual environments.
- **Library Detection**: Automatically identifies project dependencies.

### 🐳 **Docker Management**
- **Container Monitoring**: Running and stopped containers across all machines.
- **Image Inventory**: Complete Docker image catalog with sizes and tags.
- **Multi-Host Support**: Monitor Docker across multiple development machines.

### ☸️ **K3s/Kubernetes Integration**
- **Cluster Monitoring**: Node status and health across clusters.
- **Pod Management**: Active pods with resource information.
- **Multi-Cluster**: Support for multiple K3s/Kubernetes environments.

### 🔐 **SSH Key Management**
- **Key Discovery**: Automatic SSH key inventory.
- **Type Detection**: RSA, DSA, ECDSA, Ed25519 identification.
- **Security Overview**: Complete authentication key management.

## 🚀 Quick Start

### Prerequisites
- **Docker & Docker Compose**
- **Python 3.11+** (on machines where you'll run agents).
- **Git** (recommended).

### Default Option: (Recommended):
1) Pull the Repo.
2) Run ```./start-server.sh``` from the project's root directory in order to build and start the Management Server.
3) Make sure to create a virtual environment - the script will download the needed repositories mentioned in the requirements.txt file.
> For Example, Run:
```
python3 -m venv path/to/venv
source path/to/venv/bin/activate
python3 -m pip install {package_name}
```
4) Navigate to the agent folder: [agent/](agent/) and Run ```./simple-install.sh```
5) Follow the instructions in the terminal responses.


### Option 1: Using Pre-built Docker Image:
The project includes GitHub Actions that automatically build and publish Docker images on every push.

```bash
# Start with pre-built image
docker run -d \
  --name devops-organizer \
  -p 8085:8085 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/seanrokah/devops-organizer:latest

# Or use docker-compose with pre-built image
curl -o docker-compose.yml https://raw.githubusercontent.com/seanrokah/your-repo/main/docker-compose.yml
docker-compose up -d
```

### Option 2: Build from Source
```bash
# 1. Download Project
git clone <repository-url>
cd Final_Project

# 2. Start Management Server
./start-server.sh
```

**Access Dashboard**: Open http://localhost:8085 in your browser

### 3. Install Agent on Target Machine(s)
```bash
cd agent/
./simple-install.sh
```

### 4. Run Agent
```bash
# Run once (great for testing)
python3 ~/.devops-agent/simple-agent.py --server http://[MANAGEMENT_SERVER_IP]:8085 --once

# Run continuously
python3 ~/.devops-agent/simple-agent.py --server http://[MANAGEMENT_SERVER_IP]:8085 --name "my-laptop"

# Custom configuration
python3 ~/.devops-agent/simple-agent.py \
  --server http://192.168.1.100:8085 \
  --name "development-server" \
  --interval 60
```

## 🎯 Agent Configuration

### Command Line Options
```bash
--server URL     # Management server URL (required)
--name NAME      # Agent name (default: hostname)
--interval SEC   # Report interval in seconds (default: 30)
--once           # Run once and exit (great for testing)
```

### Usage Examples
```bash
# Quick test - run once and see results
python3 ~/.devops-agent/simple-agent.py --server http://localhost:8085 --once

# Production monitoring - continuous reporting
python3 ~/.devops-agent/simple-agent.py --server http://192.168.1.100:8085 --name "web-server-01"

# Custom interval - report every 2 minutes
python3 ~/.devops-agent/simple-agent.py --server http://192.168.1.100:8085 --interval 120
```

## 🏗️ Architecture

### Management Server
- **Flask Application**: Python-based API server
- **SQLite Database**: Agent data storage and management
- **Nginx Proxy**: High-performance web server
- **Docker Compose**: Simple deployment and scaling

### Agent System
- **Lightweight Agent**: Minimal resource usage
- **Self-Registration**: Automatic discovery and registration
- **Data Collection**: System info, projects, Docker, K3s, SSH keys
- **Error Recovery**: Resilient operation with automatic retry

### Web Dashboard
- **Modern UI**: Responsive design with real-time updates
- **Multi-Tab Interface**: Organized by data type
- **Agent Management**: Monitor agent status and capabilities
- **Cross-Platform**: Works on desktop and mobile

## 📊 What Gets Monitored

### System Information
- CPU, memory, and disk usage
- Platform and architecture details
- System uptime and load averages
- Real-time performance metrics

### Project Analysis
- Git repository discovery
- Project type identification
- Dependency analysis (requirements.txt, package.json, etc.)
- Virtual environment detection
- File counts and directory sizes

### Container Management
- Running Docker containers
- Container images and sizes
- Port mappings and status
- Multi-host container inventory

### Infrastructure Monitoring
- Kubernetes/K3s node status
- Active pod monitoring
- Cluster health information
- Multi-cluster support

## 🤖 CI/CD & Automation

### GitHub Actions Workflows
This project includes comprehensive GitHub Actions for automated testing and deployment:

- **🐍 Python CI** (`ci-python.yml`): Automated linting with flake8 & black, security scanning with bandit, and testing
- **🐳 Docker Security** (`docker-security-check.yml`): Container security scanning and vulnerability detection
- **📦 GHCR Publishing** (`ghcr.yml`): Automatic Docker image building and publishing to GitHub Container Registry
- **🔍 Secret Scanning** (`trufflehog-check.yml`): Automated detection of secrets and sensitive data

### Automated Image Builds
Every push to the main branch automatically:
1. **Builds** the Docker image with latest code
2. **Tests** the image for security vulnerabilities
3. **Publishes** to GitHub Container Registry (GHCR)
4. **Tags** with commit SHA and 'latest'

## 🔧 Development & Deployment

### Local Development
```bash
# Start management server
docker-compose up -d

# Test agent locally
cd agent/
python3 simple-agent.py --server http://localhost:8085 --once
```

### Production Deployment

#### Option A: Using Pre-built Images (Recommended)
```bash
# Quick deployment with latest stable image
docker run -d \
  --name devops-organizer \
  -p 8085:8085 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --restart unless-stopped \
  ghcr.io/seanrokah/devops-organizer:latest

# Or with docker-compose
curl -o docker-compose.yml https://raw.githubusercontent.com/seanrokah/your-repo/main/docker-compose.yml
docker-compose up -d
```

#### Option B: Build from Source
```bash
# Clone and build locally
git clone <repository-url>
cd Final_Project
./start-server.sh
```

#### Agent Deployment
```bash
# Install agents on target machines
./simple-install.sh
python3 ~/.devops-agent/simple-agent.py --server http://[PROD_SERVER]:8085
```

### Multi-Machine Setup
1. **Deploy Management Server**: Run `docker-compose up -d` on central server
2. **Install Agents**: Run `simple-install.sh` on each target machine
3. **Connect Agents**: Point each agent to management server IP
4. **Monitor**: View all machines in centralized dashboard

## 🛡️ Security Features

- **No Root Required**: Agents run under user permissions
- **Read-Only Access**: Minimal system access requirements
- **Data Privacy**: No sensitive data collection
- **Network Security**: HTTP/HTTPS communication
- **Isolated Containers**: Secure Docker deployment

## 🐛 Troubleshooting

### Management Server Issues
```bash
# Check server status
docker-compose ps

# View server logs
docker-compose logs -f

# Restart services
docker-compose restart
```

### Agent Connection Issues
```bash
# Test server connectivity
curl http://[SERVER_IP]:8085/api/system/info

# Run agent in debug mode
python3 ~/.devops-agent/simple-agent.py --server http://[SERVER]:8085 --once

# Check agent requirements
cd agent/ && ./simple-install.sh
```

### Common Solutions
- **Port 8085 blocked**: Check firewall settings
- **Agent not appearing**: Verify server URL and network connectivity
- **Docker features missing**: Add user to docker group
- **K3s not working**: Ensure kubectl is configured

## 📁 Project Structure

```
Final_Project/
├── app.py                    # Main Flask application
├── docker-compose.yml       # Multi-container deployment
├── Dockerfile               # Management server container
├── nginx.conf               # Reverse proxy configuration
├── requirements.txt         # Python dependencies
├── static/                  # Web assets (CSS, JavaScript)
├── templates/               # HTML templates
├── agent/                   # Agent system
│   ├── simple-agent.py      # Lightweight monitoring agent
│   ├── simple-install.sh    # Agent installation script
│   └── requirements.txt     # Agent dependencies
└── README.md               # This file
```

## 🎓 Educational Value

This project demonstrates modern DevOps practices:

- **Containerization**: Docker and Docker Compose
- **Infrastructure as Code**: Configuration management
- **Monitoring & Observability**: System and application monitoring
- **Web Development**: Modern Flask application with responsive UI
- **Network Programming**: REST APIs and client-server communication
- **System Administration**: Cross-platform deployment and management

## 📈 Scaling & Extension

### Adding More Agents
Simply run the installation and agent script on additional machines:
```bash
# On each new machine
./simple-install.sh
python3 ~/.devops-agent/simple-agent.py --server http://[SERVER]:8085
```

### Customization
- **Custom Data Collection**: Extend agent to collect additional metrics
- **New Integrations**: Add support for other tools and platforms
- **Enhanced UI**: Customize dashboard for specific needs
- **Automation**: Integrate with CI/CD pipelines

## 📄 License

This project is developed for educational purposes as part of DevOps coursework.

## 🆘 Support

1. **Check Documentation**: Review this README and troubleshooting section
2. **Test Connectivity**: Verify network access between agents and server
3. **Check Logs**: Review agent output and server logs
4. **Verify Requirements**: Ensure all dependencies are installed

---


*Simplify your development workflow with centralized multi-machine monitoring.*
