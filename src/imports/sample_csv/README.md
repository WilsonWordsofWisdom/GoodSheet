# Sample CSVs — User-data tables

Dummy data for the Circle Of Life user-data tables. Use these to seed a database, validate schemas, or as fixtures in tests.

## Conventions used

- **IDs:** UUIDv4-style strings. Photo refs use the `photo:{logId}` pattern.
- **Timestamps:** ISO 8601 UTC (`YYYY-MM-DDTHH:MM:SSZ`).
- **Booleans:** `true` / `false`.
- **Enums:** strings from a fixed set (see column notes below).
- **Nullable fields:** represented by an empty value between commas (e.g. `,,`).
- **List fields** (e.g. `chips` in `sai_messages`): pipe-separated within a single CSV cell to keep CSV parsable.

## Files

| File | Table | Notes |
|---|---|---|
| `profiles.csv` | profiles | Rows include nullable age/weight/height (row 3). |
| `user_goals.csv` | user_goals (M2M) | Multiple goals per user. |
| `meal_logs.csv` | meal_logs | Includes nullable food_name/cuisine/calories (row 5 free-text only) and nullable thumbnail_ref. |
| `meal_log_tags.csv` | meal_log_tags (M2M) | One tag per row. |
| `exercise_logs.csv` | exercise_logs | `intensity` ∈ {low, medium, high}. |
| `stool_logs.csv` | stool_logs | `bristol_type` ∈ 1–7; nullable urgency/ease (row 7). |
| `photos.csv` | photos | base64 data truncated for brevity. Only present when user opted in. |
| `tag_calorie_overrides.csv` | tag_calorie_overrides | Per-user kcal corrections. |
| `pattern_insights_cache.csv` | pattern_insights_cache | Materialized correlation results; only rows with ≥5 occurrences and lift ≥1.5. |
| `sai_messages.csv` | sai_messages | `role` ∈ {sai, user}. `chips` is pipe-separated. |
| `reminders_config.csv` | reminders_config | All time fields nullable when `enabled=false` (row 3). |

## Enum reference

- `meal_logs.cuisine` — free text but app uses: Singaporean, Chinese, Malay, Indian, Western, Italian, Korean, Japanese, Drink, Snack
- `exercise_logs.activity` — Walk, Run, Yoga, Gym, Cycle, Swim
- `exercise_logs.intensity` — low, medium, high
- `stool_logs.bristol_type` — 1, 2, 3, 4, 5, 6, 7
- `stool_logs.urgency` — low, medium, high (nullable)
- `stool_logs.ease` — easy, normal, strained (nullable)
- `pattern_insights_cache.outcome` — loose, optimal, constipated
- `sai_messages.role` — sai, user

## Foreign-key relationships

```
profiles.id ──┬── meal_logs.user_id
              ├── exercise_logs.user_id
              ├── stool_logs.user_id
              ├── photos.user_id
              ├── tag_calorie_overrides.user_id
              ├── pattern_insights_cache.user_id
              ├── sai_messages.user_id
              ├── reminders_config.user_id
              └── user_goals.user_id

meal_logs.id ── meal_log_tags.meal_log_id
meal_logs.id ── photos.log_id (when log_type='meal')
stool_logs.id ── photos.log_id (when log_type='stool')
```

## Notes

- These CSVs assume Option B from the schema discussion (separate per-type tables). For Option A (single denormalized `timeline_entries`), merge `meal_logs` + `exercise_logs` + `stool_logs` into one file with type-specific columns nullable.
- `photos.data_base64` shown truncated. Real values would be ≤50KB JPEGs as per F01 opt-in policy.
