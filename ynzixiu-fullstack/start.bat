@echo off
chcp 65001 >nul
setlocal

rem ============================================================
rem  云南自修学校 · Windows 一键启动
rem  用法： start.bat        -> dev（默认，H2 内存库，无需 MySQL/Redis）
rem         start.bat prod   -> prod（需外部 MySQL/Redis；生产部署建议用 docker compose）
rem  前后端同源单端口： http://localhost:8600/（可设 SERVER_PORT 换端口）
rem  说明： spring-boot:run 是阻塞命令，因此把后端放到独立窗口运行，
rem         主脚本等待约 25 秒后打开浏览器；首次编译较慢，可稍后刷新。
rem ============================================================

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "MVN=%BACKEND%\apache-maven-3.9.9\bin\mvn.cmd"

rem 端口可用 SERVER_PORT 覆盖（8600 被占用时）；Spring Boot 会读取该环境变量
if not defined SERVER_PORT set "SERVER_PORT=8600"
set "APP_URL=http://localhost:%SERVER_PORT%/"

rem ---- 1. 检查 Java ----
where java >nul 2>nul
if errorlevel 1 (
  echo [错误] 未检测到 java 命令，请安装 JDK 21 并配置 JAVA_HOME / PATH。
  pause
  exit /b 1
)
echo [信息] 当前 Java 版本：
java -version 2>&1

rem ---- 2. 检查项目自带 Maven ----
if not exist "%MVN%" (
  echo [错误] 未找到项目自带 Maven：%MVN%
  pause
  exit /b 1
)

rem ---- 3. 选择 profile ----
if /I "%~1"=="prod" (
  set "SPRING_PROFILES_ACTIVE=prod"
  echo [信息] 使用 prod profile（需要可用的 MySQL 与 Redis）。
) else (
  set "SPRING_PROFILES_ACTIVE=dev"
  echo [信息] 使用 dev profile（H2 内存库，启动即自动建表灌数据，无需外部依赖）。
)

echo.
echo   访问地址： %APP_URL%
echo   若浏览器打开过早，请稍后手动刷新该地址。
echo.

rem ---- 4. 在 backend 目录用自带 Maven 后台启动（窗口标题 ynzixiu-server）----
rem     pom 会把 ../frontend 打进 classpath:/static/，前后端同源单端口，无需额外前端服务器。
pushd "%BACKEND%"
start "ynzixiu-server" /MIN "%MVN%" -q -DskipTests spring-boot:run
popd

rem ---- 5. 等待后端就绪后打开浏览器 ----
echo [信息] 正在启动后端，约 25 秒后自动打开浏览器...
timeout /t 25 /nobreak >nul
start "" "%APP_URL%"

echo.
echo [信息] 后端在最小化的 "ynzixiu-server" 窗口中运行；关闭该窗口即可停止服务。
echo [信息] 若页面无法访问，请切到该窗口查看启动日志（例如端口被占用、首次编译较慢）。
pause
endlocal
