@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo === 编译 ===
javac -encoding UTF-8 Drill.java Answer.java
if errorlevel 1 goto fail

echo.
echo === 你的练习 Drill.java ===
java -Dfile.encoding=UTF-8 -Dstdout.encoding=UTF-8 -cp . Drill

echo.
echo === 参考答案 Answer.java（应全部通过）===
java -Dfile.encoding=UTF-8 -Dstdout.encoding=UTF-8 -cp . Answer

echo.
pause
goto :eof

:fail
echo.
echo 编译失败，请按上方错误信息修改后重试。
pause
