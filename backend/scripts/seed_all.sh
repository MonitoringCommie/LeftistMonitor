#!/bin/bash
# Master seed script for LeftistMonitor database
# Seeds all empty tables with comprehensive data on leftist movements, labor, and liberation struggles
# Usage: ./seed_all.sh [database_name]

set -e

# Configuration
DB_NAME="${1:-leftist_monitor}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/seed_$(date +%Y%m%d_%H%M%S).log"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Start seeding
log "Starting LeftistMonitor database seeding..."
log "Target database: $DB_NAME"
log "Log file: $LOG_FILE"

# Check if database exists
if ! psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    error "Database '$DB_NAME' does not exist. Please create it first."
fi

# Verify all seed scripts exist
SEED_SCRIPTS=(
    "seed_ideologies.sql"
    "seed_labor.sql"
    "seed_media.sql"
    "seed_research.sql"
    "seed_gaza.sql"
)

for script in "${SEED_SCRIPTS[@]}"; do
    if [ ! -f "$SCRIPT_DIR/$script" ]; then
        error "Seed script not found: $SCRIPT_DIR/$script"
    fi
done

log "All seed scripts found. Beginning seeding process..."
echo ""

# Execute seed scripts in order
log "1/5 Seeding ideologies..."
if psql -d "$DB_NAME" -f "$SCRIPT_DIR/seed_ideologies.sql" >> "$LOG_FILE" 2>&1; then
    log "   ✓ Ideologies seeded successfully"
else
    error "Failed to seed ideologies"
fi

log "2/5 Seeding labor organizations and strikes..."
if psql -d "$DB_NAME" -f "$SCRIPT_DIR/seed_labor.sql" >> "$LOG_FILE" 2>&1; then
    log "   ✓ Labor data seeded successfully"
else
    warning "Labor seeding encountered issues (may be due to missing country references). Continuing..."
fi

log "3/5 Seeding media resources..."
if psql -d "$DB_NAME" -f "$SCRIPT_DIR/seed_media.sql" >> "$LOG_FILE" 2>&1; then
    log "   ✓ Media resources seeded successfully"
else
    error "Failed to seed media resources"
fi

log "4/5 Seeding research pathways and featured collections..."
if psql -d "$DB_NAME" -f "$SCRIPT_DIR/seed_research.sql" >> "$LOG_FILE" 2>&1; then
    log "   ✓ Research pathways and collections seeded successfully"
else
    error "Failed to seed research data"
fi

log "5/5 Seeding Gaza siege statistics..."
if psql -d "$DB_NAME" -f "$SCRIPT_DIR/seed_gaza.sql" >> "$LOG_FILE" 2>&1; then
    log "   ✓ Gaza data seeded successfully"
else
    warning "Gaza seeding encountered issues. Continuing..."
fi

echo ""
log "=========================================="
log "Database seeding complete!"
log "=========================================="

# Summary statistics
log "Attempting to retrieve summary statistics..."
echo ""

echo "Ideology count:"
psql -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM ideologies;" 2>/dev/null || echo "(Unable to retrieve)"

echo "Labor organization count:"
psql -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM labor_organizations;" 2>/dev/null || echo "(Unable to retrieve)"

echo "Strike count:"
psql -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM strikes;" 2>/dev/null || echo "(Unable to retrieve)"

echo "Media resource count:"
psql -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM media_resources;" 2>/dev/null || echo "(Unable to retrieve)"

echo "Research pathway count:"
psql -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM research_pathways;" 2>/dev/null || echo "(Unable to retrieve)"

echo "Featured collection count:"
psql -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM featured_collections;" 2>/dev/null || echo "(Unable to retrieve)"

echo "Gaza data years count:"
psql -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM gaza_siege_data WHERE year > 0;" 2>/dev/null || echo "(Unable to retrieve)"

echo ""
log "Full log saved to: $LOG_FILE"
log "Seeding finished successfully!"
