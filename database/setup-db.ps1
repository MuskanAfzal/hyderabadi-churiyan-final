Write-Host "Creating database..."

& "C:\Program Files\PostgreSQL\17\bin\createdb.exe" -U postgres nest_ecommerce

Write-Host "Running migrations..."

Get-ChildItem ".\database\migrations\*.sql" | Sort-Object Name | ForEach-Object {
    Write-Host "Running $($_.Name)"
    & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d nest_ecommerce -f $_.FullName
}

Write-Host "Seeding database..."

& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d nest_ecommerce -f ".\database\seed\seed.sql"

Write-Host "Database setup complete."
