
@REM รันโดยใช้ตำสั่ง
@REM .\copy-switch-to-pi.bat

@echo off
REM Batch script to deploy switch feature files to Raspberry Pi

set PI_USER=wasankds
set PI_HOST=pi3
set PI_BASE=~/egle-eye

scp "D:\aWK_LeaseSystem\egle-eye\routes\switchRouter.js" %PI_USER%@%PI_HOST%:%PI_BASE%/routes/
scp "D:\aWK_LeaseSystem\egle-eye\views\switch.ejs" %PI_USER%@%PI_HOST%:%PI_BASE%/views/
scp "D:\aWK_LeaseSystem\egle-eye\public\css\switch.css" %PI_USER%@%PI_HOST%:%PI_BASE%/public/css/
scp "D:\aWK_LeaseSystem\egle-eye\public\js\switch.js" %PI_USER%@%PI_HOST%:%PI_BASE%/public/js/

echo Deploy complete.

@REM pause
