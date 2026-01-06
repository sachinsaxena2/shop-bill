# Version Update Guide

## How to Update App Version

Before rebuilding the APK, update these version numbers in `app.json`:

### 1. Version String (Human-Readable)
**Location:** Line 5 in `app.json`
```json
"version": "1.0.0"
```

**Update to:**
- Patch release (bug fixes): `"1.0.1"`, `"1.0.2"`, etc.
- Minor release (new features): `"1.1.0"`, `"1.2.0"`, etc.
- Major release (breaking changes): `"2.0.0"`, `"3.0.0"`, etc.

### 2. Android Version Code (Numeric)
**Location:** Inside `android` section in `app.json`
```json
"versionCode": 1
```

**Update to:**
- Must be an **integer**
- Must **increment** with each build: `2`, `3`, `4`, etc.
- Android uses this to determine if an APK is newer

### Example Version Updates

| Build | version  | versionCode | Description |
|-------|----------|-------------|-------------|
| 1st   | "1.0.0"  | 1           | Initial release |
| 2nd   | "1.0.1"  | 2           | Bug fixes |
| 3rd   | "1.1.0"  | 3           | New features |
| 4th   | "1.1.1"  | 4           | More bug fixes |
| 5th   | "2.0.0"  | 5           | Major update |

## Quick Update Steps

1. **Open `app.json`**

2. **Update version string:**
   ```json
   "version": "1.0.1"  // Change this
   ```

3. **Increment versionCode:**
   ```json
   "versionCode": 2  // Increment by 1
   ```

4. **Save the file**

5. **Rebuild APK:**
   ```bash
   eas build -p android --profile production
   ```

## Important Notes

⚠️ **Android Version Code Rules:**
- Must always increase (never decrease)
- Used by Android to determine update eligibility
- If you try to install an APK with same/lower versionCode, it will fail

✅ **Best Practice:**
- Update both `version` and `versionCode` together
- Keep track of versions in git commits
- Use semantic versioning for `version` string

## Current Version
- **version:** "1.0.0"
- **versionCode:** 1

Next update should be:
- **version:** "1.0.1" (or "1.1.0" depending on changes)
- **versionCode:** 2
