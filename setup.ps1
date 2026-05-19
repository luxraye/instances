# BOBS eServices -- First-time setup script
# Run from the project root: .\setup.ps1

Write-Host ''
Write-Host '=== BOBS eServices Setup ===' -ForegroundColor Cyan
Write-Host ''

# 0. Check yarn is available
$yarnVersion = yarn --version 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host '0. Installing yarn via npm...' -ForegroundColor Yellow
  npm install -g yarn
  if ($LASTEXITCODE -ne 0) { Write-Host 'ERROR: could not install yarn' -ForegroundColor Red; exit 1 }
} else {
  Write-Host "0. yarn $yarnVersion found -- OK" -ForegroundColor Green
}

# 1. Install dependencies
Write-Host ''
Write-Host '1. Installing dependencies...' -ForegroundColor Yellow
yarn install
if ($LASTEXITCODE -ne 0) { Write-Host 'ERROR: yarn install failed' -ForegroundColor Red; exit 1 }

# 2. Generate Prisma client for SQLite
Write-Host ''
Write-Host '2. Generating Prisma client...' -ForegroundColor Yellow
yarn prisma generate
if ($LASTEXITCODE -ne 0) { Write-Host 'ERROR: prisma generate failed' -ForegroundColor Red; exit 1 }

# 3. Push schema to SQLite (creates prisma/dev.db)
Write-Host ''
Write-Host '3. Pushing schema to SQLite database...' -ForegroundColor Yellow
yarn prisma db push
if ($LASTEXITCODE -ne 0) { Write-Host 'ERROR: prisma db push failed' -ForegroundColor Red; exit 1 }

# 4. Seed with BOBS data
Write-Host ''
Write-Host '4. Seeding BOBS data...' -ForegroundColor Yellow
yarn tsx prisma/seed.ts
if ($LASTEXITCODE -ne 0) { Write-Host 'ERROR: seed failed' -ForegroundColor Red; exit 1 }

Write-Host ''
Write-Host '=== Setup complete! ===' -ForegroundColor Green
Write-Host ''
Write-Host 'Start the dev server:' -ForegroundColor Cyan
Write-Host '  yarn dev' -ForegroundColor White
Write-Host ''
Write-Host 'Then open: http://localhost:3000' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Demo credentials (password: Bobs2026!)' -ForegroundColor Yellow
Write-Host '  admin@bobs.gov.bw        BOBS Admin'
Write-Host '  reviewer@bobs.gov.bw     Reviewer'
Write-Host '  quality@bokomo.co.bw     Bokomo Botswana'
Write-Host '  compliance@bolux.co.bw   Bolux Group'
Write-Host '  quality@bvi.co.bw        Botswana Vaccine Institute'
Write-Host '  qms@kalcon.co.bw         KALCON'
Write-Host '  compliance@bhc.co.bw     Botswana Housing Corp'
Write-Host ''
