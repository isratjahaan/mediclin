@echo off
title MEDICLIN - Enterprise Hospital Management & Telemedicine SaaS
echo ============================================================================
echo MEDICLIN - One Platform. Every Hospital. Smarter Care.
echo Initializing Enterprise Multi-Tenant Server...
echo ============================================================================
echo Target Market: Bangladesh (BDT Currency, Asia/Dhaka Timezone)
echo Starting at http://127.0.0.1:3000
echo.
call node.cmd --experimental-strip-types src/server.ts
pause
