# 🚀 START HERE - Database Setup

## ⚠️ YOU'RE GETTING ERRORS BECAUSE:

You're running the files in the **WRONG ORDER**.

## ✅ CORRECT WAY (2 Simple Steps):

### Step 1: Run This File FIRST
```
File: STEP_1_RUN_THIS_FIRST.sql
```

**How:**
1. Open Supabase SQL Editor
2. Open the file `STEP_1_RUN_THIS_FIRST.sql`
3. Copy EVERYTHING (Ctrl+A, Ctrl+C)
4. Paste into SQL Editor
5. Click "Run" button
6. Wait for "✅ STEP 1 COMPLETE!"

### Step 2: Run This File SECOND
```
File: STEP_2_RUN_THIS_SECOND.sql
```

**How:**
1. In SQL Editor, click "New Query"
2. Open the file `STEP_2_RUN_THIS_SECOND.sql`
3. Copy EVERYTHING (Ctrl+A, Ctrl+C)
4. Paste into SQL Editor
5. Click "Run" button
6. See "✅ STEP 2 COMPLETE! Posts: 10, Media: 6..."

## ✅ Done!

Your database now has:
- 10 sample posts
- 6 media items
- 6 library documents
- 6 encyclopaedia entries
- 3 alerts
- 32 countries

## 🚨 Still Getting Errors?

### Error: "column standfirst does not exist"
**You skipped Step 1!** Run `STEP_1_RUN_THIS_FIRST.sql` first.

### Error: "relation posts already exists"
**You already ran Step 1.** Skip to Step 2.

### Error: "duplicate key value"
**You already ran Step 2.** Your data is already loaded!

## 📁 File Guide

| File Name | When to Use |
|-----------|-------------|
| **STEP_1_RUN_THIS_FIRST.sql** | Run FIRST - Creates tables |
| **STEP_2_RUN_THIS_SECOND.sql** | Run SECOND - Adds data |
| schema.sql | Same as STEP_1 (different name) |
| sample-data.sql | Same as STEP_2 (different name) |
| functions.sql | Optional - Advanced features |

## 🎯 Quick Summary

```
❌ WRONG:
   sample-data.sql → ERROR!

✅ RIGHT:
   STEP_1_RUN_THIS_FIRST.sql → STEP_2_RUN_THIS_SECOND.sql → Success!
```

## 📖 Need More Help?

Read these files in order:
1. This file (START_HERE.md) ← You are here
2. QUICK_START.md - 3-minute guide
3. SETUP_INSTRUCTIONS.md - Detailed guide
4. FIX_SUMMARY.md - Technical details

---

**Just run the 2 STEP files in order and you're done!** 🎉
