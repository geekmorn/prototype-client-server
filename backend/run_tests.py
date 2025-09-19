#!/usr/bin/env python3
"""
Test runner script for the expense tracking API.
This script runs all tests.
"""

import subprocess
import sys
import os


def run_tests():
    """Run all tests."""
    # Change to the backend directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Run pytest
    cmd = [
        sys.executable, "-m", "pytest",
        "tests/",
        "-v",
        "--tb=short"
    ]
    
    print("Running tests...")
    print(f"Command: {' '.join(cmd)}")
    print("-" * 50)
    
    result = subprocess.run(cmd, capture_output=False)
    
    if result.returncode == 0:
        print("\n" + "=" * 50)
        print("✅ All tests passed!")
        print("=" * 50)
    else:
        print("\n" + "=" * 50)
        print("❌ Some tests failed")
        print("=" * 50)
        sys.exit(1)


if __name__ == "__main__":
    run_tests()
