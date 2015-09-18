Write-Host "Powershell Version:" $PSVersionTable.PSVersion
$cmd = "& apm test --no-color --one --path $env:LOCALAPPDATA\Atom\resources\cli\atom.cmd"
$OutputVariable = invoke-expression $cmd | Out-String
Write-Host $OutputVariable
if(-Not $OutputVariable.contains(", 0 failures,")){
  Throw "apm test failed"
}
