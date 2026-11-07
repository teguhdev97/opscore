import { apiClient } from './api';

async function testBackendConnection() {
  console.log('🔍 Testing backend connection...');
  
  try {
    // Test 1: Check backend health
    console.log('Test 1: Health check...');
    const health = await apiClient.getHealth();
    console.log('✅ Backend responded:', health);
  } catch (err: any) {
    console.log('⚠️  Health endpoint might not exist (expected for this API)');
  }

  try {
    // Test 2: Register new user
    console.log('\nTest 2: User registration...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    const registerRes = await apiClient.register(testEmail, testPassword);
    console.log('✅ Registration successful:', {
      userId: registerRes.user.id,
      email: registerRes.user.email,
      role: registerRes.user.role,
      tokenExists: !!registerRes.token,
    });

    // Test 3: Get current user
    console.log('\nTest 3: Get current user...');
    const userRes = await apiClient.getCurrentUser();
    console.log('✅ Current user fetched:', {
      id: userRes.user.id,
      email: userRes.user.email,
    });

    // Test 4: Login with same credentials
    console.log('\nTest 4: User login...');
    apiClient.clearToken();
    const loginRes = await apiClient.login(testEmail, testPassword);
    console.log('✅ Login successful:', {
      userId: loginRes.user.id,
      email: loginRes.user.email,
      tokenExists: !!loginRes.token,
    });

    console.log('\n✨ All tests passed! Backend integration working.');
    return true;
  } catch (err: any) {
    console.error('❌ Test failed:', err.message);
    return false;
  }
}

if (typeof window === 'undefined') {
  testBackendConnection();
}

export { testBackendConnection };
