import axios from 'axios';

async function run() {
  try {
    // 1. Log in as Admin
    console.log('Logging in as Admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
      loginId: 'ADMIN001',
      password: 'Admin@123'
    });
    
    const { token, user } = loginResponse.data.data;
    console.log('Login successful!');
    console.log('Logged in user:', user);
    
    // 2. Call the update permissions endpoint
    console.log('\nCalling update permissions endpoint for omkar...');
    const permResponse = await axios.put(
      'http://localhost:5000/api/admin/employees/d2480654-0e7f-4d49-81dd-342f0851bf12/permissions',
      {
        permissions: ['EMPLOYEE_DASHBOARD_VIEW']
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log('API Response Status:', permResponse.status);
    console.log('API Response Data:', permResponse.data);
    
  } catch (err) {
    console.error('\nAPI Call failed!');
    if (err.response) {
      console.error('Status Code:', err.response.status);
      console.error('Error Data:', err.response.data);
    } else {
      console.error('Error Message:', err.message);
    }
  }
}

run();
