#!/usr/bin/env bash
# ============================================================
#  云南自修学校 · Linux/macOS 一键启动
#  用法： ./start.sh        -> dev（默认，H2 内存库，无需 MySQL/Redis）
#         ./start.sh prod   -> prod（需外部 MySQL/Redis；生产部署建议用 docker compose）
#  前后端同源单端口： http://localhost:8600/
#  首次使用请先赋予可执行权限： chmod +x start.sh
#  说明： spring-boot:run 阻塞，故把「延时打开浏览器」放到后台子 shell；
#         后端在前台运行，按 Ctrl+C 即可停止并查看日志。
# ============================================================

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$ROOT/backend"
MVN="$BACKEND/apache-maven-3.9.9/bin/mvn"

# 1. 检查 Java
if ! command -v java >/dev/null 2>&1; then
  echo "[错误] 未检测到 java 命令，请安装 JDK 21 并配置 JAVA_HOME / PATH。" >&2
  exit 1
fi
echo "[信息] 当前 Java 版本："
java -version 2>&1

# 2. 检查项目自带 Maven（Linux/macOS 下自带 mvn 可能没有执行位）
if [ ! -f "$MVN" ]; then
  echo "[错误] 未找到项目自带 Maven：$MVN" >&2
  exit 1
fi
chmod +x "$MVN" 2>/dev/null || true

# 3. 选择 profile
if [ "${1:-}" = "prod" ]; then
  export SPRING_PROFILES_ACTIVE=prod
  echo "[信息] 使用 prod profile（需要可用的 MySQL 与 Redis）。"
else
  export SPRING_PROFILES_ACTIVE=dev
  echo "[信息] 使用 dev profile（H2 内存库，启动即自动建表灌数据，无需外部依赖）。"
fi

# 端口可用 SERVER_PORT 覆盖（8600 被占用时）；Spring Boot 会读取该环境变量
PORT="${SERVER_PORT:-8600}"
export SERVER_PORT="$PORT"
URL="http://localhost:${PORT}/"

echo
echo "   访问地址： $URL"
echo "   停止服务：按 Ctrl+C"
echo

# 4. 延时打开浏览器（后台，不阻塞后端）
(
  sleep 25
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$URL" >/dev/null 2>&1 || true
  elif command -v open >/dev/null 2>&1; then
    open "$URL" >/dev/null 2>&1 || true
  fi
) &
BROWSER_PID=$!

# 5. 在 backend 目录用自带 Maven 启动（前台）
#    pom 会把 ../frontend 打进 classpath:/static/，前后端同源单端口，无需额外前端服务器。
cd "$BACKEND"
trap 'kill "$BROWSER_PID" 2>/dev/null || true' EXIT
"$MVN" -q -DskipTests spring-boot:run
