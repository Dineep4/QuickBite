<#
Start both backend and frontend in new PowerShell windows.

Usage (PowerShell):
  .\start-servers.ps1

This script opens two new PowerShell windows:
 - backend: runs `node index.js` in server folder
 - frontend: runs `npx http-server . -p 8080` in project root

If port 8080 is busy the script will try 8081.
#>

# Resolve script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "Starting QuickBite servers from $scriptDir"

# Start backend in new window
$serverPath = Join-Path $scriptDir 'server'
Write-Host "Starting backend in new window (server folder: $serverPath)"
Start-Process -WindowStyle Normal -FilePath pwsh -ArgumentList "-NoExit","-Command","cd '$serverPath'; npm start" -ErrorAction SilentlyContinue

# Start frontend in new window on 8080, fallback to 8081
$port = 8080
$started = $false
for ($i=0; $i -lt 3 -and -not $started; $i++) {
  try {
    Start-Process -WindowStyle Normal -FilePath pwsh -ArgumentList "-NoExit","-Command","cd '$scriptDir'; npx http-server . -p $port" -ErrorAction Stop
    Write-Host "Started frontend on port $port"
    $started = $true
  } catch {
    Write-Host "Port $port busy, trying next port"
    $port++
  }
}

if (-not $started) { Write-Host "Could not start frontend on ports 8080-8082" }

Write-Host "Done. Check the new windows for server output."
