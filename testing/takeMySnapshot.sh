set -e

cd testing
node screenshot.js $1 snapshot_$2_$3
echo "taking snapshot for mutation"