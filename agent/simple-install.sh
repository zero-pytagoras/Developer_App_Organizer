#!/bin/bash

# DevOps Organizer Simple Agent - Installation Script
# Just installs dependencies and copies files - no daemon setup

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}  DevOps Organizer Simple Agent Setup${NC}"
    echo -e "${BLUE}================================================${NC}"
}
####
# too many function that do the same thing
####
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

show_help() { #we've talked about this too many times in the class
    cat << EOF
Usage: $0 [OPTIONS]

Simple setup for DevOps Organizer Agent

OPTIONS:
    --install-dir DIR   Installation directory (default: ~/.devops-agent)
    --help              Show this help message

EXAMPLES:
    $0                                    # Install to default location
    $0 --install-dir /opt/devops-agent    # Install to custom location

EOF
}

check_requirements() {
    print_info "Checking requirements..."
    
    # Check Python 3
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is required but not installed"
        exit 1
    fi
    
    # Check pip
    if ! command -v pip3 &> /dev/null; then
        print_error "pip3 is required but not installed"
        exit 1
    fi
    
    python_version=$(python3 --version)
    print_success "Found $python_version"
    print_success "Requirements satisfied"
}

install_dependencies() {
    print_info "Installing Python dependencies..."
    
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    # we mentioned not to declare variables during the script but at the beginning
    if [ ! -f "$SCRIPT_DIR/requirements.txt" ]; then
        print_error "requirements.txt not found in $SCRIPT_DIR"
        exit 1
    fi
    
    # Install dependencies => this never will work, because this variable is created after the venv exists, 
    # so you have to force it to run or the whole `install_dependencies` needs to run as a if condition
    # and needs to `return`  value of success of failure
    if [[ -n "$VIRTUAL_ENV" ]]; then
        print_info "Virtual environment detected: $VIRTUAL_ENV"
        pip3 install -r "$SCRIPT_DIR/requirements.txt"
    else
        print_info "Installing with --user flag"
        pip3 install --user -r "$SCRIPT_DIR/requirements.txt"
    fi
    
    print_success "Dependencies installed"
}

setup_agent() {
    print_info "Setting up agent files..."
    ####
    # once again => do not declare variables during the run but only at the beging 
    ####
    
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # Create installation directory
    mkdir -p "$INSTALL_DIR"
    
    # Copy agent files
    if [ -f "$SCRIPT_DIR/simple-agent.py" ]; then
        cp "$SCRIPT_DIR/simple-agent.py" "$INSTALL_DIR/"
        chmod +x "$INSTALL_DIR/simple-agent.py"
        print_success "Copied simple-agent.py"
    else
        print_error "simple-agent.py not found"
        exit 1
    fi
    
    if [ -f "$SCRIPT_DIR/requirements.txt" ]; then
        cp "$SCRIPT_DIR/requirements.txt" "$INSTALL_DIR/"
        print_success "Copied requirements.txt"
    fi
    
    print_success "Agent files set up in $INSTALL_DIR"
}

show_usage_instructions() {
    print_success "Setup completed!"
    ####
    # this is definately not how i taught this.
    ####
    echo
    echo -e "${BLUE}Agent Location:${NC}"
    echo "  $INSTALL_DIR/simple-agent.py"
    echo
    echo -e "${BLUE}Usage Examples:${NC}"
    echo "  # Run once and exit"
    echo "  python3 $INSTALL_DIR/simple-agent.py --server http://192.168.1.100:8085 --once"
    echo
    echo "  # Run continuously (default 30s interval)"
    echo "  python3 $INSTALL_DIR/simple-agent.py --server http://192.168.1.100:8085"
    echo
    echo "  # Run with custom name and interval"
    echo "  python3 $INSTALL_DIR/simple-agent.py --server http://192.168.1.100:8085 --name \"my-laptop\" --interval 60"
    echo
    echo -e "${BLUE}Available Options:${NC}"
    echo "  --server URL     Management server URL (required)"
    echo "  --name NAME      Agent name (default: hostname)"
    echo "  --interval SEC   Report interval in seconds (default: 30)"
    echo "  --once           Run once and exit"
    echo
    echo -e "${YELLOW}Quick Start:${NC}"
    echo "  1. Start your management server"
    echo "  2. Run: python3 $INSTALL_DIR/simple-agent.py --server http://[SERVER]:8085 --once"
    echo "  3. Check the management UI to see your agent data"
    echo
    echo -e "${YELLOW}For Continuous Monitoring:${NC}"
    echo "  python3 $INSTALL_DIR/simple-agent.py --server http://[SERVER]:8085"
    echo "  (Press Ctrl+C to stop)"
}

main() {
    # Default values
    INSTALL_DIR="$HOME/.devops-agent"
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --install-dir)
                INSTALL_DIR="$2"
                shift 2
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    print_header
    #you will never know if any of these function will run or fail...
    check_requirements
    install_dependencies
    setup_agent
    show_usage_instructions
}

main "$@"
