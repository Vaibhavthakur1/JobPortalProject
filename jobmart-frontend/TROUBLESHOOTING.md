# JobMart Registration Troubleshooting Guide

## Issue: Registration Failed

### Common Causes & Solutions

#### 1. **Backend Services Not Running** ⚠️ (Most Common)
Your Angular frontend is trying to connect to backend services that might not be running.

**Check if Identity Service is running:**
```powershell
# Check what's listening on port 5001
netstat -ano | findstr :5001

# Or test the API endpoint directly
curl -X POST http://localhost:5001/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "JobSeeker"
  }'
```

**Solution: Start your backend services**
From the JobPortalSystem root directory:
```powershell
# Run all services
.\start-all.ps1

# Or start specific service
dotnet run --project src\Services\IdentityService\IdentityService.csproj
```

#### 2. **CORS Issues**
Angular frontend on `http://localhost:4200` trying to access backend on `http://localhost:5001`.

**Solution: Enable CORS in your Identity Service**
In `IdentityService/Program.cs`:
```csharp
// Add CORS before MapControllers()
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        builder =>
        {
            builder.WithOrigins("http://localhost:4200")
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
});

// Use CORS
app.UseCors("AllowAngular");
```

#### 3. **Incorrect API Endpoint Path**
Backend endpoint might be different from `/api/auth/register`.

**Verify the correct endpoint:**
```powershell
# Check your backend API documentation
# Look at: src\Services\IdentityService\Controllers\AuthController.cs
```

**Update endpoint if needed in** `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiBaseUrls: {
    auth: 'http://localhost:5001',  // Update if different
    // ...
  },
};
```

#### 4. **Firewall Issues**
Windows Firewall blocking port 5001.

**Solution:**
```powershell
# Add firewall exception
New-NetFirewallRule -DisplayName "Allow Identity Service" `
  -Direction Inbound `
  -LocalPort 5001 `
  -Protocol TCP `
  -Action Allow
```

#### 5. **Request Body Format Issue**
Backend might expect different field names.

**Verify request format** - Check browser console:
1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. Try registering again
4. Look for logs starting with `[AuthService]`

You'll see the request being sent:
```
[AuthService] POST /api/auth/register
{
  fullName: "Vaibhav Singh",
  email: "vaibhavthakur99221@gmail.com",
  password: "...",
  role: "JobSeeker"
}
```

**If format looks wrong**, update `src/app/services/auth.service.ts` to match your backend.

---

## Debug Steps

### Step 1: Check Browser Console
1. Open DevTools (**F12**)
2. Go to **Console** tab
3. Look for `[AuthService]` logs
4. Check the actual error message from server

### Step 2: Check Network Tab
1. Open DevTools (**F12**)
2. Go to **Network** tab
3. Try registering again
4. Click the failed request
5. Check **Response** tab for error details

### Step 3: Verify Backend is Running
```powershell
# Test if Identity Service is running
Invoke-WebRequest -Uri "http://localhost:5001/api/auth/health" -ErrorAction Ignore

# Should return 200 OK if running
```

### Step 4: Check Backend Logs
Run your backend services and watch for errors:
```powershell
cd src\Services\IdentityService
dotnet run
# Watch for any error messages
```

---

## Quick Checklist

- [ ] Backend services are running (`dotnet run` or `start-all.ps1`)
- [ ] Identity Service is on `http://localhost:5001`
- [ ] CORS is enabled on backend
- [ ] Firewall is not blocking port 5001
- [ ] Browser console shows proper `[AuthService]` logs
- [ ] Network tab shows request details

---

## Frontend Console Logs

The application now logs all API requests. When you try to register, you should see:

```
[AuthService] POST /api/auth/register
{fullName: 'Vaibhav Singh', email: 'vaibhav@example.com', password: '...', role: 'JobSeeker'}
[AuthService] Response error: 504 {error: 'Service unavailable'}
```

This helps identify the exact issue!

---

## Contact Backend Team

If after all these steps the API still fails, provide them with:
1. **Exact error message** from browser console
2. **Network tab response** (copy the raw response)
3. **Request payload** that was sent
4. **Your backend logs**

This will help them debug faster!
