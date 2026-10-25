"""Pytest global fixtures and environment configuration."""

import os
import pytest

# Ensure testing environment is active
os.environ["ENVIRONMENT"] = "testing"
