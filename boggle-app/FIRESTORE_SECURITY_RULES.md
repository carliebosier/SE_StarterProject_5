# Firestore Security Rules Guide

## Understanding the Warning

When you see the warning: **"Your security rules are defined as public, so anyone can steal, modify, or delete data in your database"**

This means your current rules allow **anyone on the internet** (not just you) to:
- ✅ Read all your data
- ✅ Write/update data
- ✅ Delete data

### Is This Safe?

**For Development/Testing**: ✅ **Temporarily OK** if:
- You're just testing locally
- You haven't deployed your app yet
- You don't have sensitive user data
- You plan to change the rules before production

**For Production**: ❌ **NEVER use open rules in production!**
- Anyone can delete all your challenges
- Anyone can modify your data
- This is a serious security risk

## Rule Options

### 1. Completely Open (Test Mode) - Use ONLY for Initial Setup

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**When to use:**
- Initial setup and testing
- Populating challenges for the first time
- Local development only

**When NOT to use:**
- After you've populated challenges
- When you have user data
- In production
- When your app is deployed

### 2. Read-Only Challenges (Recommended for Development)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /challenges/{challengeId} {
      allow read: if true;      // Anyone can read challenges
      allow write: if false;    // No one can write (use Firebase Console)
    }
  }
}
```

**When to use:**
- After you've populated challenges
- During development
- When you want to prevent accidental deletions

**Benefits:**
- Challenges are publicly readable (good for your app)
- Prevents client-side modifications
- You can still modify via Firebase Console

### 3. With Authentication (Production-Ready)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Challenges - public read, admin write
    match /challenges/{challengeId} {
      allow read: if true;
      allow write: if request.auth != null && 
                   request.auth.token.admin == true;
    }
    
    // Scores - public read, users write their own
    match /scores/{userId} {
      allow read: if true;
      allow create, update: if request.auth != null && 
                             request.auth.uid == userId;
      allow delete: if false;
    }
  }
}
```

**When to use:**
- After implementing Google Sign-In
- When you have user authentication
- In production
- When you have user-generated data

## Recommended Progression

### Step 1: Initial Setup (Now)
```
Use: Completely Open Rules
Purpose: Populate challenges easily
Duration: Just long enough to populate challenges
```

### Step 2: Development (After Populating)
```
Use: Read-Only Challenges Rules
Purpose: Protect challenges from accidental modification
Duration: Until you add authentication
```

### Step 3: With Authentication (Before Production)
```
Use: Production Rules with Authentication
Purpose: Secure user data and prevent unauthorized access
Duration: Ongoing in production
```

## How to Change Rules

1. Go to Firebase Console
2. Navigate to Firestore Database > Rules
3. Paste your new rules
4. Click "Publish"
5. Rules take effect immediately

## Testing Your Rules

You can test your rules in the Firebase Console:
1. Go to Firestore Database > Rules
2. Click "Rules Playground"
3. Test different scenarios:
   - Unauthenticated read
   - Authenticated write
   - etc.

## Common Mistakes

### ❌ Leaving Open Rules in Production
**Don't**: Deploy with `allow read, write: if true`
**Do**: Always use authenticated rules in production

### ❌ Using Open Rules Too Long
**Don't**: Keep open rules "just for testing" for weeks
**Do**: Switch to read-only or authenticated rules as soon as possible

### ❌ Not Testing Rules
**Don't**: Assume rules work without testing
**Do**: Test rules in Rules Playground before deploying

## For Your Current Situation

Since you're just setting up and populating challenges:

1. **Right Now**: Use completely open rules to populate challenges
2. **After Populating**: Switch to read-only challenges rules
3. **After Adding Auth**: Switch to production rules with authentication
4. **Before Deploying**: Make sure you have production rules

## Quick Reference

| Scenario | Read Challenges | Write Challenges | Read Scores | Write Scores |
|----------|----------------|------------------|-------------|--------------|
| Test Mode | Anyone | Anyone | Anyone | Anyone |
| Development | Anyone | No one | Anyone | Authenticated users |
| Production | Anyone | Admins only | Anyone | Users (own only) |

## Questions?

- **Q: Can I keep test mode rules if my app isn't deployed?**
  - A: Yes, but switch to read-only as soon as you've populated challenges

- **Q: What happens if I deploy with open rules?**
  - A: Anyone can modify or delete your data. Don't do this!

- **Q: How do I know if my rules are secure?**
  - A: Test them in Rules Playground and make sure only authorized users can write

- **Q: Can I modify challenges after setting read-only rules?**
  - A: Yes, via Firebase Console or Admin SDK, but not from client code

