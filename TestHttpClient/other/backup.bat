@rem copy everything *except* node_modules
@set SRC=..\..\TestHttpClient
@set DST=M:\temp\TestHttpClient
@if "%1"=="" goto USAGE

xcopy %SRC% %DST%.%1 /S /I /exclude:except.txt
goto EXIT

:USAGE:
@echo EXAMPLE USAGE: backup bu2

:EXIT