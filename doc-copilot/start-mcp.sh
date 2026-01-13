#!/bin/bash
cd "$(dirname "$0")" || exit 1
exec node ./mcp-server/dist/index.js "$@"
