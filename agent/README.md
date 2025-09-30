# DevOps Organizer Agent

A lightweight monitoring agent that collects system information and sends it to the central management server.

## 🚀 Quick Start

### Option 1: Download Pre-built Executables

Download the latest release from the [Releases page](../../releases) for your platform:

- **Linux**: `devops-agent-linux-x64.tar.gz`
- **Windows**: `devops-agent-windows-x64.zip` 
- **macOS**: `devops-agent-macos-x64.tar.gz`

Extract and run:
```bash
# Linux/macOS
./devops-agent --server http://your-server:8085 --once

# Windows
devops-agent.exe --server http://your-server:8085 --once
```

### Option 2: Install from Source

1. **Install Agent**:
   ```bash
   ./simple-install.sh
   ```

2. **Run Agent**:
   ```bash
   # Test run (execute once and exit)
   python3 ~/.devops-agent/simple-agent.py --server http://[SERVER_IP]:8085 --once

   # Continuous monitoring
   python3 ~/.devops-agent/simple-agent.py --server http://[SERVER_IP]:8085

   # With custom name and interval
   python3 ~/.devops-agent/simple-agent.py --server http://192.168.1.100:8085 --name "my-laptop" --interval 60
   ```

## 🔨 Building Executables

Every push to main automatically builds executables for Linux, Windows, and macOS. Check the [Actions tab](../../actions) for build status.

To create a release, go to Actions → "Make Release" and enter a version like `v1.0.0`.

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