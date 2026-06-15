@echo off
cd /d "C:\Users\skps9\Documents\Code_Project\Earth Online App\Earth_Online_v.2.0"
call npx expo run:android > build-log.txt 2>&1
echo BUILD COMPLETE >> build-log.txt
