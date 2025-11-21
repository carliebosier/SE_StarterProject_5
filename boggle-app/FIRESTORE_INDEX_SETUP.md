# Firestore Index Setup for Leaderboard

## The Problem

The leaderboard query requires a Firestore composite index because it combines:
- `where('challengeId', '==', challengeId)` 
- `orderBy('score', 'desc')`

Firestore needs an index to efficiently perform this query.

## Quick Fix

When you see the error "Firestore index required", Firestore will provide a link in the browser console:

1. **Open browser console** (F12 or right-click → Inspect → Console tab)
2. **Look for an error** that says something like "The query requires an index"
3. **Click the link** in the error message (it will look like: `https://console.firebase.google.com/...`)
4. **Create the index** - Firebase Console will open with the index creation form
5. **Wait** - Index building usually takes 1-2 minutes
6. **Refresh** your app - The leaderboard should now work!

## Manual Index Creation

If you prefer to create the index manually:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. Configure the index:
   - **Collection ID**: `scores`
   - **Fields to index**:
     - Field: `challengeId` | Order: **Ascending**
     - Field: `score` | Order: **Descending**
   - Click **Create**

## Index Details

The required composite index:
- **Collection**: `scores`
- **Fields**:
  1. `challengeId` (Ascending)
  2. `score` (Descending)
- **Query scope**: Collection

## Alternative: Simpler Query (Without Index)

If you want to avoid the index requirement, you could modify the query to only filter by `challengeId` and sort in JavaScript, but this is less efficient and not recommended for large datasets.

## Troubleshooting

### Index Status
- Check index status in Firebase Console → Firestore → Indexes
- Status should be "Enabled" (not "Building" or "Error")

### Index Building Time
- Small datasets: 1-2 minutes
- Large datasets: 5-10 minutes
- Very large datasets: up to an hour

### Still Not Working?
1. Verify index status is "Enabled"
2. Check Firestore security rules allow reads
3. Verify the query parameters are correct
4. Check browser console for other errors

