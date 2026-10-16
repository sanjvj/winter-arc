#!/usr/bin/env bash
if [ -d "$HOME/.local/jvm/jdk-21.0.4+7" ]; then
  export JAVA_HOME="$HOME/.local/jvm/jdk-21.0.4+7"
  export PATH="$JAVA_HOME/bin:$PATH"
fi
exec "$@"
