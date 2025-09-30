# 🚀 DevOps Organizer Agent

**Monitor your systems effortlessly!** This lightweight agent collects system information and sends it to your DevOps Organizer management server.

## 📥 Get Started (Choose Your Platform)

### 🪟 **Windows Users** - Ready-to-Run Executable
1. **Download**: Go to [Releases](../../releases) → Download `devops-agent-windows.zip`
2. **Extract**: Unzip the file anywhere you want
3. **Run**: Double-click `devops-agent.exe` 
4. **Setup**: Follow the interactive prompts - it's that easy! 🎉

### 🍎 **macOS Users** - Ready-to-Run Executable  
1. **Download**: Go to [Releases](../../releases) → Download `devops-agent-macos.tar.gz`
2. **Extract**: Double-click to extract or run `tar -xzf devops-agent-macos.tar.gz`
3. **Run**: Open Terminal, navigate to the folder, and run `./devops-agent`
4. **Setup**: Follow the interactive prompts

### 🐧 **Linux Users** - Install Script
1. **Clone/Download**: Get this repository or download the `agent` folder
2. **Install**: 
   ```bash
   cd agent
   ./simple-install.sh
   ```
3. **Run**: 
   ```bash
   python3 ~/.devops-agent/simple-agent.py
   ```
4. **Setup**: Follow the interactive prompts

## ✨ **Super Easy Interactive Mode**

Just run the agent without any arguments and it will guide you through everything:

```
============================================================
🚀 DevOps Organizer Agent - Interactive Setup
============================================================

📡 Management server URL (e.g., http://192.168.1.100:8085): 
🏷️  Agent name (press Enter for 'my-laptop'): 
🔧 Execution mode:
1. Test connection (run once and exit)
2. Continuous monitoring
Choose mode (1 or 2): 
```

**Perfect for beginners!** No need to remember command line arguments.

## 🔧 Advanced Usage (Command Line)

If you prefer command line or want to automate:

```bash
# Test connection
./devops-agent --server http://192.168.1.100:8085 --once

# Continuous monitoring with custom name
./devops-agent --server http://192.168.1.100:8085 --name "my-server"

# Custom reporting interval (60 seconds)
./devops-agent --server http://192.168.1.100:8085 --interval 60

# Force interactive mode
./devops-agent --interactive
```

## 📊 What Gets Monitored

Your agent automatically collects:

- 🖥️ **System Info**: CPU, memory, disk usage, uptime
- 📁 **Projects**: Git repositories with language detection  
- 🐳 **Docker**: Containers and images (if Docker is installed)
- 🔑 **SSH Keys**: Keys in ~/.ssh directory (metadata only, keys stay secure!)

## 📋 All Command Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--server URL` | Management server URL | `--server http://192.168.1.100:8085` |
| `--name NAME` | Custom agent name | `--name "my-laptop"` |
| `--interval SEC` | Report interval (seconds) | `--interval 60` |
| `--once` | Test mode (run once and exit) | `--once` |
| `--interactive` | Force interactive setup | `--interactive` |

## 🆘 Need Help?

### 🔗 **Connection Issues**
- ✅ Make sure your management server is running
- ✅ Check the server URL (include `http://` or `https://`)
- ✅ Test with: `curl http://[SERVER_IP]:8085/api/system/info`

### 🐳 **Docker Not Detected**
- ✅ Install Docker and make sure it's running
- ✅ Add your user to docker group: `sudo usermod -aG docker $USER` (Linux)
- ✅ Log out and back in

### 🍎 **macOS Security Warning**
- ✅ Go to System Preferences → Security & Privacy
- ✅ Click "Allow" when prompted about the executable

### 🐧 **Linux Dependencies**
```bash
# If installation fails, try:
cd agent/
./simple-install.sh
```

## 💡 Pro Tips

- 🎯 **Start Simple**: Always test with "run once" mode first
- 🏷️ **Use Good Names**: Give your agents descriptive names like "web-server-01"
- ⏱️ **Adjust Timing**: 30-60 seconds is good for most use cases
- 🔄 **Background Mode**: Use `nohup` or run as a service for 24/7 monitoring

## 🎯 Real-World Examples

```bash
# Test your setup
./devops-agent --server http://192.168.1.100:8085 --once

# Monitor a web server
./devops-agent --server http://monitoring.company.com:8085 --name "web-server-01"

# Development machine (slower reporting)
./devops-agent --server http://192.168.1.100:8085 --name "dev-laptop" --interval 120
```

## 🔨 For Developers

Want to build your own executables? Every push to main automatically builds Windows and macOS executables. Check the [Actions tab](../../actions) for build status.

---

**🚀 Simple, powerful system monitoring made easy!**