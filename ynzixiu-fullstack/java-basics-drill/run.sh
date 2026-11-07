#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

echo "=== 编译 ==="
javac -encoding UTF-8 Drill.java Answer.java

echo
echo "=== 你的练习 Drill.java ==="
java -Dfile.encoding=UTF-8 -Dstdout.encoding=UTF-8 -cp . Drill

echo
echo "=== 参考答案 Answer.java（应全部通过）==="
java -Dfile.encoding=UTF-8 -Dstdout.encoding=UTF-8 -cp . Answer
