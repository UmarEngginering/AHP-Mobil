@echo off
title AHP Decision Support System - Pemilihan Mobil Terbaik
echo ======================================================================
echo    SISTEM PENDUKUNG KEPUTUSAN (SPK) - METODE AHP
echo    Studi Kasus: Pemilihan Mobil Terbaik Berdasarkan Data Excel
echo ======================================================================
echo.
echo [1/2] Memeriksa dependensi Python...
python -m pip install -r requirements.txt
echo.
echo [2/2] Memulai Web Application Server...
echo Buka browser di: http://127.0.0.1:5050
echo Tekan Ctrl+C di terminal ini untuk menghentikan server.
echo.
start http://127.0.0.1:5050
python app.py
pause
