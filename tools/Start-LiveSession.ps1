# Opt-in current-user supervisor. No installation, admin escalation, or firewall changes.
[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$Collector,
      [string]$DataDir=(Join-Path $env:LOCALAPPDATA 'VEKAID\Live'),
      [switch]$CodexQuota)
$ErrorActionPreference='Stop'
$collectorPath=(Resolve-Path -LiteralPath $Collector).Path
$bridgePath=Join-Path $PSScriptRoot 'live_bridge.py'
$python=(Get-Command py.exe -CommandType Application -ErrorAction Stop).Source
[IO.Directory]::CreateDirectory($DataDir)|Out-Null
$snapshot=Join-Path $DataDir 'snapshot.json'
$tokenPath=Join-Path $DataDir 'pairing-token.dpapi'
if(!(Test-Path -LiteralPath $tokenPath)){
  $bytes=New-Object byte[] 32
  $rng=[Security.Cryptography.RandomNumberGenerator]::Create()
  try{$rng.GetBytes($bytes)}finally{$rng.Dispose()}
  $token=[Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+','-').Replace('/','_')
  $secure=ConvertTo-SecureString $token -AsPlainText -Force
  $secure|ConvertFrom-SecureString|Set-Content -LiteralPath $tokenPath -Encoding ASCII
}
$secure=Get-Content -LiteralPath $tokenPath -Raw|ConvertTo-SecureString
$ptr=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try{$env:VEKAID_BRIDGE_TOKEN=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)}
finally{[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)}
$collectorJob=$null
$bridgeJob=$null
try{
  $collectorJob=Start-Job -ScriptBlock {
    param($script,$file,$quota)
    Remove-Item Env:VEKAID_BRIDGE_TOKEN -ErrorAction SilentlyContinue
    & $script -Watch -IntervalSeconds 15 -OutputPath $file -CodexQuota:$quota
  } -ArgumentList $collectorPath,$snapshot,[bool]$CodexQuota
  $bridgeJob=Start-Job -ScriptBlock {
    param($exe,$script,$file)
    & $exe -3 $script --snapshot $file
  } -ArgumentList $python,$bridgePath,$snapshot
  Remove-Item Env:VEKAID_BRIDGE_TOKEN -ErrorAction SilentlyContinue
  while($true){
    foreach($job in @($collectorJob,$bridgeJob)){
      Receive-Job -Job $job -ErrorAction Continue|Out-Null
      if($job.State -notin @('Running','NotStarted')){throw 'Live service stopped; restart supervisor.'}
    }
    Start-Sleep -Seconds 5
  }
}finally{
  Remove-Item Env:VEKAID_BRIDGE_TOKEN -ErrorAction SilentlyContinue
  foreach($job in @($collectorJob,$bridgeJob)){
    if($null -ne $job){Stop-Job $job -ErrorAction SilentlyContinue;Remove-Job $job -Force -ErrorAction SilentlyContinue}
  }
}
