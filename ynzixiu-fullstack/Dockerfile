# ============================================================
#  云南自修学校 · 多阶段构建
#  阶段一：Maven + JDK 21 编译打包（不复制项目自带的 apache-maven-3.9.9，几十 MB 二进制无需进镜像）
#  阶段二：仅 JRE 运行 jar；frontend 已由 pom 打进 jar 的 classpath:/static/，
#          并额外复制一份到镜像内 /app/frontend 备用，前后端同源单端口 8600
# ============================================================

# ---------- 阶段一：构建 ----------
FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /build

# 保持仓库中 backend/ 与 frontend/ 的兄弟目录关系：
# pom.xml 通过 ${project.basedir}/../frontend 把前端资源打进 jar 的 classpath:/static/，
# 因此 frontend/ 必须与 backend/ 一起进入构建上下文，否则 jar 内会缺少静态资源。
COPY backend/pom.xml backend/pom.xml
COPY backend/src backend/src
COPY frontend/ frontend/

WORKDIR /build/backend

# 先预热依赖以利用镜像层缓存，再打可执行 jar
RUN mvn -B -DskipTests dependency:go-offline
RUN mvn -B -DskipTests package

# ---------- 阶段二：运行 ----------
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

ENV TZ=Asia/Shanghai \
    SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-Xms256m -Xmx512m -Duser.timezone=Asia/Shanghai"

# 安装 curl（HEALTHCHECK 用）与 tzdata（落地 Asia/Shanghai 时区文件）
RUN DEBIAN_FRONTEND=noninteractive apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends curl tzdata \
 && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
 && echo $TZ > /etc/timezone \
 && rm -rf /var/lib/apt/lists/*

# pom 未指定 finalName，产物为 ynzixiu-server-java-1.0.0.jar；
# 用通配符复制并统一改名 app.jar，避免后续改版本导致路径失效。
COPY --from=builder /build/backend/target/*.jar /app/app.jar

# 静态资源实际由 jar 内 classpath:/static/ 提供（pom resources 打包）；
# 这里按初始约定额外保留一份 frontend 目录，便于排查或后续改用 file: 方式托管。
COPY frontend/ /app/frontend/

EXPOSE 8600

# prod 启动需连 MySQL/Redis，首次还可能建表灌数据，给足启动宽限期
HEALTHCHECK --interval=15s --timeout=5s --start-period=90s --retries=5 \
  CMD curl -fsS http://localhost:8600/api/v1/health > /dev/null || exit 1

# 用 sh -c 展开 JAVA_OPTS，exec 保证 SIGTERM 能传给 java 进程
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
