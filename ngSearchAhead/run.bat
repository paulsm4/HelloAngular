@rem: Execute Angular app
@rem EXAMPLE USAGE (from project folder): ..\run
@rem NOTE: Webpack requires "--host 0.0.0.0 --disable-host-check" in order to browse to app from other hosts
if not exist node_modules (
call npm install
)
ng serve --host 0.0.0.0 --disable-host-check