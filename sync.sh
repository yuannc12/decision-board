#!/bin/sh
# Pull the skill and the template from their source of truth.
#
# board.template.html is generated from the worked example
# (apps/landing/public/lab/decision-simulator/index.html) so the template and
# the live board cannot drift. This copies both artefacts here; it never edits
# them. Run it, review the diff, commit.
set -e
SRC="${KEFTEK_REPO:-$HOME/Powerhouse/keftek}/apps/landing/public/lab/decision-simulator"
[ -d "$SRC" ] || { echo "keftek checkout not found at $SRC — set KEFTEK_REPO"; exit 1; }
python3 "${KEFTEK_REPO:-$HOME/Powerhouse/keftek}/scripts/build-board-template.py"
cp "$SRC/skill.md"             SKILL.md
cp "$SRC/board.template.html"  assets/board.template.html
echo "synced: SKILL.md, assets/board.template.html"
