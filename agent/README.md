# DevOps Organizer Agent

A lightweight monitoring agent that collects system information and sends it to the central management server.

## 🚀 Quick Installation

### 1. Install Agent
```bash
./simple-install.sh
```

### 2. Run Agent
```bash
# Test run (execute once and exit)
python3 ~/.devops-agent/simple-agent.py --server http://[SERVER_IP]:8085 --once

# Continuous monitoring
python3 ~/.devops-agent/simple-agent.py --server http://[SERVER_IP]:8085

# With custom name and interval
python3 ~/.devops-agent/simple-agent.py --server http://192.168.1.100:8085 --name "my-laptop" --interval 60
```

## 📋 Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--server URL` | Management server URL (required) | - |
| `--name NAME` | Agent name | hostname |
| `--interval SEC` | Report interval in seconds | 30 |
| `--once` | Run once and exit | false |

## 🔧 What Gets Monitored

- **System Info**: CPU, memory, disk usage, uptime
- **Projects**: Git repositories with language detection
- **Docker**: Containers and images (if available)
- **SSH Keys**: Keys in ~/.ssh directory

## 📁 Installation Details

The installer:
1. Checks Python 3.11+ and pip requirements
2. Installs dependencies: `requests`, `psutil`, `docker`, `kubernetes`
3. Copies agent to `~/.devops-agent/`
4. Makes scripts executable

## 🐛 Troubleshooting

### Connection Issues
```bash
# Test server connectivity
curl http://[SERVER_IP]:8085/api/system/info

# Check if management server is running
docker-compose ps
```

### Permission Issues
```bash
# For Docker monitoring, add user to docker group
sudo usermod -aG docker $USER
# Log out and back in
```

### Missing Dependencies
```bash
# Reinstall dependencies
cd agent/
./simple-install.sh
```

## 💡 Usage Tips

- **Test First**: Always run with `--once` flag to test connectivity
- **Custom Names**: Use descriptive agent names for multiple machines
- **Intervals**: Adjust reporting frequency based on your needs (30-300 seconds recommended)
- **Background Running**: Use `nohup` or screen for continuous monitoring

## 🎯 Examples

```bash
# Quick test
python3 ~/.devops-agent/simple-agent.py --server http://localhost:8085 --once

# Production server monitoring
python3 ~/.devops-agent/simple-agent.py --server http://192.168.1.100:8085 --name "web-server-01"

# Development machine with custom interval
python3 ~/.devops-agent/simple-agent.py --server http://192.168.1.100:8085 --name "dev-laptop" --interval 120

# Background execution
nohup python3 ~/.devops-agent/simple-agent.py --server http://192.168.1.100:8085 &
```

---

**Simple, lightweight, and effective monitoring for DevOps environments.**